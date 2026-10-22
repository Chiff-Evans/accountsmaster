const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');
const { notify } = require('../helpers/notify');
const { coverPeriod, unitOf, dayAfter } = require('../helpers/contributionPeriod');

router.use(authenticate);

const canCreate = requirePermission('/transactions', 'can_create');
const canEdit   = requirePermission('/transactions', 'can_edit');
const canDelete = requirePermission('/transactions', 'can_delete');

// Dates come back as plain YYYY-MM-DD strings so the client never shifts
// them across a timezone boundary.
const LIST_SELECT = `
  SELECT t.id, t.file_no, t.member_id, t.transaction_type_id, t.amount, t.other_details,
         DATE_FORMAT(t.from_date, '%Y-%m-%d')        AS from_date,
         DATE_FORMAT(t.to_date, '%Y-%m-%d')          AS to_date,
         DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
         t.created_on, t.updated_on,
         m.member_name, m.member_ref_no,
         tt.paramater_value AS transaction_type_name
  FROM transactions t
  LEFT JOIN members m           ON t.member_id = m.id
  LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id
`;

const SEARCH_WHERE = `(t.file_no LIKE ? OR m.member_name LIKE ? OR m.member_ref_no LIKE ? OR t.other_details LIKE ?)`;

/* ── Suggested From/To dates for a deposit ──
   GET /transactions/period-suggestion?member_id=[&amount=][&exclude_id=]
     from_date = day after the member's latest To Date on another transaction;
                 with none yet, their Reg Date, else the active rate's start.
                 Needs only the member, so the form can fill it on selection.
     to_date   = only when `amount` is given: how far it carries them at the
                 active contribution rate (see helpers/contributionPeriod.js)
   exclude_id leaves out the transaction being edited, so editing one doesn't
   chain off itself. Always 200 with `available: false` + `reason` when a
   date can't be worked out (from_date is still returned when it could be),
   so the form can say why instead of erroring. */
router.get('/period-suggestion', async (req, res, next) => {
  try {
    const memberId = parseInt(req.query.member_id);
    const hasAmount = req.query.amount !== undefined && req.query.amount !== '';
    const amount = Number(req.query.amount);
    const excludeId = parseInt(req.query.exclude_id) || 0;
    if (!memberId) return res.status(400).json({ message: 'member_id is required' });
    if (hasAmount && !(amount > 0)) return res.status(400).json({ message: 'amount must be greater than zero' });

    const [[member]] = await pool.query(
      `SELECT DATE_FORMAT(reg_date, '%Y-%m-%d') AS reg_date FROM members WHERE id = ?`, [memberId]
    );
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const [[rate]] = await pool.query(
      `SELECT cr.id, cr.amount, tu.paramater_value AS time_unit_name,
              DATE_FORMAT(cr.start_date, '%Y-%m-%d') AS start_date,
              DATE_FORMAT(cr.end_date, '%Y-%m-%d')   AS end_date
       FROM contribution_rates cr
       LEFT JOIN parameter_values tu ON cr.time_unit_id = tu.id
       WHERE cr.is_active = 1 LIMIT 1`
    );
    const [[last]] = await pool.query(
      `SELECT DATE_FORMAT(MAX(t.to_date), '%Y-%m-%d') AS last_to_date
       FROM transactions t
       WHERE t.member_id = ? AND t.to_date IS NOT NULL AND t.id <> ?`,
      [memberId, excludeId]
    );

    // ── Start date: needs only the member (the rate is just the last fallback)
    let fromDate = null, basis = null;
    if (last?.last_to_date) { fromDate = dayAfter(last.last_to_date); basis = 'last_transaction'; }
    else if (member.reg_date) { fromDate = member.reg_date; basis = 'reg_date'; }
    else if (rate) { fromDate = rate.start_date; basis = 'rate_start'; }

    const base = { from_date: fromDate, basis, last_to_date: last?.last_to_date || null };
    const NO_RATE = 'No active contribution rate — set one in Configurations → Contribution Rates.';

    if (!fromDate) return res.json({ ...base, available: false, reason: `This member has no earlier cover or registration date, and ${NO_RATE.charAt(0).toLowerCase()}${NO_RATE.slice(1)}` });
    if (!hasAmount) return res.json({ ...base, available: true, to_date: null });

    // ── End date: needs the amount and the active rate
    if (!rate) return res.json({ ...base, available: false, reason: NO_RATE });
    const unit = unitOf(rate.time_unit_name);
    if (!unit) return res.json({ ...base, available: false, reason: `The active rate's time unit "${rate.time_unit_name}" isn't a year, month, week or day.` });

    const period = coverPeriod(fromDate, amount, rate.amount, unit);
    const warnings = [];
    if (!period.to_date) warnings.push('This amount covers less than one day at the active rate.');
    if (rate.end_date && period.to_date && period.to_date > rate.end_date) {
      warnings.push(`This runs past the active rate's end date (${rate.end_date}).`);
    }

    res.json({
      ...base,
      available: true,
      to_date: period.to_date,
      units: period.units,
      days_covered: period.days_covered,
      rate: { id: rate.id, amount: Number(rate.amount), time_unit_name: rate.time_unit_name, unit,
              start_date: rate.start_date, end_date: rate.end_date },
      warnings,
    });
  } catch (err) { next(err); }
});

