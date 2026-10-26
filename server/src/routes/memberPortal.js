const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const { generateRefNo } = require('../helpers/refNumber');
const { getInitialStage, recordHistory } = require('../helpers/workflow');
const { notifyAdmins, mountNotificationRoutes } = require('../helpers/notify');
const { mountPushRoutes } = require('../utils/pushNotify');
const { sendVerificationCode, verifyCode, isEmailVerified } = require('../helpers/emailVerification');
const { depositSum, withdrawalSum } = require('../helpers/transactionTypes');
const { fundFigures, fundStatement, getPortalSettings } = require('../helpers/fundSummary');
const { encodeId, decodeId } = require('../utils/hashids');

/* Record ids leave the portal API hashed (e.g. /transactions/Xk3pQa), so
   members never see raw, guessable database ids in URLs or responses. Only
   the canonical hash is accepted back — padded/alternate spellings that
   decode to the same number are rejected. Ownership is still enforced by
   every query (member_id = req.member.id); the hash is not the access check. */
const withHashedId = row => ({ ...row, id: encodeId(row.id) });
const decodeHashedId = hash => {
  const id = decodeId(hash);
  return id && encodeId(id) === String(hash) ? id : null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MEMBER_SECRET = process.env.MEMBER_JWT_SECRET || 'sm-member-portal-2026';

/* ── strip HTML tags to prevent stored XSS ── */
function sanitize(val) {
  if (typeof val !== 'string') return val ?? null;
  return val.replace(/<[^>]*>/g, '').trim() || null;
}

/* ── member JWT middleware ── */
const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], MEMBER_SECRET);
    if (decoded.type !== 'member')
      return res.status(401).json({ message: 'Invalid token' });
    const [[member]] = await pool.query(
      'SELECT id, status FROM members WHERE id=?', [decoded.id]
    );
    if (!member) return res.status(401).json({ message: 'Account not found' });
    if (member.status !== 'active')
      return res.status(403).json({ message: `Account is ${member.status}. Contact support.` });
    req.member = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

function issueToken(id, rememberMe = false) {
  const expiresIn = rememberMe ? '30d' : '1d';
  return jwt.sign({ id, type: 'member' }, MEMBER_SECRET, { expiresIn });
}

/* What a member may see about themselves. Position, ID number, reg date
   and reg fee are staff-maintained, so the portal shows them read-only. */
const PROFILE_SELECT = `
  SELECT m.id, m.member_ref_no, m.member_name, m.position_id, pos.paramater_value AS position_name,
         m.id_number, m.gender_id, gen.paramater_value AS gender_name, m.phone, m.email,
         DATE_FORMAT(m.reg_date, '%Y-%m-%d') AS reg_date, m.reg_fee, m.username, m.status, m.created_at
  FROM members m
  LEFT JOIN parameter_values pos ON m.position_id = pos.id
  LEFT JOIN parameter_values gen ON m.gender_id = gen.id
`;

const getProfile = async id => {
  const [[member]] = await pool.query(`${PROFILE_SELECT} WHERE m.id=?`, [id]);
  return member;
};

/* ════════════════════════════════════════
   PUBLIC — no auth
   ════════════════════════════════════════ */

/* GET /api/member-portal/business-info — configured business name (client-safe, no auth needed) */
router.get('/business-info', async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT business_name, logo FROM business WHERE id=1 LIMIT 1');
    res.json({ business_name: row?.business_name || null, logo: row?.logo || null });
  } catch (err) { next(err); }
});

/* GET /api/member-portal/parameters/values?text_id=X (or parameter_id=X) —
   public read-only lookup for dropdowns, before and after login. */
router.get('/parameters/values', async (req, res, next) => {
  try {
    const { parameter_id, text_id } = req.query;
    if (!parameter_id && !text_id) return res.status(400).json({ message: 'parameter_id or text_id is required' });
    const [rows] = await pool.query(
      `SELECT id, parent_value_id, paramater_value, description, is_default FROM parameter_values
       WHERE parameter_id=${parameter_id ? '?' : '(SELECT id FROM parameters WHERE text_id=? LIMIT 1)'}
         AND is_active=1 ORDER BY paramater_value`,
      [parameter_id || text_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

/* POST /api/member-portal/auth/send-verification-code — emails a
   one-time code to the address the registrant entered. */
router.post('/auth/send-verification-code', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'A valid email is required' });
    await sendVerificationCode('member', email);
    res.json({ message: 'Verification code sent' });
  } catch (err) { next(err); }
});

/* POST /api/member-portal/auth/verify-code — confirms the code the
   registrant received, unlocking registration for that email. */
router.post('/auth/verify-code', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
    await verifyCode('member', email, code);
    res.json({ message: 'Email verified' });
  } catch (err) { next(err); }
});

