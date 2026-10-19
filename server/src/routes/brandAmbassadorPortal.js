const router  = require('express').Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const { generateRefNo } = require('../helpers/refNumber');
const { getInitialStage, recordHistory } = require('../helpers/workflow');
const { notifyAdmins, mountNotificationRoutes } = require('../helpers/notify');
const { mountPushRoutes } = require('../utils/pushNotify');
const { sendVerificationCode, verifyCode, isEmailVerified } = require('../helpers/emailVerification');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BRAND_AMBASSADOR_SECRET = process.env.BRAND_AMBASSADOR_JWT_SECRET || 'sm-brand-ambassador-portal-2026';

/* ── strip HTML tags to prevent stored XSS ── */
function sanitize(val) {
  if (typeof val !== 'string') return val ?? null;
  return val.replace(/<[^>]*>/g, '').trim() || null;
}

function parseJsonArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
}

async function getMinAvgStatusViews() {
  const [[row]] = await pool.query('SELECT min_avg_status_views FROM brand_ambassador_config WHERE id = 1');
  return Number(row?.min_avg_status_views || 0);
}

/* 0 (or unset) means unlimited resubmissions. */
async function getMaxProofResubmissions() {
  const [[row]] = await pool.query('SELECT max_proof_resubmissions FROM brand_ambassador_config WHERE id = 1');
  return Number(row?.max_proof_resubmissions || 0);
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/brand-ambassadors');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `brand_ambassador_${Date.now()}${path.extname(file.originalname)}`),
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});
// `profile_image` (avatar) + `status_proof` (screenshot proving average status
// views) are both optional images uploaded from the same form.
const uploadFiles = uploadAvatar.fields([
  { name: 'profile_image', maxCount: 1 },
  { name: 'status_proof', maxCount: 1 },
]);

/* ── brand ambassador JWT middleware (separate secret/type from the
   member portal, so a brand ambassador token and a member token
   can never be confused) ── */
const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], BRAND_AMBASSADOR_SECRET);
    if (decoded.type !== 'brand_ambassador')
      return res.status(401).json({ message: 'Invalid token' });
    const [[brandAmbassador]] = await pool.query('SELECT id, status FROM brand_ambassadors WHERE id=?', [decoded.id]);
    if (!brandAmbassador) return res.status(401).json({ message: 'Account not found' });
    if (brandAmbassador.status !== 'active')
      return res.status(403).json({ message: `Account is ${brandAmbassador.status}. Contact support.` });
    req.brandAmbassador = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

function issueToken(id, rememberMe = false) {
  const expiresIn = rememberMe ? '30d' : '1d';
  return jwt.sign({ id, type: 'brand_ambassador' }, BRAND_AMBASSADOR_SECRET, { expiresIn });
}

const SAFE_FIELDS = `id,brand_ambassador_ref_no,full_name,phone,country_id,county_id,subcounty_id,
  avg_status_views,profile_image,status_proof_url,bio,areas_to_advertise,email,username,status,
  workflow_id,workflow_stage_id,created_at`.replace(/\s+/g, ' ');

/* ════════════════════════════════════════
   PUBLIC — no auth
   ════════════════════════════════════════ */

/* GET /api/brand-ambassador-portal/business-info — configured business name (public, no auth needed) */
router.get('/business-info', async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT business_name, logo FROM business WHERE id=1 LIMIT 1');
    res.json({ business_name: row?.business_name || null, logo: row?.logo || null });
  } catch (err) { next(err); }
});

/* GET /api/brand-ambassador-portal/parameters/values?parameter_id=X — same
   generic read-only lookup as the member portal (Country/County/Sub-County,
   Advertising Areas, etc). */
router.get('/parameters/values', async (req, res, next) => {
  try {
    const { parameter_id } = req.query;
    if (!parameter_id) return res.status(400).json({ message: 'parameter_id is required' });
    const [rows] = await pool.query(
      'SELECT id, parent_value_id, paramater_value, description, is_default FROM parameter_values WHERE parameter_id=? AND is_active=1 ORDER BY paramater_value',
      [parameter_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

/* GET /api/brand-ambassador-portal/config — client-safe config (currently
   just the minimum Average Status Views figure), used to validate the
   registration and profile forms before submitting. */
router.get('/config', async (req, res, next) => {
  try {
    res.json({
      min_avg_status_views: await getMinAvgStatusViews(),
      max_proof_resubmissions: await getMaxProofResubmissions(),
    });
  } catch (err) { next(err); }
});

/* POST /api/brand-ambassador-portal/auth/send-verification-code — emails a
   one-time code to the address the registrant entered. */
router.post('/auth/send-verification-code', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'A valid email is required' });
    await sendVerificationCode('brand_ambassador', email);
    res.json({ message: 'Verification code sent' });
  } catch (err) { next(err); }
});

/* POST /api/brand-ambassador-portal/auth/verify-code — confirms the code the
   registrant received, unlocking registration for that email. */
router.post('/auth/verify-code', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
    await verifyCode('brand_ambassador', email, code);
    res.json({ message: 'Email verified' });
  } catch (err) { next(err); }
});

