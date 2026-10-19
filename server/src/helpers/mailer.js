const nodemailer = require('nodemailer');

let transporter;

// Lazily built so a change to env vars (or none being set at all) is picked
// up without restructuring — and so dev environments without SMTP configured
// don't crash, they just log the email instead of sending it.
function getTransporter() {
  if (transporter !== undefined) return transporter;
  if (!process.env.SMTP_HOST) { transporter = null; return transporter; }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`[mailer] SMTP not configured — email to "${to}" was not sent.\nSubject: ${subject}\n${html}`);
    return;
  }
  await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html });
}

// For free-text (e.g. a staff member's rejection comment) interpolated into
// an HTML email body — preserves the text while preventing it from breaking
// the markup.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

module.exports = { sendMail, escapeHtml };
