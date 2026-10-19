const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');

router.use(authenticate);

const canCreate = requirePermission('/stock/expenditure', 'can_create');
const canEdit   = requirePermission('/stock/expenditure', 'can_edit');
const canDelete = requirePermission('/stock/expenditure', 'can_delete');

const LIST_SELECT = `
  SELECT e.*, cm.file_no AS campaign_file_no, cm.campaign_title,
         et.paramater_value AS expenditure_type_name,
         cur.paramater_value AS currency_name
  FROM expenditure e
  LEFT JOIN campaigns cm         ON e.campaign_id = cm.id
  LEFT JOIN parameter_values et  ON e.expenditure_type_id = et.id
  LEFT JOIN parameter_values cur ON e.currency_id = cur.id
`;

/* ── Preview the next file_no without consuming the serial ── */
router.get('/next-no', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.prefix, rn.next_serial, rn.padding, rn.use_year, rn.use_month
       FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       WHERE pt.process_type_name = 'expenditure_creation'
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

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const campaignFilter = req.query.campaign_id ? 'AND e.campaign_id=?' : '';
    const campaignParam = req.query.campaign_id ? [req.query.campaign_id] : [];
    const [rows] = await pool.query(
      `${LIST_SELECT}
       WHERE (e.file_no LIKE ? OR cm.campaign_title LIKE ? OR e.reference LIKE ?) ${campaignFilter}
       ORDER BY e.created_on DESC LIMIT ? OFFSET ?`,
      [search, search, search, ...campaignParam, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM expenditure e
       LEFT JOIN campaigns cm ON e.campaign_id = cm.id
       WHERE (e.file_no LIKE ? OR cm.campaign_title LIKE ? OR e.reference LIKE ?) ${campaignFilter}`,
      [search, search, search, ...campaignParam]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${LIST_SELECT} WHERE e.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { campaign_id, expenditure_type_id, currency_id, amount, reference, expenditure_date, comments } = req.body;
    if (!campaign_id) return res.status(400).json({ message: 'Campaign is required' });
    if (!expenditure_type_id) return res.status(400).json({ message: 'Expenditure type is required' });
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    const file_no = await generateRefNo('expenditure_creation');
    const [result] = await pool.query(
      `INSERT INTO expenditure
         (file_no, campaign_id, expenditure_type_id, currency_id, amount, reference, expenditure_date, done_by, comments, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [file_no, campaign_id, expenditure_type_id, currency_id || null, amount,
       reference || null, expenditure_date || null, req.user.id, comments || null, req.user.id]
    );
    const [rows] = await pool.query(`${LIST_SELECT} WHERE e.id=?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { campaign_id, expenditure_type_id, currency_id, amount, reference, expenditure_date, comments } = req.body;
    if (!campaign_id) return res.status(400).json({ message: 'Campaign is required' });
    if (!expenditure_type_id) return res.status(400).json({ message: 'Expenditure type is required' });
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    await pool.query(
      `UPDATE expenditure SET
         campaign_id=?, expenditure_type_id=?, currency_id=?, amount=?, reference=?,
         expenditure_date=?, comments=?, updated_by=?
       WHERE id=?`,
      [campaign_id, expenditure_type_id, currency_id || null, amount,
       reference || null, expenditure_date || null, comments || null, req.user.id, req.params.id]
    );
    const [rows] = await pool.query(`${LIST_SELECT} WHERE e.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM expenditure WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
