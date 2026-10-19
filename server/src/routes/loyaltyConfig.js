const router = require('express').Router();
const pool   = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/* GET /api/loyalty-config — current settings */
router.get('/', async (req, res, next) => {
  try {
    const [[row]] = await pool.query(
      `SELECT lc.*, ws.stage_name
       FROM loyalty_config lc
       LEFT JOIN workflow_stages ws ON ws.id = lc.qualifying_stage_id
       WHERE lc.id = 1`
    );
    res.json(row || {});
  } catch (err) { next(err); }
});

/* GET /api/loyalty-config/stages — all workflow stages for the dropdown */
router.get('/stages', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT ws.id, ws.stage_name, ws.stage_color, w.process_type_id,
              pt.process_type_name
       FROM workflow_stages ws
       JOIN workflows w ON ws.workflow_id = w.id AND w.is_active = 1
       LEFT JOIN process_types pt ON pt.id = w.process_type_id
       ORDER BY pt.process_type_name, ws.stage_order`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

/* PUT /api/loyalty-config — save settings */
router.put('/', async (req, res, next) => {
  try {
    const { min_sale_amount, amount_per_point, qualifying_stage_id, is_active } = req.body;

    await pool.query(
      `INSERT INTO loyalty_config (id, min_sale_amount, amount_per_point, qualifying_stage_id, is_active)
       VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         min_sale_amount     = VALUES(min_sale_amount),
         amount_per_point    = VALUES(amount_per_point),
         qualifying_stage_id = VALUES(qualifying_stage_id),
         is_active           = VALUES(is_active),
         updated_at          = CURRENT_TIMESTAMP`,
      [
        Number(min_sale_amount) || 0,
        Number(amount_per_point) || 1,
        qualifying_stage_id || null,
        is_active ? 1 : 0,
      ]
    );

    const [[row]] = await pool.query(
      `SELECT lc.*, ws.stage_name
       FROM loyalty_config lc
       LEFT JOIN workflow_stages ws ON ws.id = lc.qualifying_stage_id
       WHERE lc.id = 1`
    );
    res.json(row);
  } catch (err) { next(err); }
});

module.exports = router;
