const router = require('express').Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { depositSum, withdrawalSum } = require('../helpers/transactionTypes');

router.use(authenticate);

/* Financial reports — member transactions (deposits / withdrawals, by
   transaction_date) and member registration fees (by reg_date). Every
   endpoint accepts optional date_from/date_to (YYYY-MM-DD); with neither
   given, it reports across all time. */
function range(req, col) {
  const { date_from, date_to } = req.query;
  if (date_from && date_to) {
    return { where: `DATE(${col}) BETWEEN ? AND ?`, params: [date_from, date_to] };
  }
  return { where: '1=1', params: [] };
}

const TX_FROM = `
  FROM transactions t
  LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id
`;

// deposits / withdrawals / net as numbers (mysql2 returns DECIMAL as strings)
const withNet = r => {
  const deposits = Number(r.deposits);
  const withdrawals = Number(r.withdrawals);
  return { ...r, deposits, withdrawals, net: deposits - withdrawals };
};

/* ── Overview KPIs (independent of whichever tab is active) ── */
router.get('/summary', async (req, res, next) => {
  try {
    const tx = range(req, 't.transaction_date');
    const reg = range(req, 'm.reg_date');

    const [[t]] = await pool.query(
      `SELECT ${depositSum()} AS deposits, ${withdrawalSum()} AS withdrawals, COUNT(t.id) AS transaction_count
       ${TX_FROM} WHERE ${tx.where}`,
      tx.params
    );
    const [[r]] = await pool.query(
      `SELECT COUNT(*) AS new_members, COALESCE(SUM(m.reg_fee),0) AS reg_fees
       FROM members m WHERE m.reg_date IS NOT NULL AND ${reg.where}`,
      reg.params
    );

    const s = withNet(t);
    res.json({
      total_deposits:    s.deposits,
      total_withdrawals: s.withdrawals,
      net_contributions: s.net,
      transaction_count: t.transaction_count,
      new_members:       r.new_members,
      total_reg_fees:    Number(r.reg_fees),
    });
  } catch (err) { next(err); }
});

/* ── Transactions ── */

router.get('/transactions/by-member', async (req, res, next) => {
  try {
    const { where, params } = range(req, 't.transaction_date');
    const [rows] = await pool.query(
      `SELECT m.id AS member_id, m.member_ref_no, m.member_name,
              COUNT(t.id) AS transaction_count, ${depositSum()} AS deposits, ${withdrawalSum()} AS withdrawals
       ${TX_FROM}
       JOIN members m ON t.member_id = m.id
       WHERE ${where}
       GROUP BY m.id, m.member_ref_no, m.member_name
       ORDER BY m.member_name`,
      params
    );
    res.json({ data: rows.map(withNet) });
  } catch (err) { next(err); }
});

router.get('/transactions/by-type', async (req, res, next) => {
  try {
    const { where, params } = range(req, 't.transaction_date');
    const [rows] = await pool.query(
      `SELECT tt.id AS transaction_type_id, COALESCE(tt.paramater_value, 'Unspecified') AS type_name,
              COUNT(t.id) AS transaction_count, COALESCE(SUM(t.amount),0) AS total_amount
       ${TX_FROM}
       WHERE ${where}
       GROUP BY tt.id, tt.paramater_value
       ORDER BY total_amount DESC`,
      params
    );
    res.json({ data: rows.map(r => ({ ...r, total_amount: Number(r.total_amount) })) });
  } catch (err) { next(err); }
});

router.get('/transactions/by-date', async (req, res, next) => {
  try {
    const { where, params } = range(req, 't.transaction_date');
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS date,
              COUNT(t.id) AS transaction_count, ${depositSum()} AS deposits, ${withdrawalSum()} AS withdrawals
       ${TX_FROM}
       WHERE ${where}
       GROUP BY t.transaction_date
       ORDER BY t.transaction_date`,
      params
    );
    res.json({ data: rows.map(withNet) });
  } catch (err) { next(err); }
});

/* ── Registration fees (members by registration date) ── */

router.get('/registrations/by-date', async (req, res, next) => {
  try {
    const { where, params } = range(req, 'm.reg_date');
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(m.reg_date, '%Y-%m-%d') AS date,
              COUNT(m.id) AS member_count, COALESCE(SUM(m.reg_fee),0) AS reg_fees
       FROM members m
       WHERE m.reg_date IS NOT NULL AND ${where}
       GROUP BY m.reg_date
       ORDER BY m.reg_date`,
      params
    );
    res.json({ data: rows.map(r => ({ ...r, reg_fees: Number(r.reg_fees) })) });
  } catch (err) { next(err); }
});

router.get('/registrations/by-position', async (req, res, next) => {
  try {
    const { where, params } = range(req, 'm.reg_date');
    const [rows] = await pool.query(
      `SELECT COALESCE(pos.paramater_value, 'Unspecified') AS position_name,
              COUNT(m.id) AS member_count, COALESCE(SUM(m.reg_fee),0) AS reg_fees
       FROM members m
       LEFT JOIN parameter_values pos ON m.position_id = pos.id
       WHERE m.reg_date IS NOT NULL AND ${where}
       GROUP BY pos.id, pos.paramater_value
       ORDER BY member_count DESC`,
      params
    );
    res.json({ data: rows.map(r => ({ ...r, reg_fees: Number(r.reg_fees) })) });
  } catch (err) { next(err); }
});

module.exports = router;
