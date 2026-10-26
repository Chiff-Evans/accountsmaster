const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { fundFigures, getPortalSettings } = require('../helpers/fundSummary');

router.use(authenticate);

const canEdit = requirePermission('/config/portal-settings', 'can_edit');

// Each one independently controls a figure on the member portal's Home.
const SWITCHES = ['show_total_balance', 'show_interest', 'show_deductions'];

/* GET /api/portal-settings — the switches, plus the current figures each
   one would reveal, so staff can see exactly what members will get. */
router.get('/', async (req, res, next) => {
  try {
    const [settings, figures] = await Promise.all([getPortalSettings(), fundFigures()]);
    res.json({ ...settings, preview: figures });
  } catch (err) { next(err); }
});

/* PUT /api/portal-settings — { show_total_balance?, show_interest?, show_deductions? };
   only the switches sent are changed. */
router.put('/', canEdit, async (req, res, next) => {
  try {
    const fields = [];
    const params = [];
    for (const key of SWITCHES) {
      if (key in req.body) { fields.push(`${key}=?`); params.push(req.body[key] ? 1 : 0); }
    }
    if (!fields.length) return res.status(400).json({ message: 'Nothing to update' });
    // The row is created by the migration; upsert keeps this safe if it was removed.
    await pool.query(
      `INSERT INTO portal_settings (id, ${SWITCHES.join(', ')}, updated_by)
       VALUES (1, ${SWITCHES.map(() => '?').join(', ')}, ?)
       ON DUPLICATE KEY UPDATE ${fields.join(', ')}, updated_by=?`,
      [...SWITCHES.map(k => (req.body[k] ? 1 : 0)), req.user.id, ...params, req.user.id]
    );
    const [settings, figures] = await Promise.all([getPortalSettings(), fundFigures()]);
    res.json({ ...settings, preview: figures });
  } catch (err) { next(err); }
});

module.exports = router;
