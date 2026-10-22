/* Contribution period maths — how far an amount paid at the active
   contribution rate (amount per time unit) carries a member's cover.

   All dates are 'YYYY-MM-DD' strings handled in UTC, so no timezone can
   shift a day. Whole units are calendar-true (1 month from 31 Jan is
   28/29 Feb, 1 year from 29 Feb is 28 Feb); a fractional unit becomes whole
   days of the next unit (half a 30-day month = 15 days). Any remainder
   smaller than a day is not carried. */

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

/* Returns { to_date, units, days_covered } for `amount` paid at
   `rateAmount` per `unit`, starting on `fromDate` (inclusive).
   to_date is null when the amount buys less than one day. */
function coverPeriod(fromDate, amount, rateAmount, unit) {
  const units = Number(amount) / Number(rateAmount);
  const whole = Math.floor(units + 1e-9);
  const frac = units - whole;

  const start = parse(fromDate);
  const afterWhole = addUnits(start, unit, whole);
  let extraDays = 0;
  if (frac > 1e-9) {
    const unitDays = daysBetween(afterWhole, addUnits(afterWhole, unit, 1));
    extraDays = Math.floor(frac * unitDays + 1e-9);
  }
  const endExclusive = addDays(afterWhole, extraDays);
  const daysCovered = daysBetween(start, endExclusive);

  return {
    to_date: daysCovered > 0 ? fmt(addDays(endExclusive, -1)) : null,
    units: Math.round(units * 10000) / 10000,
    days_covered: daysCovered,
  };
}

const dayAfter = s => fmt(addDays(parse(s), 1));

module.exports = { coverPeriod, unitOf, dayAfter };
