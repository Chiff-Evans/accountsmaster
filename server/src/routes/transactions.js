const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');
const { notify } = require('../helpers/notify');
const { encodeId } = require('../utils/hashids');
const { coverPeriod, unitOf, dayAfter } = require('../helpers/contributionPeriod');
const { recalcMemberLedger, creditBroughtForwardCents, isDepositTypeId } = require('../helpers/contributionLedger');

router.use(authenticate);

const canCreate = requirePermission('/transactions', 'can_create');
const canEdit   = requirePermission('/transactions', 'can_edit');
const canDelete = requirePermission('/transactions', 'can_delete');

// Dates come back as plain YYYY-MM-DD strings so the client never shifts
// them across a timezone boundary.
const LIST_SELECT = `
  SELECT t.id, t.file_no, t.member_id, t.transaction_type_id, t.amount, t.other_details, t.is_migrated,
         DATE_FORMAT(t.from_date, '%Y-%m-%d')        AS from_date,
         DATE_FORMAT(t.to_date, '%Y-%m-%d')          AS to_date,
         DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
         t.rate_id, t.rate_amount, t.rate_unit,
         t.credit_brought_forward, t.cover_value, t.credit_carried_forward,
         t.created_on, t.updated_on,
         m.member_name, m.member_ref_no,
         tt.paramater_value AS transaction_type_name
  FROM transactions t
  LEFT JOIN members m           ON t.member_id = m.id
  LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id
`;

const SEARCH_WHERE = `(t.file_no LIKE ? OR m.member_name LIKE ? OR m.member_ref_no LIKE ? OR t.other_details LIKE ?)`;

/* ── Which contribution rate prices a transaction ──
   A transaction that already recorded a rate (rate_id + its amount/unit
   snapshot) keeps it for good — when it's edited, that same rate is used
   even if another rate is active now, or the rate was since changed or
   deleted. Anything else (a new transaction, or an old one recorded before
   rates existed) uses the active rate. Shared by the dates preview and the
   save so the two can never disagree.
   Returns { id, amount, unit, time_unit_name, start_date, end_date, source }
   (source 'recorded' | 'active') or null when there's no usable rate. */
const RATE_SELECT = `
  SELECT cr.id, cr.amount, tu.paramater_value AS time_unit_name,
         DATE_FORMAT(cr.start_date, '%Y-%m-%d') AS start_date,
         DATE_FORMAT(cr.end_date, '%Y-%m-%d')   AS end_date
  FROM contribution_rates cr
  LEFT JOIN parameter_values tu ON cr.time_unit_id = tu.id`;

const UNIT_LABEL = { year: 'Year', month: 'Month', week: 'Week', day: 'Day' };

async function rateForTransaction(conn, existing) {
  if (existing && (existing.rate_id || existing.rate_amount != null)) {
    const [[row]] = existing.rate_id
      ? await conn.query(`${RATE_SELECT} WHERE cr.id = ?`, [existing.rate_id])
      : [[null]];
    // The snapshot is what was actually charged; the rate row (if it still
    // exists) only supplies its name and dates for display.
    const amount = existing.rate_amount != null ? Number(existing.rate_amount) : Number(row?.amount);
    const unit = existing.rate_unit || unitOf(row?.time_unit_name);
    if (amount > 0 && unit) {
      return {
        id: existing.rate_id || null, amount, unit,
        time_unit_name: row?.time_unit_name || UNIT_LABEL[unit],
        start_date: row?.start_date || null, end_date: row?.end_date || null,
        source: 'recorded',
      };
    }
  }
  const [[active]] = await conn.query(`${RATE_SELECT} WHERE cr.is_active = 1 LIMIT 1`);
  const unit = active && unitOf(active.time_unit_name);
  if (!unit) return null;
  return { ...active, amount: Number(active.amount), unit, source: 'active' };
}

