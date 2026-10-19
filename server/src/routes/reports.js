const router = require('express').Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/* Reports for the campaign model — Revenue (payments), Expenditure, and
   Profit (revenue - expenditure), all attributed to Campaigns and their
   owning Member. Every endpoint accepts optional date_from/date_to
   (YYYY-MM-DD); with neither given, it reports across all time. */
function range(req, col) {
  const { date_from, date_to } = req.query;
  if (date_from && date_to) {
    return { where: `DATE(${col}) BETWEEN ? AND ?`, params: [date_from, date_to] };
  }
  return { where: '1=1', params: [] };
}

/* ── Overview KPIs (independent of whichever tab is active) ── */
router.get('/summary', async (req, res, next) => {
  try {
    const rev = range(req, 'payment_date');
    const exp = range(req, 'expenditure_date');
    const cmp = range(req, 'created_on');

    const [[revenue]]     = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE ${rev.where}`, rev.params);
    const [[expenditure]] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM expenditure WHERE ${exp.where}`, exp.params);
    const [[campaigns]]   = await pool.query(`SELECT COUNT(*) AS total FROM campaigns WHERE ${cmp.where}`, cmp.params);

    res.json({
      total_revenue:     Number(revenue.total),
      total_expenditure: Number(expenditure.total),
      total_profit:      Number(revenue.total) - Number(expenditure.total),
      total_campaigns:   campaigns.total,
    });
  } catch (err) { next(err); }
});

/* ── Revenue ── */

router.get('/revenue/by-campaign', async (req, res, next) => {
  try {
    const { where, params } = range(req, 'p.payment_date');
    const [data] = await pool.query(
      `SELECT cm.id AS campaign_id, cm.campaign_title, cm.file_no,
              COUNT(p.id) AS payment_count, COALESCE(SUM(p.amount),0) AS total_revenue
       FROM payments p JOIN campaigns cm ON p.campaign_id = cm.id
       WHERE ${where}
       GROUP BY cm.id ORDER BY total_revenue DESC`,
      params
    );
    const [[summary]] = await pool.query(
      `SELECT COUNT(*) AS payment_count, COALESCE(SUM(amount),0) AS total_revenue FROM payments p WHERE ${where}`,
      params
    );
    res.json({ data, summary });
  } catch (err) { next(err); }
});

router.get('/revenue/by-member', async (req, res, next) => {
  try {
    const { where, params } = range(req, 'p.payment_date');
    const [data] = await pool.query(
      `SELECT p.member_id, COALESCE(c.member_name, CONCAT(c.firstname,' ',c.lastname)) AS member_name,
              COUNT(p.id) AS payment_count, COALESCE(SUM(p.amount),0) AS total_revenue
       FROM payments p
       LEFT JOIN members c ON p.member_id = c.id
       WHERE ${where}
       GROUP BY p.member_id
       ORDER BY total_revenue DESC`,
      params
    );
    const [[summary]] = await pool.query(
      `SELECT COUNT(DISTINCT p.member_id) AS member_count, COALESCE(SUM(p.amount),0) AS total_revenue FROM payments p WHERE ${where}`,
      params
    );
    res.json({ data, summary });
  } catch (err) { next(err); }
});

/* Revenue attributed to each campaign, split by the campaign's current
   workflow stage. */
router.get('/revenue/by-stage', async (req, res, next) => {
  try {
    const { where, params } = range(req, 'p.payment_date');
    const [data] = await pool.query(
      `SELECT cm.id AS campaign_id, cm.campaign_title,
              ws.id AS stage_id, ws.stage_name, ws.stage_color, ws.stage_order,
              COUNT(p.id) AS payment_count, COALESCE(SUM(p.amount),0) AS total_revenue
       FROM payments p
       JOIN campaigns cm ON p.campaign_id = cm.id
       LEFT JOIN workflow_stages ws ON cm.workflow_stage_id = ws.id
       WHERE ${where}
       GROUP BY cm.id, ws.id
       ORDER BY cm.campaign_title, ws.stage_order`,
      params
    );
    const [[summary]] = await pool.query(
      `SELECT COUNT(*) AS payment_count, COALESCE(SUM(amount),0) AS total_revenue FROM payments p WHERE ${where}`,
      params
    );
    res.json({ data, summary });
  } catch (err) { next(err); }
});

router.get('/revenue/by-date', async (req, res, next) => {
  try {
    const { where, params } = range(req, 'p.payment_date');
    const [data] = await pool.query(
      `SELECT DATE(p.payment_date) AS date, COUNT(p.id) AS payment_count, COALESCE(SUM(p.amount),0) AS total_revenue
       FROM payments p WHERE ${where}
       GROUP BY DATE(p.payment_date) ORDER BY date`,
      params
    );
    const [[summary]] = await pool.query(
      `SELECT COUNT(*) AS payment_count, COALESCE(SUM(amount),0) AS total_revenue FROM payments p WHERE ${where}`,
      params
    );
    res.json({ data, summary });
  } catch (err) { next(err); }
});

