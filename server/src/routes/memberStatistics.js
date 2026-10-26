const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { depositSum, withdrawalSum } = require('../helpers/transactionTypes');

router.use(authenticate);

const canView = requirePermission('/members/statistics', 'can_view');

// Money is summed in cents so totals never pick up floating-point drift.
const toCents = v => Math.round(Number(v || 0) * 100);
const fromCents = c => c / 100;

/* GET /api/member-statistics — every member's deposits and withdrawals,
   plus balance / overpayment against the single active target:
     net         = deposits - withdrawals
     balance     = max(target - net, 0)
     overpayment = max(net - target, 0)
   Internal accounts (is_human = 0 — interest, taxes, ...) don't owe the
   target: their deposits/withdrawals are reported, but balance and
   overpayment are null and left out of those totals.
   (Deposit/Withdraw classification: see helpers/transactionTypes.js) */
router.get('/', canView, async (req, res, next) => {
  try {
    const [[target]] = await pool.query(
      `SELECT id, target_amount, DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date
       FROM targets WHERE is_active = 1 LIMIT 1`
    );

    const [rows] = await pool.query(
      `SELECT m.id, m.member_ref_no, m.member_name, m.is_human,
              ${depositSum()} AS deposits,
              ${withdrawalSum()} AS withdrawals
       FROM members m
       LEFT JOIN transactions t      ON t.member_id = m.id
       LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id
       GROUP BY m.id, m.member_ref_no, m.member_name, m.is_human
       ORDER BY m.is_human DESC, m.member_name`
    );

    const targetCents = target ? toCents(target.target_amount) : null;
    const totals = { deposits: 0, withdrawals: 0, net: 0, balance: 0, overpayment: 0 };

    const data = rows.map(r => {
      const deposits = toCents(r.deposits);
      const withdrawals = toCents(r.withdrawals);
      const net = deposits - withdrawals;
      const assessed = targetCents != null && r.is_human !== 0;
      const balance = assessed ? Math.max(targetCents - net, 0) : null;
      const overpayment = assessed ? Math.max(net - targetCents, 0) : null;

      totals.deposits += deposits;
      totals.withdrawals += withdrawals;
      totals.net += net;
      totals.balance += balance || 0;
      totals.overpayment += overpayment || 0;

      return {
        id: r.id,
        member_ref_no: r.member_ref_no,
        member_name: r.member_name,
        is_human: r.is_human,
        deposits: fromCents(deposits),
        withdrawals: fromCents(withdrawals),
        net: fromCents(net),
        balance: balance == null ? null : fromCents(balance),
        overpayment: overpayment == null ? null : fromCents(overpayment),
      };
    });

    res.json({
      target: target ? { ...target, target_amount: Number(target.target_amount) } : null,
      data,
      totals: {
        deposits: fromCents(totals.deposits),
        withdrawals: fromCents(totals.withdrawals),
        net: fromCents(totals.net),
        balance: target ? fromCents(totals.balance) : null,
        overpayment: target ? fromCents(totals.overpayment) : null,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
