const webpush = require('web-push');
const pool    = require('../config/db');

webpush.setVapidDetails(
  process.env.VAPID_MAILTO  || 'mailto:admin@accountsmaster.local',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to every active subscription for a given
 * (audience, recipientId) — e.g. ('member', 7), ('mis', 1). opts: { title, body, url, tag }
 */
async function pushTo(audience, recipientId, { title, body, url = '/', tag = 'sm-update' }) {
  if (!process.env.VAPID_PUBLIC_KEY || !recipientId) return;

  const [rows] = await pool.query(
    'SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE audience = ? AND recipient_id = ? AND is_active = 1',
    [audience, recipientId]
  );
  if (!rows.length) return;

  const payload = JSON.stringify({ title, body, url, tag });

  await Promise.allSettled(
    rows.map(async row => {
      const sub = { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } };
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pool.query('UPDATE push_subscriptions SET is_active = 0 WHERE id = ?', [row.id]);
        }
      }
    })
  );
}

/* Attaches the 3 standard push endpoints (vapid key, subscribe, unsubscribe)
   to an already-mounted router for one audience. `requireAuth` is applied to
   subscribe/unsubscribe only — pass a pass-through `(req,res,next)=>next()`
   if the router already requires auth for everything it serves. */
function mountPushRoutes(router, audience, getRecipientId, requireAuth) {
  router.get('/push/vapid-key', (req, res) => {
    const key = process.env.VAPID_PUBLIC_KEY;
    if (!key) return res.status(503).json({ message: 'Push notifications not configured' });
    res.json({ publicKey: key });
  });

  router.post('/push/subscribe', requireAuth, async (req, res, next) => {
    try {
      const { endpoint, keys } = req.body;
      if (!endpoint || !keys?.p256dh || !keys?.auth)
        return res.status(400).json({ message: 'Invalid subscription object' });

      await pool.query(
        `INSERT INTO push_subscriptions (audience, recipient_id, endpoint, p256dh, auth, is_active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           audience     = VALUES(audience),
           recipient_id = VALUES(recipient_id),
           p256dh       = VALUES(p256dh),
           auth         = VALUES(auth),
           is_active    = 1`,
        [audience, getRecipientId(req), endpoint, keys.p256dh, keys.auth]
      );
      res.json({ message: 'Subscribed' });
    } catch (err) { next(err); }
  });

  router.delete('/push/unsubscribe', requireAuth, async (req, res, next) => {
    try {
      const { endpoint } = req.body;
      const recipientId = getRecipientId(req);
      if (endpoint) {
        await pool.query(
          'UPDATE push_subscriptions SET is_active = 0 WHERE audience = ? AND recipient_id = ? AND endpoint = ?',
          [audience, recipientId, endpoint]
        );
      } else {
        await pool.query(
          'UPDATE push_subscriptions SET is_active = 0 WHERE audience = ? AND recipient_id = ?',
          [audience, recipientId]
        );
      }
      res.json({ message: 'Unsubscribed' });
    } catch (err) { next(err); }
  });
}

module.exports = { pushTo, mountPushRoutes };
