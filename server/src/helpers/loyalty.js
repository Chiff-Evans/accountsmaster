const pool = require('../config/db');

/**
 * Award loyalty points for a campaign, if it qualifies.
 *
 * Points are based on the total amount PAID toward the campaign (summed from
 * `payments`, matched by advertiser+campaign). They're only awarded once the
 * campaign reaches the configured "qualifying stage"
 * (`loyalty_config.qualifying_stage_id`) — awarding is a one-shot per
 * campaign (guarded by `loyalty_points.campaign_id` being unique).
 *
 * Called from two places, since either can be the event that first makes a
 * campaign qualify:
 *   - the campaign transition endpoint (stage just changed to the qualifying stage)
 *   - the payments endpoints (a payment just pushed total paid over the threshold)
 *
 * @param {{ id:number, advertiser_id:number, workflow_stage_id:number }} campaign
 */
async function maybeAwardLoyaltyPoints(campaign) {
  try {
    if (!campaign?.id || !campaign.advertiser_id) return;

    const [[cfg]] = await pool.query('SELECT * FROM loyalty_config WHERE id=1 LIMIT 1');
    if (!cfg?.is_active || !cfg.qualifying_stage_id) return;
    if (Number(campaign.workflow_stage_id) !== Number(cfg.qualifying_stage_id)) return;

    const [[{ total_paid }]] = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total_paid FROM payments
       WHERE advertiser_id=? AND campaign_id=?`,
      [campaign.advertiser_id, campaign.id]
    );
    if (Number(total_paid) < Number(cfg.min_sale_amount)) return;

    const pts = Math.floor(Number(total_paid) / Number(cfg.amount_per_point));
    if (pts <= 0) return;

    const [ins] = await pool.query(
      `INSERT IGNORE INTO loyalty_points (advertiser_id, campaign_id, points, order_total) VALUES (?,?,?,?)`,
      [campaign.advertiser_id, campaign.id, pts, total_paid]
    );
    if (ins.affectedRows) {
      await pool.query('UPDATE advertisers SET loyalty_points = loyalty_points + ? WHERE id = ?', [pts, campaign.advertiser_id]);
    }
  } catch (err) {
    console.error('Loyalty points error:', err.message);
  }
}

module.exports = { maybeAwardLoyaltyPoints };
