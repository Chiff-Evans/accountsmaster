const pool = require('../config/db');
const { depositSum, withdrawalSum } = require('./transactionTypes');

/* Group-wide figures members can be shown on the portal (Configurations >
   Portal Settings decides which):
     total_balance  every account's deposits minus withdrawals — what the
                    group holds overall, interest in and deductions out
     interest       deposits into the account(s) marked as the interest
                    account (members.is_interest_account)
     deductions     withdrawals from the account(s) marked as the deductions
                    account (members.is_deductions_account)
   interest / deductions are null when no account carries that flag, so the
   portal leaves them out instead of showing a misleading 0.
   Worked in cents to avoid float drift. */
async function fundFigures() {
  const [[row]] = await pool.query(
    `SELECT ${depositSum()} AS deposits,
            ${withdrawalSum()} AS withdrawals,
            ${depositSum('tt', 'IF(m.is_interest_account = 1, t.amount, 0)')} AS interest,
            ${withdrawalSum('tt', 'IF(m.is_deductions_account = 1, t.amount, 0)')} AS deductions
     FROM transactions t
     JOIN members m                ON m.id = t.member_id
     LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id`
  );
  const [[flags]] = await pool.query(
    `SELECT SUM(is_interest_account = 1) AS interest_accounts, SUM(is_deductions_account = 1) AS deductions_accounts
     FROM members`
  );
  const c = v => Math.round(Number(v || 0) * 100);
  return {
    total_balance: (c(row.deposits) - c(row.withdrawals)) / 100,
    interest: Number(flags.interest_accounts) ? c(row.interest) / 100 : null,
    deductions: Number(flags.deductions_accounts) ? c(row.deductions) / 100 : null,
  };
}

/* The transactions behind a Group Fund figure: every transaction of the
   account(s) carrying `flagCol` (is_interest_account / is_deductions_account),
   newest first, plus totals. Member-safe: no member ids, no raw tx ids. */
async function fundStatement(flagCol) {
  if (!['is_interest_account', 'is_deductions_account'].includes(flagCol)) throw new Error('bad flag');
  const [rows] = await pool.query(
    `SELECT t.file_no, t.amount, t.other_details, tt.paramater_value AS transaction_type_name,
            m.member_name AS account_name,
            DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
            DATE_FORMAT(t.from_date, '%Y-%m-%d') AS from_date,
            DATE_FORMAT(t.to_date, '%Y-%m-%d') AS to_date
     FROM transactions t
     JOIN members m                ON m.id = t.member_id AND m.${flagCol} = 1
     LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id
     ORDER BY t.transaction_date DESC, t.id DESC`
  );
  const c = v => Math.round(Number(v || 0) * 100);
  let dep = 0, wd = 0;
  for (const r of rows) {
    if (/^deposit/i.test(r.transaction_type_name || '')) dep += c(r.amount);
    else if (/^withdraw/i.test(r.transaction_type_name || '')) wd += c(r.amount);
  }
  return { rows, totals: { deposits: dep / 100, withdrawals: wd / 100, count: rows.length } };
}

async function getPortalSettings() {
  const [[row]] = await pool.query(
    'SELECT show_total_balance, show_interest, show_deductions, updated_on FROM portal_settings WHERE id = 1'
  );
  return {
    show_total_balance: !!row?.show_total_balance,
    show_interest: !!row?.show_interest,
    show_deductions: !!row?.show_deductions,
    updated_on: row?.updated_on || null,
  };
}

module.exports = { fundFigures, fundStatement, getPortalSettings };