/* ── Suggested From/To dates for a deposit ──
   GET /transactions/period-suggestion?member_id=[&amount=][&exclude_id=][&from_date=]
     from_date = the from_date passed in, when staff typed their own start;
                 otherwise the day after the member's latest To Date on another
                 transaction; with none yet, their Reg Date, else the active
                 rate's start. Needs only the member, so the form can fill it
                 on selection.
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
    const enteredFrom = req.query.from_date || null;
    if (!memberId) return res.status(400).json({ message: 'member_id is required' });
    if (enteredFrom && !/^\d{4}-\d{2}-\d{2}$/.test(enteredFrom)) return res.status(400).json({ message: 'from_date must be YYYY-MM-DD' });
    if (hasAmount && !(amount > 0)) return res.status(400).json({ message: 'amount must be greater than zero' });

    const [[member]] = await pool.query(
      `SELECT DATE_FORMAT(reg_date, '%Y-%m-%d') AS reg_date FROM members WHERE id = ?`, [memberId]
    );
    if (!member) return res.status(404).json({ message: 'Member not found' });

    // Editing (exclude_id): price with that transaction's own recorded rate.
    const [[editingTx]] = excludeId
      ? await pool.query('SELECT rate_id, rate_amount, rate_unit FROM transactions WHERE id = ?', [excludeId])
      : [[null]];
    const rate = await rateForTransaction(pool, editingTx);
    const [[last]] = await pool.query(
      `SELECT DATE_FORMAT(MAX(t.to_date), '%Y-%m-%d') AS last_to_date
       FROM transactions t
       WHERE t.member_id = ? AND t.to_date IS NOT NULL AND t.id <> ?`,
      [memberId, excludeId]
    );

    // ── Start date: needs only the member (the rate is just the last fallback)
    let fromDate = null, basis = null;
    if (enteredFrom) { fromDate = enteredFrom; basis = 'entered'; }
    else if (last?.last_to_date) { fromDate = dayAfter(last.last_to_date); basis = 'last_transaction'; }
    else if (member.reg_date) { fromDate = member.reg_date; basis = 'reg_date'; }
    else if (rate) { fromDate = rate.start_date; basis = 'rate_start'; }

    // Credit (or arrears, if negative) carried from the member's last deposit.
    const bfCents = await creditBroughtForwardCents(pool, memberId, excludeId);
    const base = { from_date: fromDate, basis, last_to_date: last?.last_to_date || null, credit_brought_forward: bfCents / 100 };
    const NO_RATE = 'No usable active contribution rate — set one (with a year, month, week or day time unit) in Configurations → Contribution Rates.';

    if (!fromDate) return res.json({ ...base, available: false, reason: `This member has no earlier cover or registration date, and ${NO_RATE.charAt(0).toLowerCase()}${NO_RATE.slice(1)}` });
    if (!hasAmount) return res.json({ ...base, available: true, to_date: null });

    // ── End date: needs the amount and the active rate
    if (!rate) return res.json({ ...base, available: false, reason: NO_RATE });
    const { unit } = rate;

    // The amount plus any credit brought forward buys whole rate units; what's
    // short of a full unit is carried forward to the next deposit.
    const availableCents = Math.round(amount * 100) + bfCents;
    const period = availableCents > 0
      ? coverPeriod(fromDate, availableCents / 100, rate.amount, unit)
      : { to_date: null, units: 0, days_covered: 0, cover_cents: 0, remainder_cents: availableCents };
    const usedCents = period.cover_cents;
    const warnings = [];
    if (availableCents <= 0) warnings.push(`This amount doesn't clear the member's arrears of ${(-bfCents / 100).toFixed(2)}.`);
    else if (!period.to_date) warnings.push(`Not enough for one full ${unit} (${Number(rate.amount).toFixed(2)}) — the whole ${(availableCents / 100).toFixed(2)} is carried forward to the next deposit.`);
    if (rate.end_date && period.to_date && period.to_date > rate.end_date) {
      warnings.push(`This runs past the active rate's end date (${rate.end_date}).`);
    }

    res.json({
      ...base,
      available: true,
      to_date: period.to_date,
      units: period.units,
      days_covered: period.days_covered,
      available_amount: availableCents / 100,
      cover_value: usedCents / 100,
      credit_carried_forward: (availableCents - usedCents) / 100,
      rate: { id: rate.id, amount: rate.amount, time_unit_name: rate.time_unit_name, unit,
              start_date: rate.start_date, end_date: rate.end_date, source: rate.source },
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

/* Which rate a deposit is priced at — see rateForTransaction: it keeps the
   rate it was first recorded with; a new one takes the active rate. Every
   deposit is in the credit ledger — one too small for a unit has no To Date
   but still carries its amount forward. Non-deposits are outside it. */
