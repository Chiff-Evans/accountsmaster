const router = require('express').Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const SECTION_KEYS = [
  'stat_campaigns', 'stat_revenue', 'stat_expenditure',
  'stat_members', 'stat_brand_ambassadors',
  'chart_trend', 'chart_pipeline', 'chart_top_campaigns', 'chart_recent_campaigns',
];

router.use(authenticate);

// Must be before /:roleId to avoid "me" being captured as a param
router.get('/me', async (req, res, next) => {
  try {
    const roleIds = req.user.roles;
    if (!roleIds?.length) return res.json(Object.fromEntries(SECTION_KEYS.map(k => [k, true])));

    const placeholders = roleIds.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT section_key, MAX(is_visible) AS is_visible FROM dashboard_visibility
       WHERE role_id IN (${placeholders}) GROUP BY section_key`,
      roleIds
    );

    const map = Object.fromEntries(rows.map(r => [r.section_key, !!r.is_visible]));
    // Default true for any section not yet configured
    const result = Object.fromEntries(SECTION_KEYS.map(k => [k, k in map ? map[k] : true]));
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const [roles] = await pool.query('SELECT id, role_name FROM roles ORDER BY role_name');
    const [rows] = await pool.query('SELECT role_id, section_key, is_visible FROM dashboard_visibility');

    const map = {};
    rows.forEach(r => {
      if (!map[r.role_id]) map[r.role_id] = {};
      map[r.role_id][r.section_key] = !!r.is_visible;
    });

    const result = roles.map(role => ({
      ...role,
      sections: Object.fromEntries(SECTION_KEYS.map(k => [k, map[role.id]?.[k] ?? true])),
    }));
    res.json(result);
  } catch (err) { next(err); }
});

router.put('/:roleId', async (req, res, next) => {
  try {
    const { sections } = req.body;
    const roleId = parseInt(req.params.roleId);

    for (const [key, visible] of Object.entries(sections)) {
      if (!SECTION_KEYS.includes(key)) continue;
      await pool.query(
        `INSERT INTO dashboard_visibility (role_id, section_key, is_visible) VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE is_visible = VALUES(is_visible)`,
        [roleId, key, visible ? 1 : 0]
      );
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
