const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');
const { maybeAwardLoyaltyPoints } = require('../helpers/loyalty');

/* A payment that pushes a campaign's total paid over the loyalty threshold
   should trigger the award too, not just a workflow stage transition. */
async function awardLoyaltyForPayment({ advertiser_id, campaign_id }) {
  try {
    if (!campaign_id) return;
    const [[campaign]] = await pool.query(
      'SELECT id, advertiser_id, workflow_stage_id FROM campaigns WHERE id=? AND advertiser_id=?',
      [campaign_id, advertiser_id]
    );
    if (campaign) await maybeAwardLoyaltyPoints(campaign);
  } catch (err) {
    console.error('Loyalty points error:', err.message);
  }
}

router.use(authenticate);

const canCreate = requirePermission('/stock/payments', 'can_create');
const canEdit   = requirePermission('/stock/payments', 'can_edit');
const canDelete = requirePermission('/stock/payments', 'can_delete');

const LIST_SELECT = `
  SELECT p.*, cm.file_no AS campaign_file_no, cm.campaign_title,
         COALESCE(c.advertiser_name, CONCAT(c.firstname,' ',c.lastname)) AS advertiser_name,
         cur.paramater_value AS currency_name,
         pm.paramater_value  AS payment_mode_name
  FROM payments p
  LEFT JOIN campaigns cm          ON p.campaign_id = cm.id
  LEFT JOIN advertisers c         ON p.advertiser_id = c.id
  LEFT JOIN parameter_values cur  ON p.currency_id = cur.id
  LEFT JOIN parameter_values pm   ON p.payment_mode_id = pm.id
`;

/* ── Preview the next file_no without consuming the serial ── */
router.get('/next-no', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.prefix, rn.next_serial, rn.padding, rn.use_year, rn.use_month
       FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       WHERE pt.process_type_name = 'payment_creation'
       LIMIT 1`
    );
    if (!rows.length) return res.json({ file_no: null });
    const cfg = rows[0];
    const padded = String(cfg.next_serial).padStart(cfg.padding, '0');
    const now = new Date();
    const year  = cfg.use_year  ? `-${now.getFullYear()}` : '';
    const month = cfg.use_month ? `-${String(now.getMonth() + 1).padStart(2, '0')}` : '';
    const sep = /[/-]$/.test(cfg.prefix) ? '' : '-';
    res.json({ file_no: `${cfg.prefix}${year}${month}${sep}${padded}` });
  } catch (err) { next(err); }
});

/* ── Balance owed for a campaign: budget - discount - sum(payments) — used
   by the "Record Payment" action on Campaigns to prefill the amount
   (same formula as the Balance column on the Campaigns grid). ── */
router.get('/campaign-balance/:campaign_id', async (req, res, next) => {
  try {
    const [[campaign]] = await pool.query(
      'SELECT id, advertiser_id, budget, discount FROM campaigns WHERE id=?', [req.params.campaign_id]
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    const [[{ paid_amount }]] = await pool.query(
      'SELECT COALESCE(SUM(amount),0) AS paid_amount FROM payments WHERE campaign_id=?', [req.params.campaign_id]
    );
    const budget = Number(campaign.budget || 0);
    const discount = Number(campaign.discount || 0);
    res.json({
      campaign_id: campaign.id, advertiser_id: campaign.advertiser_id, budget, discount,
      paid_amount: Number(paid_amount), balance: budget - discount - Number(paid_amount),
    });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const campaignFilter = req.query.campaign_id ? 'AND p.campaign_id=?' : '';
    const campaignParam = req.query.campaign_id ? [req.query.campaign_id] : [];
    const [rows] = await pool.query(
      `${LIST_SELECT}
       WHERE (p.file_no LIKE ? OR cm.campaign_title LIKE ? OR COALESCE(c.advertiser_name, CONCAT(c.firstname,' ',c.lastname)) LIKE ? OR p.reference LIKE ?) ${campaignFilter}
       ORDER BY p.created_on DESC LIMIT ? OFFSET ?`,
      [search, search, search, search, ...campaignParam, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM payments p
       LEFT JOIN campaigns cm ON p.campaign_id = cm.id
       LEFT JOIN advertisers c ON p.advertiser_id = c.id
       WHERE (p.file_no LIKE ? OR cm.campaign_title LIKE ? OR COALESCE(c.advertiser_name, CONCAT(c.firstname,' ',c.lastname)) LIKE ? OR p.reference LIKE ?) ${campaignFilter}`,
      [search, search, search, search, ...campaignParam]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${LIST_SELECT} WHERE p.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { campaign_id, advertiser_id, currency_id, payment_mode_id, amount, reference, payment_date, comments } = req.body;
    if (!campaign_id) return res.status(400).json({ message: 'Campaign is required' });
    if (!advertiser_id) return res.status(400).json({ message: 'Advertiser is required' });
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    const file_no = await generateRefNo('payment_creation');
    const [result] = await pool.query(
      `INSERT INTO payments
         (file_no, campaign_id, advertiser_id, currency_id, payment_mode_id, amount, reference, payment_date, received_by, comments, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [file_no, campaign_id, advertiser_id, currency_id || null, payment_mode_id || null, amount,
       reference || null, payment_date || null, req.user.id, comments || null, req.user.id]
    );
    await awardLoyaltyForPayment({ advertiser_id, campaign_id });

    const [rows] = await pool.query(`${LIST_SELECT} WHERE p.id=?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { campaign_id, advertiser_id, currency_id, payment_mode_id, amount, reference, payment_date, comments } = req.body;
    if (!campaign_id) return res.status(400).json({ message: 'Campaign is required' });
    if (!advertiser_id) return res.status(400).json({ message: 'Advertiser is required' });
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    await pool.query(
      `UPDATE payments SET
         campaign_id=?, advertiser_id=?, currency_id=?, payment_mode_id=?, amount=?, reference=?,
         payment_date=?, comments=?, updated_by=?
       WHERE id=?`,
      [campaign_id, advertiser_id, currency_id || null, payment_mode_id || null, amount,
       reference || null, payment_date || null, comments || null, req.user.id, req.params.id]
    );
    await awardLoyaltyForPayment({ advertiser_id, campaign_id });

    const [rows] = await pool.query(`${LIST_SELECT} WHERE p.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM payments WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
