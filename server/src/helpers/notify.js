const pool = require('../config/db');
const { pushTo } = require('../utils/pushNotify');

/* Catalog of every notification type this app can send, grouped by which
   portal receives it. The preferences UI in each app lists exactly the
   entries for its own audience, so this is the single source of truth for
   both "what can happen" and "what a user can opt out of". */
const NOTIFICATION_TYPES = [
  // Brand ambassador portal
  { key: 'campaign_assigned', audience: 'brand_ambassador', label: 'Assigned to a campaign',
    description: 'When you are assigned to run a new campaign.' },
  { key: 'proof_reviewed', audience: 'brand_ambassador', label: 'Posting proof reviewed',
    description: 'When a daily posting proof you submitted is accepted, rejected, or reverted.' },
  { key: 'salary_paid', audience: 'brand_ambassador', label: 'Salary payment recorded',
    description: 'When a salary payment is recorded for you.' },
  { key: 'registration_reviewed', audience: 'brand_ambassador', label: 'Registration reviewed',
    description: 'When your brand ambassador registration is approved or rejected.' },

  // Advertiser (business) portal
  { key: 'campaign_stage_changed', audience: 'advertiser', label: 'Campaign status updates',
    description: "When one of your campaigns' status changes." },
  { key: 'registration_reviewed', audience: 'advertiser', label: 'Registration reviewed',
    description: 'When your advertiser registration is approved or rejected.' },

  // MIS (staff)
  { key: 'brand_ambassador_registered', audience: 'mis', label: 'New brand ambassador registration',
    description: 'When a new brand ambassador registers and needs review.' },
  { key: 'advertiser_registered', audience: 'mis', label: 'New advertiser registration',
    description: 'When a new advertiser registers and needs review.' },
  { key: 'campaign_submitted', audience: 'mis', label: 'New campaign submitted',
    description: 'When an advertiser submits a new campaign from the portal.' },
  { key: 'proof_submitted', audience: 'mis', label: 'New posting proof submitted',
    description: 'When a brand ambassador submits a daily posting proof for review.' },
];

const typesFor = audience => NOTIFICATION_TYPES.filter(t => t.audience === audience);

/* Opt-out model: no preference row at all means both channels are enabled. A
   row only ever exists once someone has explicitly flipped a switch — either
   the in-app `enabled` flag or the `push_enabled` flag, independently. */
async function getPrefRow(audience, recipientId, type) {
  const [[row]] = await pool.query(
    'SELECT enabled, push_enabled FROM notification_preferences WHERE audience=? AND recipient_id=? AND type=?',
    [audience, recipientId, type]
  );
  return {
    enabled:      row ? !!row.enabled : true,
    push_enabled: row ? !!row.push_enabled : true,
  };
}

async function notify(audience, recipientId, type, { title, body, url } = {}) {
  try {
    if (!recipientId) return;
    const pref = await getPrefRow(audience, recipientId, type);
    if (!pref.enabled) return;
    await pool.query(
      'INSERT INTO notifications (audience, recipient_id, type, title, body, url) VALUES (?,?,?,?,?,?)',
      [audience, recipientId, type, title, body || null, url || null]
    );
    if (pref.push_enabled) {
      // Best-effort — a missing/expired subscription or a push-service error
      // must never affect the in-app notification that was just recorded.
      pushTo(audience, recipientId, { title, body, url, tag: type })
        .catch(err => console.error('pushTo() failed:', err.message));
    }
  } catch (err) {
    // A notification failing to send should never break the action that
    // triggered it (assigning a campaign, reviewing a proof, ...).
    console.error('notify() failed:', err.message);
  }
}

