const router = require('express').Router();
const pool   = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/* GET /api/brand-ambassador-config — current settings */
router.get('/', async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM brand_ambassador_config WHERE id = 1');
    res.json(row || { min_avg_status_views: 0, max_proof_resubmissions: 3, brand_ambassador_pay_percentage: 0 });
  } catch (err) { next(err); }
});

/* PUT /api/brand-ambassador-config — save settings */
router.put('/', async (req, res, next) => {
  try {
    const { min_avg_status_views, max_proof_resubmissions, brand_ambassador_pay_percentage } = req.body;
    await pool.query(
      `INSERT INTO brand_ambassador_config (id, min_avg_status_views, max_proof_resubmissions, brand_ambassador_pay_percentage) VALUES (1, ?, ?, ?)
       ON DUPLICATE KEY UPDATE min_avg_status_views = VALUES(min_avg_status_views),
         max_proof_resubmissions = VALUES(max_proof_resubmissions),
         brand_ambassador_pay_percentage = VALUES(brand_ambassador_pay_percentage), updated_at = CURRENT_TIMESTAMP`,
      [Number(min_avg_status_views) || 0, Number(max_proof_resubmissions) || 0, Number(brand_ambassador_pay_percentage) || 0]
    );
    const [[row]] = await pool.query('SELECT * FROM brand_ambassador_config WHERE id = 1');
    res.json(row);
  } catch (err) { next(err); }
});

module.exports = router;