/* ── Preview the next file_no without consuming the serial ── */
router.get('/next-no', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.prefix, rn.next_serial, rn.padding, rn.use_year, rn.use_month
       FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       WHERE pt.process_type_name = 'transaction_creation'
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
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const filters = [];
    const filterParams = [];
    if (req.query.member_id)           { filters.push('t.member_id=?');           filterParams.push(req.query.member_id); }
    if (req.query.transaction_type_id) { filters.push('t.transaction_type_id=?'); filterParams.push(req.query.transaction_type_id); }
    const extra = filters.length ? ` AND ${filters.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `${LIST_SELECT}
       WHERE ${SEARCH_WHERE}${extra}
       ORDER BY t.transaction_date DESC, t.id DESC LIMIT ? OFFSET ?`,
      [search, search, search, search, ...filterParams, limit, offset]
    );
    const [[{ total, total_amount }]] = await pool.query(
      `SELECT COUNT(*) AS total, COALESCE(SUM(t.amount),0) AS total_amount FROM transactions t
       LEFT JOIN members m ON t.member_id = m.id
       WHERE ${SEARCH_WHERE}${extra}`,
      [search, search, search, search, ...filterParams]
    );
    res.json({ data: rows, total, total_amount: Number(total_amount), page, limit });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${LIST_SELECT} WHERE t.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

function validate(body) {
  const { member_id, amount, transaction_date, from_date, to_date } = body;
  if (!member_id) return 'Member is required';
  if (amount === undefined || amount === null || amount === '') return 'Amount is required';
  if (Number(amount) <= 0) return 'Amount must be greater than zero';
  if (!transaction_date) return 'Transaction date is required';
  if (from_date && to_date && from_date > to_date) return 'From Date cannot be after To Date';
  return null;
}

router.post('/', canCreate, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    const { member_id, transaction_type_id, amount, from_date, to_date, transaction_date, other_details } = req.body;

    const file_no = await generateRefNo('transaction_creation');
    const [result] = await pool.query(
      `INSERT INTO transactions
         (file_no, member_id, transaction_type_id, amount, from_date, to_date, transaction_date, other_details, created_by)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [file_no, member_id, transaction_type_id || null, amount, from_date || null, to_date || null,
       transaction_date, other_details || null, req.user.id]
    );
    const [rows] = await pool.query(`${LIST_SELECT} WHERE t.id=?`, [result.insertId]);
    const tx = rows[0];

    // Let the member see it in their portal (bell + push, per their preferences).
    const amountText = Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
    await notify('member', tx.member_id, 'transaction_recorded', {
      title: `${tx.transaction_type_name || 'Transaction'} of KES ${amountText} recorded`,
      body: `${tx.file_no ? `${tx.file_no} · ` : ''}Dated ${tx.transaction_date}.`,
      url: '/transactions',
    });

    res.status(201).json(tx);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    const { member_id, transaction_type_id, amount, from_date, to_date, transaction_date, other_details } = req.body;

    const [result] = await pool.query(
      `UPDATE transactions SET
         member_id=?, transaction_type_id=?, amount=?, from_date=?, to_date=?, transaction_date=?,
         other_details=?, updated_by=?
       WHERE id=?`,
      [member_id, transaction_type_id || null, amount, from_date || null, to_date || null,
       transaction_date, other_details || null, req.user.id, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
    const [rows] = await pool.query(`${LIST_SELECT} WHERE t.id=?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