async function rateSnapshotFor(conn, { transaction_type_id, is_migrated }, existing) {
  const none = { rate_id: null, rate_amount: null, rate_unit: null };
  // Migrated records keep exactly what was entered — never priced or ledgered.
  if (is_migrated) return none;
  if (!await isDepositTypeId(conn, transaction_type_id)) return none;
  const rate = await rateForTransaction(conn, existing);
  return rate ? { rate_id: rate.id, rate_amount: rate.amount, rate_unit: rate.unit } : none;
}

// Run `work(conn)` in a DB transaction (ledger recalcs must commit with the write).
async function inTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

router.post('/', canCreate, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    const { member_id, transaction_type_id, amount, from_date, to_date, transaction_date, other_details } = req.body;
    const is_migrated = req.body.is_migrated ? 1 : 0;

    const file_no = await generateRefNo('transaction_creation');
    const insertId = await inTransaction(async conn => {
      const snap = await rateSnapshotFor(conn, { ...req.body, is_migrated }, null);
      const [result] = await conn.query(
        `INSERT INTO transactions
           (file_no, member_id, transaction_type_id, amount, from_date, to_date,
            rate_id, rate_amount, rate_unit, transaction_date, other_details, is_migrated, created_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [file_no, member_id, transaction_type_id || null, amount, from_date || null, to_date || null,
         snap.rate_id, snap.rate_amount, snap.rate_unit, transaction_date, other_details || null, is_migrated, req.user.id]
      );
      await recalcMemberLedger(conn, member_id);
      return result.insertId;
    });

    const [rows] = await pool.query(`${LIST_SELECT} WHERE t.id=?`, [insertId]);
    const tx = rows[0];

    // Let the member see it in their portal (bell + push, per their preferences).
    // Tapping it opens this transaction's details — by hashed id, the only
    // form the portal accepts in URLs. Migrated records are history being
    // keyed in, not new activity, so they don't notify.
    if (!tx.is_migrated) {
      const amountText = Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
      await notify('member', tx.member_id, 'transaction_recorded', {
        title: `${tx.transaction_type_name || 'Transaction'} of KES ${amountText} recorded`,
        body: `${tx.file_no ? `${tx.file_no} · ` : ''}Dated ${tx.transaction_date}.`,
        url: `/transactions/${encodeId(tx.id)}`,
      });
    }

    res.status(201).json(tx);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    const { member_id, transaction_type_id, amount, from_date, to_date, transaction_date, other_details } = req.body;
    const is_migrated = req.body.is_migrated ? 1 : 0;

    const found = await inTransaction(async conn => {
      const [[existing]] = await conn.query(
        'SELECT id, member_id, rate_id, rate_amount, rate_unit FROM transactions WHERE id=? FOR UPDATE', [req.params.id]
      );
      if (!existing) return false;
      const snap = await rateSnapshotFor(conn, { ...req.body, is_migrated }, existing);
      await conn.query(
        `UPDATE transactions SET
           member_id=?, transaction_type_id=?, amount=?, from_date=?, to_date=?,
           rate_id=?, rate_amount=?, rate_unit=?, transaction_date=?, other_details=?, is_migrated=?, updated_by=?
         WHERE id=?`,
        [member_id, transaction_type_id || null, amount, from_date || null, to_date || null,
         snap.rate_id, snap.rate_amount, snap.rate_unit, transaction_date, other_details || null, is_migrated, req.user.id,
         req.params.id]
      );
      // Moving a transaction to another member changes both members' chains.
      await recalcMemberLedger(conn, member_id);
      if (Number(existing.member_id) !== Number(member_id)) await recalcMemberLedger(conn, existing.member_id);
      return true;
    });
    if (!found) return res.status(404).json({ message: 'Not found' });

    const [rows] = await pool.query(`${LIST_SELECT} WHERE t.id=?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await inTransaction(async conn => {
      const [[existing]] = await conn.query('SELECT member_id FROM transactions WHERE id=? FOR UPDATE', [req.params.id]);
      await conn.query('DELETE FROM transactions WHERE id=?', [req.params.id]);
      if (existing) await recalcMemberLedger(conn, existing.member_id);
    });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