/* POST /api/member-portal/auth/register — self-registration. Goes straight
   into the Member Registration Approval workflow; the account stays
   `inactive` (can't log in) until staff approve it. Position defaults to
   the Positions parameter's default value; reg fee is left for staff. */
router.post('/auth/register', async (req, res, next) => {
  try {
    const { member_name, id_number, gender_id, phone, username, password } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();

    if (!member_name || !username || !password)
      return res.status(400).json({ message: 'Name, username and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (!EMAIL_RE.test(email))
      return res.status(400).json({ message: 'A valid email is required' });
    if (!(await isEmailVerified('member', email)))
      return res.status(400).json({ message: 'Please verify your email address before registering' });

    const [dup] = await pool.query('SELECT id FROM members WHERE username=?', [sanitize(username)]);
    if (dup.length)
      return res.status(409).json({ message: 'Username already taken' });

    const [[defaultPosition]] = await pool.query(
      `SELECT pv.id FROM parameter_values pv JOIN parameters p ON p.id = pv.parameter_id
       WHERE p.text_id = 'parties-positions' AND pv.is_default = 1 AND pv.is_active = 1 LIMIT 1`
    );

    const hash = await bcrypt.hash(password, 10);
    const initStage = await getInitialStage('members');
    // A ref number is only assigned immediately if the initial stage is
    // configured to do so (Workflow config → stage → "Assign File Number");
    // otherwise it's left null and assigned later, on approval.
    const ref = initStage?.assign_ref_no ? await generateRefNo('member_registration') : null;
    const name = sanitize(member_name);

    const [r] = await pool.query(
      `INSERT INTO members
         (member_ref_no, member_name, firstname, lastname, position_id, id_number, gender_id, phone, email,
          reg_date, username, password_hash, status, workflow_id, workflow_stage_id)
       VALUES (?,?,?,?,?,?,?,?,?,CURDATE(),?,?,?,?,?)`,
      [ref, name, name, '', defaultPosition?.id || null, sanitize(id_number), gender_id || null,
       sanitize(phone), sanitize(email), sanitize(username), hash,
       'inactive', initStage?.workflow_id || null, initStage?.stage_id || null]
    );

    if (initStage) {
      await recordHistory({
        workflowId: initStage.workflow_id, processTypeId: initStage.process_type_id,
        entityType: 'member', entityId: r.insertId, entityRef: ref,
        toStageId: initStage.stage_id, notes: 'Registered via member portals — pending approval',
      });
    }

    await notifyAdmins('member_registered', {
      title: 'New member registration',
      body: `${name}${ref ? ` (${ref})` : ''} registered and is awaiting review.`,
      url: '/members',
    });
    res.status(201).json({
      message: 'Registration submitted. Your account will be reviewed before you can log in.',
      member: await getProfile(r.insertId),
    });
  } catch (err) { next(err); }
});

/* POST /api/member-portal/auth/login */
router.post('/auth/login', async (req, res, next) => {
  try {
    const { username, password, remember_me } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required' });

    const [rows] = await pool.query(
      'SELECT id, password_hash, status FROM members WHERE username=?',
      [sanitize(username)]
    );
    if (!rows.length || !rows[0].password_hash)
      return res.status(401).json({ message: 'Invalid username or password' });

    const c = rows[0];
    if (c.status !== 'active')
      return res.status(403).json({
        message: c.status === 'inactive'
          ? 'Your registration is still pending approval. You will be able to log in once approved.'
          : `Account is ${c.status}. Contact support.`,
      });

    if (!await bcrypt.compare(password, c.password_hash))
      return res.status(401).json({ message: 'Invalid username or password' });

    res.json({ token: issueToken(c.id, !!remember_me), member: await getProfile(c.id) });
  } catch (err) { next(err); }
});

/* ════════════════════════════════════════
   PROTECTED — all routes below require auth
   ════════════════════════════════════════ */
router.use(auth);
mountNotificationRoutes(router, 'member', req => req.member.id);

/* GET /api/member-portal/auth/me */
router.get('/auth/me', async (req, res, next) => {
  try { res.json(await getProfile(req.member.id)); } catch (err) { next(err); }
});

/* PUT /api/member-portal/profile — members can keep their own contact
   details current; name, ID number, position and registration details
   are maintained by staff. */
router.put('/profile', async (req, res, next) => {
  try {
    const { gender_id, phone } = req.body;
    const email = req.body.email ? String(req.body.email).trim().toLowerCase() : null;
    if (email && !EMAIL_RE.test(email))
      return res.status(400).json({ message: 'Enter a valid email address' });

    await pool.query(
      'UPDATE members SET gender_id=?, phone=?, email=? WHERE id=?',
      [gender_id || null, sanitize(phone), sanitize(email), req.member.id]
    );
    res.json(await getProfile(req.member.id));
  } catch (err) { next(err); }
});

/* POST /api/member-portal/auth/change-password */
router.post('/auth/change-password', async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ message: 'Both current and new password required' });
    if (new_password.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const [[row]] = await pool.query(
      'SELECT password_hash FROM members WHERE id=?', [req.member.id]
    );
    if (!row?.password_hash)
      return res.status(400).json({ message: 'No password set on this account' });
    if (!await bcrypt.compare(current_password, row.password_hash))
      return res.status(400).json({ message: 'Current password is incorrect' });

    await pool.query(
      'UPDATE members SET password_hash=? WHERE id=?',
      [await bcrypt.hash(new_password, 10), req.member.id]
    );
    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(err); }
});

