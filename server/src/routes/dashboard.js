const router = require("express").Router();
const pool = require("../config/db");
const { authenticate } = require("../middleware/auth");

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

/* ── Summary stat cards ── */
router.get("/summary", async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;
    const campaignsF   = buildDateFilter(date_from, date_to, 'created_on');
    const paymentsF    = buildDateFilter(date_from, date_to, 'payment_date');
    const expenditureF = buildDateFilter(date_from, date_to, 'expenditure_date');

    const [[campaigns]] = await pool.query(
      `SELECT COUNT(*) AS total FROM campaigns WHERE ${campaignsF.where}`,
      campaignsF.params
    );

    const [[revenue]] = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE ${paymentsF.where}`,
      paymentsF.params
    );

    const [[expenditure]] = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total FROM expenditure WHERE ${expenditureF.where}`,
      expenditureF.params
    );

    const [[members]] = await pool.query(
      'SELECT COUNT(*) AS total FROM members WHERE status="active"',
    );

    const [[brandAmbassadors]] = await pool.query(
      'SELECT COUNT(*) AS total FROM brand_ambassadors WHERE status="active"',
    );

    res.json({
      total_campaigns: campaigns.total,
      total_revenue: revenue.total,
      total_expenditure: expenditure.total,
      total_members: members.total,
      total_brand_ambassadors: brandAmbassadors.total,
    });
  } catch (err) {
    next(err);
  }
});

/* ── Revenue vs Expenditure trend ── */
router.get("/trend", async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;
    const revFmt = trendFormat(date_from, date_to, 'payment_date');
    const expFmt = trendFormat(date_from, date_to, 'expenditure_date');
    const { where: revWhere, params: revParams } = buildDateFilter(date_from, date_to, 'payment_date');
    const { where: expWhere, params: expParams } = buildDateFilter(date_from, date_to, 'expenditure_date');

    const [revRows] = await pool.query(
      `SELECT ${revFmt} AS date, CAST(SUM(amount) AS DOUBLE) AS revenue
       FROM payments WHERE ${revWhere} GROUP BY ${revFmt} ORDER BY date`,
      revParams
    );
    const [expRows] = await pool.query(
      `SELECT ${expFmt} AS date, CAST(SUM(amount) AS DOUBLE) AS expenditure
       FROM expenditure WHERE ${expWhere} GROUP BY ${expFmt} ORDER BY date`,
      expParams
    );

    const map = new Map();
    revRows.forEach(r => map.set(r.date, { date: r.date, revenue: r.revenue, expenditure: 0 }));
    expRows.forEach(r => {
      const existing = map.get(r.date);
      if (existing) existing.expenditure = r.expenditure;
      else map.set(r.date, { date: r.date, revenue: 0, expenditure: r.expenditure });
    });

    const merged = [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
    res.json(merged);
  } catch (err) {
    next(err);
  }
});

/* ── Campaigns pipeline: count of campaigns per workflow stage ── */
router.get("/pipeline", async (req, res, next) => {
  try {
    const { where: pw, params: pp } = buildDateFilter(req.query.date_from, req.query.date_to, 'cm.created_on');
    const [rows] = await pool.query(
      `SELECT ws.stage_name, ws.stage_color, ws.stage_order, COUNT(cm.id) AS count
       FROM workflow_stages ws
       JOIN workflows w      ON ws.workflow_id = w.id
       JOIN process_types pt ON pt.id = w.process_type_id AND pt.data_table = 'campaigns'
       LEFT JOIN campaigns cm ON cm.workflow_stage_id = ws.id AND ${pw}
       WHERE w.is_active = 1
       GROUP BY ws.id, ws.stage_name, ws.stage_color, ws.stage_order
       ORDER BY ws.stage_order`,
      pp
    );
    res.json(
      rows
        .filter(r => r.count > 0)
        .map(r => ({ status_name: r.stage_name, count: r.count, color: r.stage_color || '#1677ff' }))
    );
  } catch (err) {
    next(err);
  }
});

/* ── Top 10 campaigns by revenue ── */
router.get("/top-campaigns", async (req, res, next) => {
  try {
    const { where: pw, params: pp } = buildDateFilter(req.query.date_from, req.query.date_to, 'p.payment_date');
    const [rows] = await pool.query(
      `SELECT cm.campaign_title,
              CAST(SUM(p.amount) AS DOUBLE) AS total_revenue,
              COUNT(*) AS payment_count
       FROM payments p
       JOIN campaigns cm ON p.campaign_id = cm.id
       WHERE ${pw}
       GROUP BY p.campaign_id ORDER BY total_revenue DESC LIMIT 10`,
      pp
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/* ── Recent campaigns ── */
router.get("/recent-campaigns", async (req, res, next) => {
  try {
    const { where: pw, params: pp } = buildDateFilter(req.query.date_from, req.query.date_to, 'cm.created_on');
    const [rows] = await pool.query(
      `SELECT cm.id, cm.campaign_title, cm.budget, cm.created_on,
              ws.stage_name, ws.stage_color,
              COALESCE(cl.member_name, CONCAT(cl.firstname,' ',cl.lastname)) AS member_name
       FROM campaigns cm
       LEFT JOIN members cl     ON cm.member_id = cl.id
       LEFT JOIN workflow_stages ws ON cm.workflow_stage_id = ws.id
       WHERE ${pw}
       ORDER BY cm.created_on DESC LIMIT 10`,
      pp
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
