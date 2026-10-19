const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');
const { notify } = require('../helpers/notify');
const { getBrandAmbassadorPayoutPool } = require('../helpers/brandAmbassadorPay');

router.use(authenticate);

const canCreate = requirePermission('/stock/salaries', 'can_create');
const canEdit   = requirePermission('/stock/salaries', 'can_edit');
const canDelete = requirePermission('/stock/salaries', 'can_delete');

const LIST_SELECT = `
  SELECT s.*, cm.file_no AS campaign_file_no, cm.campaign_title,
         a.brand_ambassador_ref_no, a.full_name AS brand_ambassador_name,
         cur.paramater_value AS currency_name,
         pm.paramater_value  AS payment_mode_name
  FROM salaries s
  LEFT JOIN campaigns cm         ON s.campaign_id = cm.id
  LEFT JOIN brand_ambassadors a  ON s.brand_ambassador_id = a.id
  LEFT JOIN parameter_values cur ON s.currency_id = cur.id
  LEFT JOIN parameter_values pm  ON s.payment_mode_id = pm.id
`;

/* ── Preview the next file_no without consuming the serial ── */
router.get('/next-no', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.prefix, rn.next_serial, rn.padding, rn.use_year, rn.use_month
       FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       WHERE pt.process_type_name = 'salary_creation'
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

/* ── Balance owed to one brand ambassador on one campaign: their estimated
   earnings share (campaign budget * brand_ambassador_pay_percentage — the
   campaign's own override if set, else the global default — split by
   accepted views, same formula as the Campaigns > Brand Ambassadors tab)
   minus what they've already been paid via this same table. Used to prefill
   the Amount field on the Salary form. ── */
router.get('/balance', async (req, res, next) => {
  try {
    const { campaign_id, brand_ambassador_id } = req.query;
    if (!campaign_id || !brand_ambassador_id) return res.status(400).json({ message: 'campaign_id and brand_ambassador_id are required' });

    const payoutPool = await getBrandAmbassadorPayoutPool(campaign_id);
    if (payoutPool == null) return res.status(404).json({ message: 'Campaign not found' });

    const [viewRows] = await pool.query(
      `SELECT ca.brand_ambassador_id,
              (SELECT COALESCE(SUM(cp.status_views), 0) FROM campaign_proofs cp
               WHERE cp.campaign_id = ca.campaign_id AND cp.brand_ambassador_id = ca.brand_ambassador_id AND cp.status = 'accepted') AS total_views
       FROM campaign_brand_ambassadors ca WHERE ca.campaign_id = ?`,
      [campaign_id]
    );
    const totalViews = viewRows.reduce((sum, r) => sum + Number(r.total_views || 0), 0);
    const mine = viewRows.find(r => String(r.brand_ambassador_id) === String(brand_ambassador_id));
    const revenue = mine && totalViews > 0 ? payoutPool * (Number(mine.total_views || 0) / totalViews) : 0;

    const [[{ paid_amount }]] = await pool.query(
      'SELECT COALESCE(SUM(amount),0) AS paid_amount FROM salaries WHERE campaign_id=? AND brand_ambassador_id=?',
      [campaign_id, brand_ambassador_id]
    );
    res.json({ revenue, paid_amount: Number(paid_amount), balance: revenue - Number(paid_amount) });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const campaignFilter = req.query.campaign_id ? 'AND s.campaign_id=?' : '';
    const campaignParam = req.query.campaign_id ? [req.query.campaign_id] : [];
    const [rows] = await pool.query(
      `${LIST_SELECT}
       WHERE (s.file_no LIKE ? OR cm.campaign_title LIKE ? OR a.full_name LIKE ? OR s.reference LIKE ?) ${campaignFilter}
       ORDER BY s.created_on DESC LIMIT ? OFFSET ?`,
      [search, search, search, search, ...campaignParam, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM salaries s
       LEFT JOIN campaigns cm ON s.campaign_id = cm.id
       LEFT JOIN brand_ambassadors a ON s.brand_ambassador_id = a.id
       WHERE (s.file_no LIKE ? OR cm.campaign_title LIKE ? OR a.full_name LIKE ? OR s.reference LIKE ?) ${campaignFilter}`,
      [search, search, search, search, ...campaignParam]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${LIST_SELECT} WHERE s.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { campaign_id, brand_ambassador_id, currency_id, payment_mode_id, amount, reference, payment_date, comments } = req.body;
    if (!campaign_id) return res.status(400).json({ message: 'Campaign is required' });
    if (!brand_ambassador_id) return res.status(400).json({ message: 'Brand Ambassador is required' });
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    const [[assigned]] = await pool.query(
      'SELECT 1 FROM campaign_brand_ambassadors WHERE campaign_id=? AND brand_ambassador_id=?', [campaign_id, brand_ambassador_id]
    );
    if (!assigned) return res.status(400).json({ message: 'This brand ambassador is not assigned to that campaign' });

    const file_no = await generateRefNo('salary_creation');
    const [result] = await pool.query(
      `INSERT INTO salaries
         (file_no, campaign_id, brand_ambassador_id, currency_id, payment_mode_id, amount, reference, payment_date, paid_by, comments, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [file_no, campaign_id, brand_ambassador_id, currency_id || null, payment_mode_id || null, amount,
       reference || null, payment_date || null, req.user.id, comments || null, req.user.id]
    );
    const [rows] = await pool.query(`${LIST_SELECT} WHERE s.id=?`, [result.insertId]);
    const saved = rows[0];

    await notify('brand_ambassador', saved.brand_ambassador_id, 'salary_paid', {
      title: 'Salary payment recorded',
      body: `A payment of ${Number(saved.amount).toLocaleString()} was recorded for "${saved.campaign_title}".`,
      url: '/brand-ambassador/campaigns',
    });

    res.status(201).json(saved);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { campaign_id, brand_ambassador_id, currency_id, payment_mode_id, amount, reference, payment_date, comments } = req.body;
    if (!campaign_id) return res.status(400).json({ message: 'Campaign is required' });
    if (!brand_ambassador_id) return res.status(400).json({ message: 'Brand Ambassador is required' });
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    await pool.query(
      `UPDATE salaries SET
         campaign_id=?, brand_ambassador_id=?, currency_id=?, payment_mode_id=?, amount=?, reference=?,
         payment_date=?, comments=?, updated_by=?
       WHERE id=?`,
      [campaign_id, brand_ambassador_id, currency_id || null, payment_mode_id || null, amount,
       reference || null, payment_date || null, comments || null, req.user.id, req.params.id]
    );
    const [rows] = await pool.query(`${LIST_SELECT} WHERE s.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM salaries WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
