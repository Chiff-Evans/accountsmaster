const crypto = require('crypto');
const pool = require('../config/db');
const { sendMail } = require('./mailer');

const CODE_TTL_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 1000;
const MAX_ATTEMPTS = 5;
// How long a verified code stays usable to complete registration — long
// enough to finish filling out the rest of the form.
const VERIFIED_WINDOW_MINUTES = 30;

function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

async function sendVerificationCode(audience, email) {
  const [[recent]] = await pool.query(
    `SELECT created_on FROM email_verification_codes
     WHERE audience=? AND email=? ORDER BY created_on DESC LIMIT 1`,
    [audience, email]
  );
  if (recent && (Date.now() - new Date(recent.created_on).getTime()) < RESEND_COOLDOWN_SECONDS * 1000) {
    const err = new Error('Please wait a moment before requesting another code');
    err.status = 429;
    throw err;
  }

  const code = generateCode();
  await pool.query(
    `INSERT INTO email_verification_codes (audience, email, code, expires_at)
     VALUES (?,?,?, DATE_ADD(NOW(), INTERVAL ${CODE_TTL_MINUTES} MINUTE))`,
    [audience, email, code]
  );

  await sendMail({
    to: email,
    subject: 'Your Accounts Master verification code',
    html: `<p>Your verification code is <strong style="font-size:20px;letter-spacing:2px;">${code}</strong>.</p>
           <p>It expires in ${CODE_TTL_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>`,
  });
}

async function verifyCode(audience, email, code) {
  const [[row]] = await pool.query(
    `SELECT * FROM email_verification_codes
     WHERE audience=? AND email=? AND verified=0
     ORDER BY created_on DESC LIMIT 1`,
    [audience, email]
  );
  if (!row) { const err = new Error('No verification code found for this email — please request one'); err.status = 400; throw err; }
  if (new Date(row.expires_at) < new Date()) { const err = new Error('Code expired — please request a new one'); err.status = 400; throw err; }
  if (row.attempts >= MAX_ATTEMPTS) { const err = new Error('Too many incorrect attempts — please request a new code'); err.status = 400; throw err; }

  if (row.code !== String(code).trim()) {
    await pool.query('UPDATE email_verification_codes SET attempts=attempts+1 WHERE id=?', [row.id]);
    const err = new Error('Incorrect code');
    err.status = 400;
    throw err;
  }

  await pool.query('UPDATE email_verification_codes SET verified=1 WHERE id=?', [row.id]);
}

async function isEmailVerified(audience, email) {
  const [[row]] = await pool.query(
    `SELECT id FROM email_verification_codes
     WHERE audience=? AND email=? AND verified=1
       AND created_on > DATE_SUB(NOW(), INTERVAL ${VERIFIED_WINDOW_MINUTES} MINUTE)
     ORDER BY created_on DESC LIMIT 1`,
    [audience, email]
  );
  return !!row;
}

module.exports = { sendVerificationCode, verifyCode, isEmailVerified };
