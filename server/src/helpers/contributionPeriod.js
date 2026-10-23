/* Contribution period maths — how far an amount paid at the active
   contribution rate (amount per time unit) carries a member's cover.

   All dates are 'YYYY-MM-DD' strings handled in UTC, so no timezone can
   shift a day. Cover is bought in WHOLE rate units only (1000/week buys
   whole weeks); whatever is short of a full unit is not turned into days —
   it's carried forward as credit to the member's next deposit (see
   contributionLedger.js). Units are calendar-true (1 month from 31 Jan is
   28/29 Feb, 1 year from 29 Feb is 28 Feb). */

const DAY_MS = 86400000;

const parse = s => {
  const [y, m, d] = String(s).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const fmt = dt => dt.toISOString().slice(0, 10);
const addDays = (dt, n) => new Date(dt.getTime() + n * DAY_MS);
const daysBetween = (a, b) => Math.round((b - a) / DAY_MS);

// Add n calendar months, clamping the day to the target month's length.
function addMonths(dt, n) {
  const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + n, d = dt.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d, lastDay)));
}

/* The Time Units parameter values are free text ("Month- Monthly",
   "Week - Weekly", ...) — match on how they start. */
function unitOf(timeUnitName) {
  const n = String(timeUnitName || '').trim().toLowerCase();
  if (n.startsWith('year'))  return 'year';
  if (n.startsWith('month')) return 'month';
  if (n.startsWith('week'))  return 'week';
  if (n.startsWith('day'))   return 'day';
  return null;
}

function addUnits(dt, unit, n) {
  if (unit === 'year')  return addMonths(dt, 12 * n);
  if (unit === 'month') return addMonths(dt, n);
  if (unit === 'week')  return addDays(dt, 7 * n);
  return addDays(dt, n); // day
}

/* What `amount` buys at `rateAmount` per `unit`, starting on `fromDate`
   (inclusive): only whole units. Worked in cents so the remainder is exact.
   Returns { to_date, units, days_covered, cover_cents, remainder_cents };
   to_date is null when the amount is short of one full unit (it all
   carries forward). */
function coverPeriod(fromDate, amount, rateAmount, unit) {
  const amountCents = Math.round(Number(amount) * 100);
  const rateCents = Math.round(Number(rateAmount) * 100);
  const whole = amountCents > 0 && rateCents > 0 ? Math.floor(amountCents / rateCents) : 0;

  const start = parse(fromDate);
  const endExclusive = addUnits(start, unit, whole);

  return {
    to_date: whole > 0 ? fmt(addDays(endExclusive, -1)) : null,
    units: whole,
    days_covered: daysBetween(start, endExclusive),
    cover_cents: whole * rateCents,
    remainder_cents: amountCents - whole * rateCents,
  };
}

const dayAfter = s => fmt(addDays(parse(s), 1));

/* Value of covering fromDate..toDate (inclusive) at `rateAmount` per `unit`,
   in CENTS. For any period coverPeriod produces this is exactly
   units × rate. If staff set dates by hand that aren't whole units, the
   leftover days are priced at that unit's daily share (rate / days in the
   unit), so a hand-extended cover shows up as arrears rather than free days. */
function valueOfPeriodCents(fromDate, toDate, rateAmount, unit) {
  const start = parse(fromDate);
  const endExclusive = addDays(parse(toDate), 1);
  if (endExclusive <= start) return 0;
  const rateCents = Math.round(Number(rateAmount) * 100);

  // Whole units: arithmetic for fixed-length units, stepping for calendar ones.
  let whole;
  const totalDays = daysBetween(start, endExclusive);
  if (unit === 'day') whole = totalDays;
  else if (unit === 'week') whole = Math.floor(totalDays / 7);
  else {
    whole = 0;
    while (addUnits(start, unit, whole + 1) <= endExclusive) whole++;
  }
  const afterWhole = addUnits(start, unit, whole);
  const leftoverDays = daysBetween(afterWhole, endExclusive);
  const unitDays = daysBetween(afterWhole, addUnits(afterWhole, unit, 1));
  return whole * rateCents + Math.round((leftoverDays * rateCents) / unitDays);
}

module.exports = { coverPeriod, unitOf, dayAfter, valueOfPeriodCents };
