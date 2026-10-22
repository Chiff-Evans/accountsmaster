const { valueOfPeriodCents } = require('./contributionPeriod');

/* Contribution credit ledger.

   Cover is bought in whole rate units (e.g. whole weeks at 1000/week), so a
   deposit rarely spends exactly its amount. What's short of a full unit
   isn't lost — it's carried to the member's next deposit as credit
   (1500 at 1000/week = 1 week + 500 carried; a later 500 + that 500 buys
   the next week). Each deposit in the chain records:

     credit_brought_forward = previous link's credit_carried_forward (0 first)
     cover_value            = value of its from..to days at its rate snapshot
     credit_carried_forward = amount + credit_brought_forward - cover_value

   A positive carry-forward is credit; a negative one is arrears (cover was
   extended past what was paid), which the next deposit settles first.

   Migrated transactions (is_migrated = 1) are history keyed in as-is and are
   never part of the chain.

   The chain is a member's deposits that have a rate snapshot, in cover
   order (CHAIN_KEY, then id). A deposit too small for one unit has no To
   Date — it covers nothing and its whole amount carries forward. Any
   create / edit / delete can change every later link, so the whole chain
   is recalculated each time — cheap
   (one member's rows) and it means stored balances can never drift. */

const toCents = v => Math.round(Number(v || 0) * 100);
const fromCents = c => (c / 100).toFixed(2);

// One ordering for both recalculation and "what does the next deposit
// inherit" — they must agree. Uncovered deposits have no to_date but still
// sort by their start (or, failing that, their transaction date).
const CHAIN_KEY = 'COALESCE(t.from_date, t.transaction_date)';

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
       AND t.is_migrated = 0
       AND t.rate_amount IS NOT NULL AND t.rate_unit IS NOT NULL
     ORDER BY ${CHAIN_KEY}, t.id`,
    [memberId]
  );

  let carried = 0; // cents
  for (const r of rows) {
    const broughtForward = carried;
    // No cover dates = bought no unit; the whole amount carries forward.
    const coverValue = r.from_date && r.to_date
      ? valueOfPeriodCents(r.from_date, r.to_date, r.rate_amount, r.rate_unit)
      : 0;
    carried = toCents(r.amount) + broughtForward - coverValue;
    await conn.query(
      `UPDATE transactions SET credit_brought_forward=?, cover_value=?, credit_carried_forward=? WHERE id=?`,
      [fromCents(broughtForward), fromCents(coverValue), fromCents(carried), r.id]
    );
  }

  // Anything no longer in the chain (type changed away from deposit, ...)
  // must not keep stale balances.
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
     ORDER BY ${CHAIN_KEY} DESC, t.id DESC LIMIT 1`,
    [memberId, excludeId]
  );
  return toCents(row?.credit_carried_forward);
}

module.exports = { recalcMemberLedger, creditBroughtForwardCents, isDepositTypeId };