/* ── STATEMENT — the member's standing against the active target, worked
   out exactly like Stake-Holders > Statistics in the MIS:
     net = deposits - withdrawals, balance = max(target - net, 0),
     overpayment = max(net - target, 0). ── */
router.get('/statement', async (req, res, next) => {
  try {
    // Internal accounts (is_human = 0) aren't held to the target.
    const [[who]] = await pool.query('SELECT is_human FROM members WHERE id=?', [req.member.id]);
    const [[activeTarget]] = await pool.query(
      `SELECT target_amount, DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date
       FROM targets WHERE is_active = 1 LIMIT 1`
    );
    const target = Number(who?.is_human) === 0 ? null : activeTarget;
    const [[tx]] = await pool.query(
      `SELECT ${depositSum()} AS deposits, ${withdrawalSum()} AS withdrawals, COUNT(t.id) AS transaction_count,
              DATE_FORMAT(MAX(t.transaction_date), '%Y-%m-%d') AS last_transaction_date
       FROM transactions t
       LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id
       WHERE t.member_id = ?`,
      [req.member.id]
    );

    // cents, so the figures never pick up floating-point drift
    const c = v => Math.round(Number(v || 0) * 100);
    const deposits = c(tx.deposits);
    const withdrawals = c(tx.withdrawals);
    const net = deposits - withdrawals;
    const targetCents = target ? c(target.target_amount) : null;

    res.json({
      deposits: deposits / 100,
      withdrawals: withdrawals / 100,
      net: net / 100,
      transaction_count: tx.transaction_count,
      last_transaction_date: tx.last_transaction_date,
      target: target ? { target_amount: targetCents / 100, target_date: target.target_date } : null,
      balance: target ? Math.max(targetCents - net, 0) / 100 : null,
      overpayment: target ? Math.max(net - targetCents, 0) / 100 : null,
      percent: target && targetCents > 0 ? Math.min(Math.round((Math.max(net, 0) / targetCents) * 1000) / 10, 100) : null,
    });
  } catch (err) { next(err); }
});

/* ── GROUP FUND — group-wide figures staff chose to share (Configurations >
   Portal Settings). Only the switched-on figures are sent: a hidden figure
   never leaves the server, so it can't be read from the browser either. ── */
router.get('/fund-summary', async (req, res, next) => {
  try {
    const settings = await getPortalSettings();
    if (!settings.show_total_balance && !settings.show_interest && !settings.show_deductions) return res.json({});
    const f = await fundFigures();
    const out = {};
    if (settings.show_total_balance) out.total_balance = f.total_balance;
    if (settings.show_interest && f.interest != null) out.interest = f.interest;
    if (settings.show_deductions && f.deductions != null) out.deductions = f.deductions;
    res.json(out);
  } catch (err) { next(err); }
});

