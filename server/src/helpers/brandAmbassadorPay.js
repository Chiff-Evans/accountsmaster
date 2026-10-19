const pool = require('../config/db');

/* The pool of money available to split among a campaign's assigned brand
   ambassadors: campaign budget * pay percentage. The percentage used is the
   campaign's own override if staff set one, otherwise the global default
   from Brand Ambassador Settings. Returns null if the campaign doesn't exist. */
async function getBrandAmbassadorPayoutPool(campaignId) {
  const [[campaign]] = await pool.query(
    'SELECT budget, brand_ambassador_pay_percentage FROM campaigns WHERE id=?',
    [campaignId]
  );
  if (!campaign) return null;

  let percentage = campaign.brand_ambassador_pay_percentage;
  if (percentage == null) {
    const [[cfg]] = await pool.query('SELECT brand_ambassador_pay_percentage FROM brand_ambassador_config WHERE id=1');
    percentage = cfg?.brand_ambassador_pay_percentage;
  }
  return Number(campaign.budget || 0) * (Number(percentage || 0) / 100);
}

module.exports = { getBrandAmbassadorPayoutPool };
