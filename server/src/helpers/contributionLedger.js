const { valueOfPeriodCents } = require('./contributionPeriod');

/* Contribution credit ledger.

   A deposit rarely buys an exact number of days, so the part of it that
   doesn't make a whole day isn't lost — it's carried to the member's next
   deposit as credit. Each deposit in the chain records:

     credit_brought_forward = previous link's credit_carried_forward (0 first)
     cover_value            = value of its from..to days at its rate snapshot
     credit_carried_forward = amount + credit_brought_forward - cover_value

   A positive carry-forward is credit; a negative one is arrears (cover was
   extended past what was paid), which the next deposit settles first.

   The chain is a member's deposits that have a rate snapshot and both dates,
   in cover order (from_date, then id). Any create / edit / delete can change
   every later link, so the whole chain is recalculated each time — cheap
   (one member's rows) and it means stored balances can never drift. */

const toCents = v => Math.round(Number(v || 0) * 100);
const fromCents = c => (c / 100).toFixed(2);

// Is this transaction type a deposit? (Transaction Types parameter value name)
async function isDepositTypeId(conn, typeId) {
  if (!typeId) return false;
  const [[row]] = await conn.query('SELECT paramater_value FROM parameter_values WHERE id=?', [typeId]);
  return /^deposit/i.test(row?.paramater_value || '');
}

/* Recalculate one member's chain. `conn` may be the pool or a connection
   inside a transaction (pass the connection so it sees uncommitted rows). */
async function recalcMemberLedger(conn, memberId) {
  const [rows] = await conn.query(
    `SELECT t.id, t.amount, t.rate_amount, t.rate_unit,
            DATE_FORMAT(t.from_date, '%Y-%m-%d') AS from_date,
            DATE_FORMAT(t.to_date, '%Y-%m-%d')   AS to_date
     FROM transactions t
     JOIN parameter_values tt ON t.transaction_type_id = tt.id
     WHERE t.member_id = ? AND tt.paramater_value LIKE 'deposit%'
       AND t.rate_amount IS NOT NULL AND t.rate_unit IS NOT NULL
       AND t.from_date IS NOT NULL AND t.to_date IS NOT NULL
     ORDER BY t.from_date, t.id`,
    [memberId]
  );

  let carried = 0; // cents
  for (const r of rows) {
    const broughtForward = carried;
    const coverValue = valueOfPeriodCents(r.from_date, r.to_date, r.rate_amount, r.rate_unit);
    carried = toCents(r.amount) + broughtForward - coverValue;
    await conn.query(
      `UPDATE transactions SET credit_brought_forward=?, cover_value=?, credit_carried_forward=? WHERE id=?`,
      [fromCents(broughtForward), fromCents(coverValue), fromCents(carried), r.id]
    );
  }

  // Anything no longer in the chain (type changed away from deposit, dates
  // cleared, ...) must not keep stale balances.
  const ids = rows.map(r => r.id);
  await conn.query(
    `UPDATE transactions SET credit_brought_forward=NULL, cover_value=NULL, credit_carried_forward=NULL
     WHERE member_id = ? ${ids.length ? 'AND id NOT IN (?)' : ''}`,
    ids.length ? [memberId, ids] : [memberId]
  );
}

/* Credit the next deposit for this member starts with: the carry-forward of
   the last link in their chain, optionally ignoring one transaction (the one
   being edited). Returns cents. */
async function creditBroughtForwardCents(conn, memberId, excludeId = 0) {
  const [[row]] = await conn.query(
    `SELECT t.credit_carried_forward
     FROM transactions t
     WHERE t.member_id = ? AND t.id <> ? AND t.credit_carried_forward IS NOT NULL
     ORDER BY t.from_date DESC, t.id DESC LIMIT 1`,
    [memberId, excludeId]
  );
  return toCents(row?.credit_carried_forward);
}

module.exports = { recalcMemberLedger, creditBroughtForwardCents, isDepositTypeId };
