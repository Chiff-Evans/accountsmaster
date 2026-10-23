const pool = require('../config/db');

/**
 * Award loyalty points for a loyalty_point_item, if it qualifies.
 *
 * Points are based on the total amount PAID toward the loyalty_point_item (summed from
 * `payments`, matched by member+loyalty_point_item). They're only awarded once the
 * loyalty_point_item reaches the configured "qualifying stage"
 * (`loyalty_config.qualifying_stage_id`) — awarding is a one-shot per
 * loyalty_point_item (guarded by `loyalty_points.loyalty_point_item_id` being unique).
 *
 * Called from two places, since either can be the event that first makes a
 * loyalty_point_item qualify:
 *   - the loyalty_point_item transition endpoint (stage just changed to the qualifying stage)
 *   - the payments endpoints (a payment just pushed total paid over the threshold)
 *
 * @param {{ id:number, member_id:number, workflow_stage_id:number }} loyalty_point_item
 */
async function maybeAwardLoyaltyPoints(loyalty_point_item) {
  try {
    if (!loyalty_point_item?.id || !loyalty_point_item.member_id) return;

    const [[cfg]] = await pool.query('SELECT * FROM loyalty_config WHERE id=1 LIMIT 1');
    if (!cfg?.is_active || !cfg.qualifying_stage_id) return;
    if (Number(loyalty_point_item.workflow_stage_id) !== Number(cfg.qualifying_stage_id)) return;

    const [[{ total_paid }]] = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total_paid FROM payments
       WHERE member_id=? AND loyalty_point_item_id=?`,
      [loyalty_point_item.member_id, loyalty_point_item.id]
    );
    if (Number(total_paid) < Number(cfg.min_sale_amount)) return;

    const pts = Math.floor(Number(total_paid) / Number(cfg.amount_per_point));
    if (pts <= 0) return;

    const [ins] = await pool.query(
      `INSERT IGNORE INTO loyalty_points (member_id, loyalty_point_item_id, points, order_total) VALUES (?,?,?,?)`,
      [loyalty_point_item.member_id, loyalty_point_item.id, pts, total_paid]
    );
    if (ins.affectedRows) {
      await pool.query('UPDATE members SET loyalty_points = loyalty_points + ? WHERE id = ?', [pts, loyalty_point_item.member_id]);
    }
  } catch (err) {
    console.error('Loyalty points error:', err.message);
  }
}

module.exports = { maybeAwardLoyaltyPoints };
