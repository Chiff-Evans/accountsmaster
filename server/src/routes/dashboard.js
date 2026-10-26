const router = require("express").Router();
const pool = require("../config/db");
const { authenticate } = require("../middleware/auth");
const { depositSum, withdrawalSum } = require("../helpers/transactionTypes");

router.use(authenticate);

/* ── date range helpers ───────────────────────────────────────────────────── */
function buildDateFilter(dateFrom, dateTo, col) {
  if (dateFrom && dateTo) {
    return {
      where:  `DATE(${col}) >= ? AND DATE(${col}) <= ?`,
      params: [dateFrom, dateTo],
    };
  }
  // legacy period fallback
  return {
    where:  `YEAR(${col}) = YEAR(NOW()) AND MONTH(${col}) = MONTH(NOW())`,
    params: [],
  };
}

function trendFormat(dateFrom, dateTo, col) {
  if (dateFrom && dateTo) {
    const days = (new Date(dateTo) - new Date(dateFrom)) / 86400000;
    if (days === 0) return `DATE_FORMAT(${col}, '%H:00')`;  // single day → hourly
    if (days <= 31)  return `DATE_FORMAT(${col}, '%Y-%m-%d')`; // ≤ month → daily
    return `DATE_FORMAT(${col}, '%Y-%m')`;                      // > month → monthly
  }
  return `DATE_FORMAT(${col}, '%Y-%m-%d')`;
}

/* All money figures come from member transactions (Accounts > Transactions);
   Deposit vs Withdraw follows helpers/transactionTypes.js. */
const TX_FROM = `
  FROM transactions t
  LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id
`;

/* ── Summary stat cards ──
   Deposits / withdrawals / net follow the selected period. Target progress
   is all-time against the active target, the same way Stake-Holders >
   Statistics computes it: each member owes the target amount, overpayment
   doesn't offset another member's balance. */
router.get("/summary", async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;
    const txF = buildDateFilter(date_from, date_to, 't.transaction_date');

    const [[tx]] = await pool.query(
      `SELECT ${depositSum()} AS deposits, ${withdrawalSum()} AS withdrawals, COUNT(t.id) AS transaction_count
       ${TX_FROM} WHERE ${txF.where}`,
      txF.params
    );

    const [[members]] = await pool.query(
      'SELECT COUNT(*) AS total FROM members WHERE status="active"',
    );

    const [[target]] = await pool.query(
      `SELECT target_amount, DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date FROM targets WHERE is_active = 1 LIMIT 1`
    );

    let targetProgress = null;
    if (target) {
      // Only real members owe the target — internal accounts (is_human = 0:
      // interest, taxes, ...) are left out, same as Stake-Holders > Statistics.
      const [perMember] = await pool.query(
        `SELECT m.id, ${depositSum()} - ${withdrawalSum()} AS net
         FROM members m
         LEFT JOIN transactions t      ON t.member_id = m.id
         LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id
         WHERE m.is_human = 1
         GROUP BY m.id`
      );
      const targetAmount = Number(target.target_amount);
      const expected = targetAmount * perMember.length;
      const collected = perMember.reduce((s, r) => s + Math.min(Math.max(Number(r.net), 0), targetAmount), 0);
      targetProgress = {
        target_amount: targetAmount,
        target_date: target.target_date,
        member_count: perMember.length,
        expected,
        collected,
        outstanding: expected - collected,
        percent: expected > 0 ? Math.round((collected / expected) * 1000) / 10 : 0,
      };
    }

    res.json({
      total_members: members.total,
      total_deposits: Number(tx.deposits),
      total_withdrawals: Number(tx.withdrawals),
      net_contributions: Number(tx.deposits) - Number(tx.withdrawals),
      transaction_count: tx.transaction_count,
      target: targetProgress,
    });
  } catch (err) {
    next(err);
  }
});

/* ── Deposits vs Withdrawals trend ── */
router.get("/trend", async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;
    const fmt = trendFormat(date_from, date_to, 't.transaction_date');
    const { where, params } = buildDateFilter(date_from, date_to, 't.transaction_date');
    const [rows] = await pool.query(
      `SELECT ${fmt} AS date,
              CAST(${depositSum()} AS DOUBLE)    AS deposits,
              CAST(${withdrawalSum()} AS DOUBLE) AS withdrawals
       ${TX_FROM} WHERE ${where}
       GROUP BY ${fmt} ORDER BY date`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/* ── Transaction amount split by Transaction Type ── */
router.get("/by-type", async (req, res, next) => {
  try {
    const { where, params } = buildDateFilter(req.query.date_from, req.query.date_to, 't.transaction_date');
    const [rows] = await pool.query(
      `SELECT COALESCE(tt.paramater_value, 'Unspecified') AS type_name,
              CAST(SUM(t.amount) AS DOUBLE) AS total, COUNT(t.id) AS count
       ${TX_FROM} WHERE ${where}
       GROUP BY tt.id, tt.paramater_value ORDER BY total DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/* ── Top 10 members by net contribution in the period ── */
router.get("/top-members", async (req, res, next) => {
  try {
    const { where, params } = buildDateFilter(req.query.date_from, req.query.date_to, 't.transaction_date');
    const [rows] = await pool.query(
      `SELECT m.id, m.member_name,
              CAST(${depositSum()} - ${withdrawalSum()} AS DOUBLE) AS net_contribution
       ${TX_FROM}
       JOIN members m ON t.member_id = m.id
       WHERE ${where}
       GROUP BY m.id, m.member_name
       HAVING net_contribution <> 0
       ORDER BY net_contribution DESC LIMIT 10`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/* ── Recent transactions ── */
router.get("/recent-transactions", async (req, res, next) => {
  try {
    const { where, params } = buildDateFilter(req.query.date_from, req.query.date_to, 't.transaction_date');
    const [rows] = await pool.query(
      `SELECT t.id, t.file_no, t.amount, DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
              tt.paramater_value AS transaction_type_name, m.member_name
       ${TX_FROM}
       LEFT JOIN members m ON t.member_id = m.id
       WHERE ${where}
       ORDER BY t.transaction_date DESC, t.id DESC LIMIT 10`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