/* POST /api/brand-ambassador-portal/auth/register — enters the Brand
   Ambassador Registration Approval workflow; account stays `inactive` until
   approved. */
router.post('/auth/register', uploadFiles, async (req, res, next) => {
  try {
    const { full_name, phone, country_id, county_id, subcounty_id, avg_status_views,
            bio, username, password } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();

    if (!full_name || !username || !password)
      return res.status(400).json({ message: 'Full name, username and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (!EMAIL_RE.test(email))
      return res.status(400).json({ message: 'A valid email is required' });
    if (!(await isEmailVerified('brand_ambassador', email)))
      return res.status(400).json({ message: 'Please verify your email address before registering' });

    const minViews = await getMinAvgStatusViews();
    if (!avg_status_views || Number(avg_status_views) < minViews)
      return res.status(400).json({ message: `Average Status Views is required and must be at least ${minViews.toLocaleString()}` });
    if (!req.files?.status_proof?.[0])
      return res.status(400).json({ message: 'Proof of Average Status Views is required' });

    const [dup] = await pool.query('SELECT id FROM brand_ambassadors WHERE username=?', [sanitize(username)]);
    if (dup.length) return res.status(409).json({ message: 'Username already taken' });

    const hash = await bcrypt.hash(password, 10);
    const profile_image = req.files?.profile_image?.[0] ? `/uploads/brand-ambassadors/${req.files.profile_image[0].filename}` : null;
    const status_proof_url = req.files?.status_proof?.[0] ? `/uploads/brand-ambassadors/${req.files.status_proof[0].filename}` : null;
    const areas_to_advertise = JSON.stringify(parseJsonArray(req.body.areas_to_advertise));
    const initStage = await getInitialStage('brand_ambassadors');
    // A file number is only assigned immediately if the initial stage is
    // configured to do so (Workflow config → stage → "Assign File Number");
    // otherwise it's left null and assigned later, on approval.
    const ref = initStage?.assign_ref_no ? await generateRefNo('brand_ambassador_registration') : null;

    const [r] = await pool.query(
      `INSERT INTO brand_ambassadors
         (brand_ambassador_ref_no, full_name, phone, country_id, county_id, subcounty_id, avg_status_views,
          profile_image, status_proof_url, bio, areas_to_advertise, email, username, password_hash, status,
          workflow_id, workflow_stage_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [ref, sanitize(full_name), sanitize(phone), country_id || null, county_id || null, subcounty_id || null,
       avg_status_views || null, profile_image, status_proof_url, sanitize(bio), areas_to_advertise, sanitize(email),
       sanitize(username), hash, 'inactive', initStage?.workflow_id || null, initStage?.stage_id || null]
    );

    if (initStage) {
      await recordHistory({
        workflowId: initStage.workflow_id, processTypeId: initStage.process_type_id,
        entityType: 'brand_ambassador', entityId: r.insertId, entityRef: ref,
        toStageId: initStage.stage_id, notes: 'Registered via brand ambassador portal — pending approval',
      });
    }

    const [[brandAmbassador]] = await pool.query(`SELECT ${SAFE_FIELDS} FROM brand_ambassadors WHERE id=?`, [r.insertId]);
    await notifyAdmins('brand_ambassador_registered', {
      title: 'New brand ambassador registration',
      body: `${sanitize(full_name)}${ref ? ` (${ref})` : ''} registered and is awaiting review.`,
      url: '/brand-ambassadors',
    });
    res.status(201).json({
      message: 'Registration submitted. Your account will be reviewed before you can log in.',
      brand_ambassador: brandAmbassador,
    });
  } catch (err) { next(err); }
});

/* POST /api/brand-ambassador-portal/auth/login */
router.post('/auth/login', async (req, res, next) => {
  try {
    const { username, password, remember_me } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required' });

    const [rows] = await pool.query(
      `SELECT ${SAFE_FIELDS.replace('id,', 'id,password_hash,')} FROM brand_ambassadors WHERE username=?`,
      [sanitize(username)]
    );
    if (!rows.length || !rows[0].password_hash)
      return res.status(401).json({ message: 'Invalid username or password' });

    const a = rows[0];
    if (a.status !== 'active')
      return res.status(403).json({
        message: a.status === 'inactive'
          ? 'Your registration is still pending approval. You will be able to log in once approved.'
          : `Account is ${a.status}. Contact support.`,
      });

    if (!await bcrypt.compare(password, a.password_hash))
      return res.status(401).json({ message: 'Invalid username or password' });

    const { password_hash, ...brandAmbassadorData } = a;
    res.json({ token: issueToken(a.id, !!remember_me), brand_ambassador: { ...brandAmbassadorData, areas_to_advertise: parseJsonArray(brandAmbassadorData.areas_to_advertise) } });
  } catch (err) { next(err); }
});

/* ════════════════════════════════════════
   PROTECTED — all routes below require auth
   ════════════════════════════════════════ */
router.use(auth);
mountNotificationRoutes(router, 'brand_ambassador', req => req.brandAmbassador.id);
// Everything on this router already requires auth (line above), so push
// routes need no extra per-route auth middleware of their own.
mountPushRoutes(router, 'brand_ambassador', req => req.brandAmbassador.id, (req, res, next) => next());

/* GET /api/brand-ambassador-portal/auth/me */
router.get('/auth/me', async (req, res, next) => {
  try {
    const [[brandAmbassador]] = await pool.query(`SELECT ${SAFE_FIELDS} FROM brand_ambassadors WHERE id=?`, [req.brandAmbassador.id]);
    res.json({ ...brandAmbassador, areas_to_advertise: parseJsonArray(brandAmbassador.areas_to_advertise) });
  } catch (err) { next(err); }
});

/* Creative + targeting details a brand ambassador needs to post (no
   budget/discount/payment fields — those are the member's own
   bookkeeping, not the brand ambassador's concern). */
const MY_CAMPAIGNS_SELECT = `
  SELECT c.id, c.file_no, c.campaign_title, c.description, c.posters, c.attachments,
         c.website_link, c.whatsapp_number, c.promo_code, c.duration_value,
         c.start_date, c.end_date,
         c.target_audience,
         cl.member_name,
         ct.paramater_value  AS campaign_type_name,
         du.paramater_value  AS duration_unit_name,
         tco.paramater_value AS target_country_name,
         tcy.paramater_value AS target_county_name,
         tsc.paramater_value AS target_subcounty_name,
         ws.stage_name, ws.stage_color, ws.member_can_edit,
         ca.assigned_on, ca.proof_deadline
  FROM campaign_brand_ambassadors ca
  JOIN campaigns c               ON ca.campaign_id = c.id
  LEFT JOIN members cl       ON c.member_id = cl.id
  LEFT JOIN parameter_values ct  ON c.campaign_type_id = ct.id
  LEFT JOIN parameter_values du  ON c.duration_unit_id = du.id
  LEFT JOIN parameter_values tco ON c.target_country_id = tco.id
  LEFT JOIN parameter_values tcy ON c.target_county_id = tcy.id
  LEFT JOIN parameter_values tsc ON c.target_subcounty_id = tsc.id
  LEFT JOIN workflow_stages ws   ON c.workflow_stage_id = ws.id
`;
function withCampaignJson(row) {
  if (!row) return row;
  return { ...row, posters: parseJsonArray(row.posters), attachments: parseJsonArray(row.attachments), target_audience: parseJsonArray(row.target_audience) };
}

/* GET /api/brand-ambassador-portal/my-campaigns — campaigns this brand
   ambassador has been assigned to run. */
router.get('/my-campaigns', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${MY_CAMPAIGNS_SELECT} WHERE ca.brand_ambassador_id = ? ORDER BY ca.assigned_on DESC`,
      [req.brandAmbassador.id]
    );
    res.json(rows.map(withCampaignJson));
  } catch (err) { next(err); }
});

/* GET /api/brand-ambassador-portal/my-campaigns/:id — single campaign
   detail, only if this brand ambassador is actually assigned to it. */
router.get('/my-campaigns/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${MY_CAMPAIGNS_SELECT} WHERE ca.campaign_id = ? AND ca.brand_ambassador_id = ?`,
      [req.params.id, req.brandAmbassador.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Campaign not found' });
    res.json(withCampaignJson(rows[0]));
  } catch (err) { next(err); }
});

const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/campaign-proofs');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `proof_${Date.now()}_${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const uploadProof = multer({
  storage: proofStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Proof must be an image file')),
});