/* GET /api/member-portal/fund-statement/:kind — kind = interest | deductions.
   The transactions behind that Group Fund figure. Gated by the same Portal
   Settings switch as the figure itself, so a hidden figure can't be read
   through its statement either. */
const FUND_KINDS = {
  interest:   { flag: 'is_interest_account',   setting: 'show_interest',   title: 'Interest' },
  deductions: { flag: 'is_deductions_account', setting: 'show_deductions', title: 'Deductions / Taxes' },
};
router.get('/fund-statement/:kind', async (req, res, next) => {
  try {
    const kind = FUND_KINDS[req.params.kind];
    if (!kind) return res.status(404).json({ message: 'Not found' });
    const settings = await getPortalSettings();
    if (!settings[kind.setting]) return res.status(403).json({ message: 'This statement is not available.' });
    const { rows, totals } = await fundStatement(kind.flag);
    res.json({ title: kind.title, rows, totals });
  } catch (err) { next(err); }
});

/* ── TRANSACTIONS — the member's own, read-only ── */
router.get('/transactions', async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const typeFilter = req.query.transaction_type_id ? 'AND t.transaction_type_id = ?' : '';
    const typeParam  = req.query.transaction_type_id ? [req.query.transaction_type_id] : [];

    // The list is a summary — Other Details is only sent with a single
    // transaction (GET /transactions/:id), shown on its details page.
    const [rows] = await pool.query(
      `SELECT t.id, t.file_no, t.amount, t.transaction_type_id,
              tt.paramater_value AS transaction_type_name,
              DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
              DATE_FORMAT(t.from_date, '%Y-%m-%d') AS from_date,
              DATE_FORMAT(t.to_date, '%Y-%m-%d') AS to_date
       FROM transactions t
       LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id
       WHERE t.member_id = ? ${typeFilter}
       ORDER BY t.transaction_date DESC, t.id DESC
       LIMIT ? OFFSET ?`,
      [req.member.id, ...typeParam, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM transactions t WHERE t.member_id = ? ${typeFilter}`,
      [req.member.id, ...typeParam]
    );
    res.json({ data: rows.map(withHashedId), total, page, limit });
  } catch (err) { next(err); }
});

/* GET /api/member-portal/transactions/:id — one of the member's own
   transactions in full, by hashed id. Scoped to req.member.id, so another
   member's transaction is a 404, not a leak. */
router.get('/transactions/:id', async (req, res, next) => {
  try {
    const id = decodeHashedId(req.params.id);
    if (!id) return res.status(404).json({ message: 'Transaction not found' });
    const [[tx]] = await pool.query(
      `SELECT t.id, t.file_no, t.amount, t.other_details, t.transaction_type_id,
              tt.paramater_value AS transaction_type_name,
              DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
              DATE_FORMAT(t.from_date, '%Y-%m-%d') AS from_date,
              DATE_FORMAT(t.to_date, '%Y-%m-%d') AS to_date,
              t.rate_amount, t.rate_unit,
              t.credit_brought_forward, t.cover_value, t.credit_carried_forward,
              t.created_on, t.updated_on
       FROM transactions t
       LEFT JOIN parameter_values tt ON t.transaction_type_id = tt.id
       WHERE t.id = ? AND t.member_id = ?`,
      [id, req.member.id]
    );
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json(withHashedId(tx));
  } catch (err) { next(err); }
});

/* ── NEXT OF KIN — the member's own, read-only (staff maintain them) ── */
router.get('/next-of-kin', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT k.id, k.kin_ref_no, k.kin_name, k.id_number, k.phone, k.email,
              rel.paramater_value AS relationship_name
       FROM member_next_of_kin k
       LEFT JOIN parameter_values rel ON k.relationship_id = rel.id
       WHERE k.member_id = ?
       ORDER BY k.id`,
      [req.member.id]
    );
    res.json(rows.map(withHashedId));
  } catch (err) { next(err); }
});

/* ── Web Push ─────────────────────────────────────────────────────────────── */
mountPushRoutes(router, 'member', req => req.member.id, auth);

module.exports = router;