/* ── Profit (revenue - expenditure), per campaign ── */

router.get('/profit/by-campaign', async (req, res, next) => {
  try {
    const rev = range(req, 'p.payment_date');
    const exp = range(req, 'e.expenditure_date');

    const [revRows] = await pool.query(
      `SELECT campaign_id, COALESCE(SUM(amount),0) AS revenue FROM payments p WHERE ${rev.where} GROUP BY campaign_id`,
      rev.params
    );
    const [expRows] = await pool.query(
      `SELECT campaign_id, COALESCE(SUM(amount),0) AS expenditure FROM expenditure e WHERE ${exp.where} GROUP BY campaign_id`,
      exp.params
    );

    const revMap = Object.fromEntries(revRows.filter(r => r.campaign_id != null).map(r => [r.campaign_id, Number(r.revenue)]));
    const expMap = Object.fromEntries(expRows.filter(r => r.campaign_id != null).map(r => [r.campaign_id, Number(r.expenditure)]));
    const campaignIds = [...new Set([...Object.keys(revMap), ...Object.keys(expMap)])].map(Number);

    if (!campaignIds.length) {
      return res.json({ data: [], summary: { total_revenue: 0, total_expenditure: 0, total_profit: 0 } });
    }

    const [campaigns] = await pool.query(`SELECT id, campaign_title, file_no FROM campaigns WHERE id IN (?)`, [campaignIds]);
    const data = campaigns
      .map(cm => {
        const revenue = revMap[cm.id] || 0;
        const expenditure = expMap[cm.id] || 0;
        const profit = revenue - expenditure;
        return {
          campaign_id: cm.id, campaign_title: cm.campaign_title, file_no: cm.file_no,
          revenue, expenditure, profit,
          margin: revenue > 0 ? (profit / revenue) * 100 : 0,
        };
      })
      .sort((a, b) => b.profit - a.profit);

    const total_revenue = data.reduce((s, r) => s + r.revenue, 0);
    const total_expenditure = data.reduce((s, r) => s + r.expenditure, 0);
    res.json({ data, summary: { total_revenue, total_expenditure, total_profit: total_revenue - total_expenditure } });
  } catch (err) { next(err); }
});

/* ── Expenditure ── */

router.get('/expenditure/by-campaign', async (req, res, next) => {
  try {
    const { where, params } = range(req, 'e.expenditure_date');
    const [data] = await pool.query(
      `SELECT cm.id AS campaign_id, cm.campaign_title, cm.file_no,
              COUNT(e.id) AS entry_count, COALESCE(SUM(e.amount),0) AS total_expenditure
       FROM expenditure e JOIN campaigns cm ON e.campaign_id = cm.id
       WHERE ${where}
       GROUP BY cm.id ORDER BY total_expenditure DESC`,
      params
    );
    const [[summary]] = await pool.query(
      `SELECT COUNT(*) AS entry_count, COALESCE(SUM(amount),0) AS total_expenditure FROM expenditure e WHERE ${where}`,
      params
    );
    res.json({ data, summary });
  } catch (err) { next(err); }
});

/* "By items" = by Expenditure Type (the parameter values staff pick from
   on the Expenditure form) — there's no separate line-item concept. */
router.get('/expenditure/by-item', async (req, res, next) => {
  try {
    const { where, params } = range(req, 'e.expenditure_date');
    const [data] = await pool.query(
      `SELECT e.expenditure_type_id, pv.paramater_value AS type_name,
              COUNT(e.id) AS entry_count, COALESCE(SUM(e.amount),0) AS total_expenditure
       FROM expenditure e
       LEFT JOIN parameter_values pv ON e.expenditure_type_id = pv.id
       WHERE ${where}
       GROUP BY e.expenditure_type_id ORDER BY total_expenditure DESC`,
      params
    );
    const [[summary]] = await pool.query(
      `SELECT COUNT(*) AS entry_count, COALESCE(SUM(amount),0) AS total_expenditure FROM expenditure e WHERE ${where}`,
      params
    );
    res.json({ data, summary });
  } catch (err) { next(err); }
});

router.get('/expenditure/by-date', async (req, res, next) => {
  try {
    const { where, params } = range(req, 'e.expenditure_date');
    const [data] = await pool.query(
      `SELECT DATE(e.expenditure_date) AS date, COUNT(e.id) AS entry_count, COALESCE(SUM(e.amount),0) AS total_expenditure
       FROM expenditure e WHERE ${where}
       GROUP BY DATE(e.expenditure_date) ORDER BY date`,
      params
    );
    const [[summary]] = await pool.query(
      `SELECT COUNT(*) AS entry_count, COALESCE(SUM(amount),0) AS total_expenditure FROM expenditure e WHERE ${where}`,
      params
    );
    res.json({ data, summary });
  } catch (err) { next(err); }
});

module.exports = router;