/* GET /api/brand-ambassador-portal/campaign-proofs?campaign_id=X — this
   brand ambassador's own daily posting-proof submissions (optionally scoped
   to one campaign), so the portal can show which days are done/pending/
   rejected without a request per day. */
router.get('/campaign-proofs', async (req, res, next) => {
  try {
    const where = ['cp.brand_ambassador_id = ?'];
    const params = [req.brandAmbassador.id];
    if (req.query.campaign_id) { where.push('cp.campaign_id = ?'); params.push(req.query.campaign_id); }
    const [rows] = await pool.query(
      `SELECT cp.* FROM campaign_proofs cp WHERE ${where.join(' AND ')} ORDER BY cp.proof_date DESC`,
      params
    );
    res.json(rows);
  } catch (err) { next(err); }
});

/* POST /api/brand-ambassador-portal/campaign-proofs — submit (or resubmit,
   e.g. after a rejection) today's or a past day's screenshot proof of
   posting. Re-submitting resets the row back to "pending" for another
   review pass. */
router.post('/campaign-proofs', uploadProof.single('proof_image'), async (req, res, next) => {
  try {
    const { campaign_id, proof_date, status_views } = req.body;
    if (!campaign_id || !proof_date) return res.status(400).json({ message: 'campaign_id and proof_date are required' });
    if (!req.file) return res.status(400).json({ message: 'A screenshot proof image is required' });
    if (status_views === undefined || status_views === '' || Number(status_views) < 0)
      return res.status(400).json({ message: 'Number of status views is required' });

    const [[assigned]] = await pool.query(
      'SELECT assigned_on, proof_deadline FROM campaign_brand_ambassadors WHERE campaign_id=? AND brand_ambassador_id=?',
      [campaign_id, req.brandAmbassador.id]
    );
    if (!assigned) return res.status(403).json({ message: 'You are not assigned to this campaign' });

    const [[campaign]] = await pool.query(
      `SELECT c.start_date, c.end_date, ws.member_can_edit
       FROM campaigns c LEFT JOIN workflow_stages ws ON c.workflow_stage_id = ws.id
       WHERE c.id=?`,
      [campaign_id]
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (campaign.member_can_edit === 0) {
      return res.status(403).json({ message: 'Posting proof can no longer be submitted for this campaign at its current stage' });
    }

    const campaignStartStr = campaign.start_date ? new Date(campaign.start_date).toISOString().slice(0, 10) : null;
    const assignedStr = assigned.assigned_on ? new Date(assigned.assigned_on).toISOString().slice(0, 10) : null;
    // Proof is only owed from whichever is later — the campaign's own start,
    // or the day this brand ambassador was actually assigned to it.
    const startStr = assignedStr && campaignStartStr && assignedStr > campaignStartStr ? assignedStr : (assignedStr || campaignStartStr);
    // A per-assignment proof_deadline (set by staff) overrides the campaign's
    // own end_date — lets one brand ambassador be given more/less time than
    // the campaign's default window.
    const deadlineSource = assigned.proof_deadline || campaign.end_date;
    const endStr = deadlineSource ? new Date(deadlineSource).toISOString().slice(0, 10) : null;
    const today = new Date().toISOString().slice(0, 10);
    if (proof_date > today) return res.status(400).json({ message: 'Cannot submit proof for a future date' });
    if (startStr && proof_date < startStr) return res.status(400).json({ message: 'Proof date is before you were assigned to this campaign' });
    if (endStr && proof_date > endStr) return res.status(400).json({ message: 'Proof date is after the last date you can submit proof for this campaign' });

    const [[existing]] = await pool.query(
      'SELECT status, rejection_count FROM campaign_proofs WHERE campaign_id=? AND brand_ambassador_id=? AND proof_date=?',
      [campaign_id, req.brandAmbassador.id, proof_date]
    );
    if (existing?.status === 'rejected') {
      const maxResubmissions = await getMaxProofResubmissions();
      if (maxResubmissions > 0 && existing.rejection_count >= maxResubmissions) {
        return res.status(403).json({
          message: `This proof has been rejected ${existing.rejection_count} time(s) and can no longer be resubmitted (limit: ${maxResubmissions}). Contact support.`,
        });
      }
    }

    const image_path = `/uploads/campaign-proofs/${req.file.filename}`;
    await pool.query(
      `INSERT INTO campaign_proofs (campaign_id, brand_ambassador_id, proof_date, image_path, status_views, status)
       VALUES (?,?,?,?,?,'pending')
       ON DUPLICATE KEY UPDATE image_path=VALUES(image_path), status_views=VALUES(status_views), status='pending',
         review_notes=NULL, reviewed_by=NULL, reviewed_on=NULL, submitted_on=CURRENT_TIMESTAMP`,
      [campaign_id, req.brandAmbassador.id, proof_date, image_path, status_views]
    );
    const [[row]] = await pool.query(
      'SELECT * FROM campaign_proofs WHERE campaign_id=? AND brand_ambassador_id=? AND proof_date=?',
      [campaign_id, req.brandAmbassador.id, proof_date]
    );

    const [[ctx]] = await pool.query(
      `SELECT a.full_name AS brand_ambassador_name, c.campaign_title
       FROM brand_ambassadors a, campaigns c WHERE a.id=? AND c.id=?`,
      [req.brandAmbassador.id, campaign_id]
    );
    await notifyAdmins('proof_submitted', {
      title: 'New posting proof submitted',
      body: `${ctx?.brand_ambassador_name || 'A brand ambassador'} submitted a proof for "${ctx?.campaign_title || 'a campaign'}" (${proof_date}).`,
      url: '/campaigns/proof-review',
    });

    res.status(201).json(row);
  } catch (err) { next(err); }
});

/* PUT /api/brand-ambassador-portal/profile */
router.put('/profile', uploadFiles, async (req, res, next) => {
  try {
    const { full_name, phone, country_id, county_id, subcounty_id, avg_status_views, bio } = req.body;
    if (!full_name) return res.status(400).json({ message: 'Full name is required' });

    const minViews = await getMinAvgStatusViews();
    if (!avg_status_views || Number(avg_status_views) < minViews)
      return res.status(400).json({ message: `Average Status Views is required and must be at least ${minViews.toLocaleString()}` });

    const [[existing]] = await pool.query('SELECT profile_image, status_proof_url FROM brand_ambassadors WHERE id=?', [req.brandAmbassador.id]);
    const profile_image = req.files?.profile_image?.[0] ? `/uploads/brand-ambassadors/${req.files.profile_image[0].filename}` : existing?.profile_image;
    const status_proof_url = req.files?.status_proof?.[0] ? `/uploads/brand-ambassadors/${req.files.status_proof[0].filename}` : existing?.status_proof_url;
    const areas_to_advertise = JSON.stringify(parseJsonArray(req.body.areas_to_advertise));

    await pool.query(
      `UPDATE brand_ambassadors SET full_name=?, phone=?, country_id=?, county_id=?, subcounty_id=?,
         avg_status_views=?, profile_image=?, status_proof_url=?, bio=?, areas_to_advertise=? WHERE id=?`,
      [sanitize(full_name), sanitize(phone), country_id || null, county_id || null, subcounty_id || null,
       avg_status_views || null, profile_image, status_proof_url, sanitize(bio), areas_to_advertise, req.brandAmbassador.id]
    );
    const [[brandAmbassador]] = await pool.query(`SELECT ${SAFE_FIELDS} FROM brand_ambassadors WHERE id=?`, [req.brandAmbassador.id]);
    res.json({ ...brandAmbassador, areas_to_advertise: parseJsonArray(brandAmbassador.areas_to_advertise) });
  } catch (err) { next(err); }
});

/* POST /api/brand-ambassador-portal/auth/change-password */
router.post('/auth/change-password', async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ message: 'Both current and new password required' });
    if (new_password.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const [[row]] = await pool.query('SELECT password_hash FROM brand_ambassadors WHERE id=?', [req.brandAmbassador.id]);
    if (!row?.password_hash)
      return res.status(400).json({ message: 'No password set on this account' });
    if (!await bcrypt.compare(current_password, row.password_hash))
      return res.status(400).json({ message: 'Current password is incorrect' });

    await pool.query('UPDATE brand_ambassadors SET password_hash=? WHERE id=?', [await bcrypt.hash(new_password, 10), req.brandAmbassador.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