/* Fan out one MIS notification to every active Super Admin / Admin user. */
async function notifyAdmins(type, payload) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT u.id FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       WHERE ur.role_id IN (1,2) AND u.status = 'active'`
    );
    await Promise.all(rows.map(r => notify('mis', r.id, type, payload)));
  } catch (err) {
    console.error('notifyAdmins() failed:', err.message);
  }
}

async function listNotifications(audience, recipientId, { limit = 20 } = {}) {
  const [rows] = await pool.query(
    'SELECT * FROM notifications WHERE audience=? AND recipient_id=? ORDER BY created_on DESC LIMIT ?',
    [audience, recipientId, limit]
  );
  const [[{ unread }]] = await pool.query(
    'SELECT COUNT(*) AS unread FROM notifications WHERE audience=? AND recipient_id=? AND is_read=0',
    [audience, recipientId]
  );
  return { rows, unread };
}

async function markRead(audience, recipientId, id) {
  await pool.query(
    'UPDATE notifications SET is_read=1 WHERE audience=? AND recipient_id=? AND id=?',
    [audience, recipientId, id]
  );
}

async function markAllRead(audience, recipientId) {
  await pool.query(
    'UPDATE notifications SET is_read=1 WHERE audience=? AND recipient_id=?',
    [audience, recipientId]
  );
}

async function getPreferences(audience, recipientId) {
  const [rows] = await pool.query(
    'SELECT type, enabled, push_enabled FROM notification_preferences WHERE audience=? AND recipient_id=?',
    [audience, recipientId]
  );
  const overrides = Object.fromEntries(rows.map(r => [r.type, { enabled: !!r.enabled, push_enabled: !!r.push_enabled }]));
  return typesFor(audience).map(t => ({
    ...t,
    enabled:      overrides[t.key]?.enabled ?? true,
    push_enabled: overrides[t.key]?.push_enabled ?? true,
  }));
}

/* `enabled`/`push_enabled` are independently optional — whichever is omitted
   keeps its current (or default) value, so a client can flip just one. */
async function setPreference(audience, recipientId, type, { enabled, push_enabled } = {}) {
  if (!typesFor(audience).some(t => t.key === type)) {
    const err = new Error('Unknown notification type for this audience');
    err.status = 400;
    throw err;
  }
  const current = await getPrefRow(audience, recipientId, type);
  const nextEnabled = enabled      !== undefined ? !!enabled      : current.enabled;
  const nextPush    = push_enabled !== undefined ? !!push_enabled : current.push_enabled;
  await pool.query(
    `INSERT INTO notification_preferences (audience, recipient_id, type, enabled, push_enabled) VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), push_enabled = VALUES(push_enabled)`,
    [audience, recipientId, type, nextEnabled ? 1 : 0, nextPush ? 1 : 0]
  );
}

/* Attaches the 5 standard notification endpoints (list, mark-one-read,
   mark-all-read, get preferences, set preference) to an already-authed
   router for one audience. `getRecipientId(req)` pulls the current user's
   id out of whatever that router already put on `req` (req.brandAmbassador.id,
   req.advertiser.id, req.user.id, ...). Mount AFTER that router's own auth
   middleware. */
function mountNotificationRoutes(router, audience, getRecipientId) {
  router.get('/notifications', async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      res.json(await listNotifications(audience, getRecipientId(req), { limit }));
    } catch (err) { next(err); }
  });

  router.post('/notifications/read-all', async (req, res, next) => {
    try {
      await markAllRead(audience, getRecipientId(req));
      res.json({ message: 'All notifications marked read' });
    } catch (err) { next(err); }
  });

  router.post('/notifications/:id/read', async (req, res, next) => {
    try {
      await markRead(audience, getRecipientId(req), req.params.id);
      res.json({ message: 'Marked read' });
    } catch (err) { next(err); }
  });

  router.get('/notification-preferences', async (req, res, next) => {
    try {
      res.json(await getPreferences(audience, getRecipientId(req)));
    } catch (err) { next(err); }
  });

  router.put('/notification-preferences', async (req, res, next) => {
    try {
      const { type, enabled, push_enabled } = req.body;
      if (!type) return res.status(400).json({ message: 'type is required' });
      await setPreference(audience, getRecipientId(req), type, { enabled, push_enabled });
      res.json(await getPreferences(audience, getRecipientId(req)));
    } catch (err) { next(err); }
  });
}

module.exports = {
  NOTIFICATION_TYPES, typesFor, notify, notifyAdmins,
  listNotifications, markRead, markAllRead, getPreferences, setPreference,
  mountNotificationRoutes,
};
