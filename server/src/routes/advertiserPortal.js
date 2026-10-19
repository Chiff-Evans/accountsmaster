const router  = require('express').Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const { generateRefNo } = require('../helpers/refNumber');
const { getInitialStage, recordHistory } = require('../helpers/workflow');
const { notify, notifyAdmins, mountNotificationRoutes } = require('../helpers/notify');
const { mountPushRoutes } = require('../utils/pushNotify');
const { sendVerificationCode, verifyCode, isEmailVerified } = require('../helpers/emailVerification');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/advertisers');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `advertiser_${Date.now()}${path.extname(file.originalname)}`),
});
const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});

const campaignStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/campaigns');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `campaign_${file.fieldname}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const ATTACHMENT_ALLOWED = /\.(pdf|docx?|xlsx?|pptx?|csv|txt|zip|jpe?g|png|gif|webp)$/i;
const campaignFileFilter = (req, file, cb) => {
  if (file.fieldname === 'posters') {
    if (!file.mimetype.startsWith('image/')) {
      const err = new Error('Posters must be image files (JPG, PNG, WEBP, GIF)');
      err.status = 400;
      return cb(err);
    }
    return cb(null, true);
  }
  if (!ATTACHMENT_ALLOWED.test(file.originalname)) {
    const err = new Error('Attachments must be an image, PDF, Word, Excel, PowerPoint, CSV, TXT or ZIP file');
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
};
const uploadCampaignFiles = multer({ storage: campaignStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: campaignFileFilter })
  .fields([{ name: 'posters', maxCount: 10 }, { name: 'attachments', maxCount: 10 }]);

function parseJsonArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
}

const ADVERTISER_SECRET = process.env.ADVERTISER_JWT_SECRET || 'sm-advertiser-portal-2026';

/* ── strip HTML tags to prevent stored XSS ── */
function sanitize(val) {
  if (typeof val !== 'string') return val ?? null;
  return val.replace(/<[^>]*>/g, '').trim() || null;
}

/* ── advertiser JWT middleware ── */
const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], ADVERTISER_SECRET);
    if (decoded.type !== 'advertiser')
      return res.status(401).json({ message: 'Invalid token' });
    const [[advertiser]] = await pool.query(
      'SELECT id, status FROM advertisers WHERE id=?', [decoded.id]
    );
    if (!advertiser) return res.status(401).json({ message: 'Account not found' });
    if (advertiser.status !== 'active')
      return res.status(403).json({ message: `Account is ${advertiser.status}. Contact support.` });
    req.advertiser = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

function issueToken(id, rememberMe = false) {
  const expiresIn = rememberMe ? '30d' : '1d';
  return jwt.sign({ id, type: 'advertiser' }, ADVERTISER_SECRET, { expiresIn });
}

const SAFE_FIELDS = `id,advertiser_ref_no,advertiser_type_id,advertiser_name,firstname,lastname,gender,industry_id,
  country_id,county_id,subcounty_id,logo_url,phone,email,username,status,loyalty_points,
  workflow_id,workflow_stage_id,created_at`.replace(/\s+/g, ' ');

/* ════════════════════════════════════════
   PUBLIC — no auth
   ════════════════════════════════════════ */

/* GET /api/advertiser-portal/business-info — configured business name (client-safe, no auth needed) */
router.get('/business-info', async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT business_name, logo FROM business WHERE id=1 LIMIT 1');
    res.json({ business_name: row?.business_name || null, logo: row?.logo || null });
  } catch (err) { next(err); }
});

/* GET /api/advertiser-portal/parameters/values?parameter_id=X — public
   read-only lookup used to populate dropdowns (Advertiser Types, Industry,
   Country/County/Sub-County, Campaign Types, Duration Units, Target
   Audience, etc.) both before and after login. */
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

/* POST /api/advertiser-portal/auth/send-verification-code — emails a
   one-time code to the address the registrant entered. */
router.post('/auth/send-verification-code', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'A valid email is required' });
    await sendVerificationCode('advertiser', email);
    res.json({ message: 'Verification code sent' });
  } catch (err) { next(err); }
});

/* POST /api/advertiser-portal/auth/verify-code — confirms the code the
   registrant received, unlocking registration for that email. */
router.post('/auth/verify-code', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
    await verifyCode('advertiser', email, code);
    res.json({ message: 'Email verified' });
  } catch (err) { next(err); }
});

/* POST /api/advertiser-portal/auth/register — registers an Advertiser. Goes
   straight into the Advertiser Registration Approval workflow; the account
   stays `inactive` (can't log in) until MIS staff approves it. */
router.post('/auth/register', uploadLogo.single('logo'), async (req, res, next) => {
  try {
    const { advertiser_type_id, advertiser_name, industry_id, country_id, county_id, subcounty_id,
            gender, phone, username, password } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();

    if (!advertiser_name || !username || !password)
      return res.status(400).json({ message: 'Advertiser name, username and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (!EMAIL_RE.test(email))
      return res.status(400).json({ message: 'A valid email is required' });
    if (!(await isEmailVerified('advertiser', email)))
      return res.status(400).json({ message: 'Please verify your email address before registering' });

    const [dup] = await pool.query(
      'SELECT id FROM advertisers WHERE username=?', [sanitize(username)]
    );
    if (dup.length)
      return res.status(409).json({ message: 'Username already taken' });

    const hash = await bcrypt.hash(password, 10);
    const logo_url = req.file ? `/uploads/advertisers/${req.file.filename}` : null;
    const initStage = await getInitialStage('advertisers');
    // A file number is only assigned immediately if the initial stage is
    // configured to do so (Workflow config → stage → "Assign File Number");
    // otherwise it's left null and assigned later, on approval.
    const ref = initStage?.assign_ref_no ? await generateRefNo('advertiser_registration') : null;
    const name = sanitize(advertiser_name);

    const [r] = await pool.query(
      `INSERT INTO advertisers
         (advertiser_ref_no, advertiser_type_id, advertiser_name, firstname, lastname, gender, industry_id,
          country_id, county_id, subcounty_id, logo_url, phone, email, username, password_hash,
          status, workflow_id, workflow_stage_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [ref, advertiser_type_id || null, name, name, '', gender || null, industry_id || null,
       country_id || null, county_id || null, subcounty_id || null, logo_url,
       sanitize(phone), sanitize(email), sanitize(username), hash,
       'inactive', initStage?.workflow_id || null, initStage?.stage_id || null]
    );

    if (initStage) {
      await recordHistory({
        workflowId: initStage.workflow_id, processTypeId: initStage.process_type_id,
        entityType: 'advertiser', entityId: r.insertId, entityRef: ref,
        toStageId: initStage.stage_id, notes: 'Registered via advertiser portal — pending approval',
      });
    }

    const [[advertiser]] = await pool.query(
      `SELECT ${SAFE_FIELDS} FROM advertisers WHERE id=?`, [r.insertId]
    );
    await notifyAdmins('advertiser_registered', {
      title: 'New advertiser registration',
      body: `${name}${ref ? ` (${ref})` : ''} registered and is awaiting review.`,
      url: '/advertisers',
    });
    res.status(201).json({
      message: 'Registration submitted. Your account will be reviewed before you can log in.',
      advertiser,
    });
  } catch (err) { next(err); }
});

/* POST /api/advertiser-portal/auth/login */
router.post('/auth/login', async (req, res, next) => {
  try {
    const { username, password, remember_me } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required' });

    const [rows] = await pool.query(
      `SELECT id,username,password_hash,status,advertiser_name,firstname,lastname,
              gender,phone,email,advertiser_ref_no
       FROM advertisers WHERE username=?`,
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

    const { password_hash, ...advertiserData } = c;
    res.json({ token: issueToken(c.id, !!remember_me), advertiser: advertiserData });
  } catch (err) { next(err); }
});

/* ════════════════════════════════════════
   PROTECTED — all routes below require auth
   ════════════════════════════════════════ */
router.use(auth);
mountNotificationRoutes(router, 'advertiser', req => req.advertiser.id);

/* GET /api/advertiser-portal/loyalty-status — is the loyalty programme currently active? (advertiser-safe, no other config exposed) */
router.get('/loyalty-status', async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT is_active FROM loyalty_config WHERE id=1 LIMIT 1');
    res.json({ is_active: !!row?.is_active });
  } catch (err) { next(err); }
});

/* GET /api/advertiser-portal/auth/me */
router.get('/auth/me', async (req, res, next) => {
  try {
    const [[advertiser]] = await pool.query(
      `SELECT ${SAFE_FIELDS} FROM advertisers WHERE id=?`, [req.advertiser.id]
    );
    res.json(advertiser);
  } catch (err) { next(err); }
});

/* PUT /api/advertiser-portal/profile */
router.put('/profile', uploadLogo.single('logo'), async (req, res, next) => {
  try {
    const { advertiser_name, industry_id, country_id, county_id, subcounty_id, gender, phone, email } = req.body;
    if (!advertiser_name)
      return res.status(400).json({ message: 'Advertiser name is required' });

    const [[existing]] = await pool.query('SELECT logo_url FROM advertisers WHERE id=?', [req.advertiser.id]);
    const logo_url = req.file ? `/uploads/advertisers/${req.file.filename}` : existing?.logo_url;
    const name = sanitize(advertiser_name);

    await pool.query(
      `UPDATE advertisers SET advertiser_name=?,firstname=?,industry_id=?,country_id=?,county_id=?,
         subcounty_id=?,logo_url=?,gender=?,phone=?,email=? WHERE id=?`,
      [name, name, industry_id || null, country_id || null, county_id || null, subcounty_id || null,
       logo_url, gender || null, sanitize(phone), sanitize(email), req.advertiser.id]
    );
    const [[advertiser]] = await pool.query(
      `SELECT ${SAFE_FIELDS} FROM advertisers WHERE id=?`, [req.advertiser.id]
    );
    res.json(advertiser);
  } catch (err) { next(err); }
});

/* POST /api/advertiser-portal/auth/change-password */
router.post('/auth/change-password', async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ message: 'Both current and new password required' });
    if (new_password.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const [[row]] = await pool.query(
      'SELECT password_hash FROM advertisers WHERE id=?', [req.advertiser.id]
    );
    if (!row?.password_hash)
      return res.status(400).json({ message: 'No password set on this account' });
    if (!await bcrypt.compare(current_password, row.password_hash))
      return res.status(400).json({ message: 'Current password is incorrect' });

    await pool.query(
      'UPDATE advertisers SET password_hash=? WHERE id=?',
      [await bcrypt.hash(new_password, 10), req.advertiser.id]
    );
    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(err); }
});

/* ── CAMPAIGNS ── */

const CAMPAIGN_SELECT = `
  SELECT c.*,
         ct.paramater_value  AS campaign_type_name,
         du.paramater_value  AS duration_unit_name,
         tco.paramater_value AS target_country_name, tcy.paramater_value AS target_county_name,
         tsc.paramater_value AS target_subcounty_name,
         ws.stage_name, ws.stage_color
  FROM campaigns c
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

/* GET /api/advertiser-portal/campaigns — the logged-in advertiser's own campaigns */
router.get('/campaigns', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${CAMPAIGN_SELECT} WHERE c.advertiser_id=? ORDER BY c.created_on DESC`, [req.advertiser.id]);
    res.json(rows.map(withCampaignJson));
  } catch (err) { next(err); }
});

/* GET /api/advertiser-portal/campaigns/:id */
router.get('/campaigns/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${CAMPAIGN_SELECT} WHERE c.id=? AND c.advertiser_id=?`, [req.params.id, req.advertiser.id]);
    if (!rows.length) return res.status(404).json({ message: 'Campaign not found' });
    res.json(withCampaignJson(rows[0]));
  } catch (err) { next(err); }
});

/* POST /api/advertiser-portal/campaigns — create a campaign; enters the
   Campaign Approval Workflow at its initial ("Draft") stage. */
router.post('/campaigns', uploadCampaignFiles, async (req, res, next) => {
  try {
    const { campaign_title, campaign_type_id, description, website_link, whatsapp_number, promo_code,
            duration_value, duration_unit_id, target_country_id, target_county_id, target_subcounty_id,
            budget, comments } = req.body;
    if (!campaign_title) return res.status(400).json({ message: 'Campaign title is required' });

    const posters = JSON.stringify((req.files?.posters || []).map(f => `/uploads/campaigns/${f.filename}`));
    const attachments = JSON.stringify((req.files?.attachments || []).map(f => `/uploads/campaigns/${f.filename}`));
    const target_audience = JSON.stringify(parseJsonArray(req.body.target_audience));
    const initStage = await getInitialStage('campaigns');
    // A file number is only assigned immediately if the initial stage is
    // configured to do so (Workflow config → stage → "Assign File Number");
    // otherwise it's left null and assigned later, on approval.
    const file_no = initStage?.assign_ref_no ? await generateRefNo('campaign_creation') : null;

    const [r] = await pool.query(
      `INSERT INTO campaigns
         (file_no, advertiser_id, campaign_title, campaign_type_id, description, posters, attachments,
          website_link, whatsapp_number, promo_code, duration_value, duration_unit_id, target_audience,
          target_country_id, target_county_id, target_subcounty_id, budget, comments,
          workflow_id, workflow_stage_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [file_no, req.advertiser.id, sanitize(campaign_title), campaign_type_id || null, sanitize(description),
       posters, attachments, sanitize(website_link), sanitize(whatsapp_number), sanitize(promo_code),
       duration_value || null, duration_unit_id || null, target_audience, target_country_id || null,
       target_county_id || null, target_subcounty_id || null, budget || null, sanitize(comments),
       initStage?.workflow_id || null, initStage?.stage_id || null]
    );

    if (initStage) {
      await recordHistory({
        workflowId: initStage.workflow_id, processTypeId: initStage.process_type_id,
        entityType: 'campaign', entityId: r.insertId, entityRef: file_no,
        toStageId: initStage.stage_id, notes: `Created via advertiser portal (advertiser #${req.advertiser.id})`,
      });
    }

    const [[campaign]] = await pool.query(`${CAMPAIGN_SELECT} WHERE c.id=?`, [r.insertId]);
    res.status(201).json(withCampaignJson(campaign));
  } catch (err) { next(err); }
});

/* PUT /api/advertiser-portal/campaigns/:id — edit own campaign while still in Draft */
router.put('/campaigns/:id', uploadCampaignFiles, async (req, res, next) => {
  try {
    const [[own]] = await pool.query(
      `SELECT c.id, c.posters, c.attachments, ws.stage_name, ws.is_terminal
       FROM campaigns c LEFT JOIN workflow_stages ws ON c.workflow_stage_id = ws.id
       WHERE c.id=? AND c.advertiser_id=?`,
      [req.params.id, req.advertiser.id]
    );
    if (!own) return res.status(404).json({ message: 'Campaign not found' });
    if (own.stage_name && own.stage_name !== 'Draft')
      return res.status(403).json({ message: 'This campaign can no longer be edited once submitted for review' });

    const { campaign_title, campaign_type_id, description, website_link, whatsapp_number, promo_code,
            duration_value, duration_unit_id, target_country_id, target_county_id, target_subcounty_id,
            budget, comments } = req.body;
    if (!campaign_title) return res.status(400).json({ message: 'Campaign title is required' });

    const newPosters = (req.files?.posters || []).map(f => `/uploads/campaigns/${f.filename}`);
    const newAttachments = (req.files?.attachments || []).map(f => `/uploads/campaigns/${f.filename}`);
    const keptPosters = parseJsonArray(req.body.existing_posters);
    const keptAttachments = parseJsonArray(req.body.existing_attachments);
    const posters = JSON.stringify([...keptPosters, ...newPosters]);
    const attachments = JSON.stringify([...keptAttachments, ...newAttachments]);
    const target_audience = JSON.stringify(parseJsonArray(req.body.target_audience));

    await pool.query(
      `UPDATE campaigns SET campaign_title=?, campaign_type_id=?, description=?, posters=?, attachments=?,
         website_link=?, whatsapp_number=?, promo_code=?, duration_value=?, duration_unit_id=?,
         target_audience=?, target_country_id=?, target_county_id=?, target_subcounty_id=?, budget=?, comments=?
       WHERE id=?`,
      [sanitize(campaign_title), campaign_type_id || null, sanitize(description), posters, attachments,
       sanitize(website_link), sanitize(whatsapp_number), sanitize(promo_code), duration_value || null,
       duration_unit_id || null, target_audience, target_country_id || null, target_county_id || null,
       target_subcounty_id || null, budget || null, sanitize(comments), req.params.id]
    );
    const [[campaign]] = await pool.query(`${CAMPAIGN_SELECT} WHERE c.id=?`, [req.params.id]);
    res.json(withCampaignJson(campaign));
  } catch (err) { next(err); }
});

/* POST /api/advertiser-portal/campaigns/:id/submit — Draft -> Submitted for Review */
router.post('/campaigns/:id/submit', async (req, res, next) => {
  try {
    const [[own]] = await pool.query(
      `SELECT c.id, c.file_no, c.workflow_id, c.workflow_stage_id, ws.stage_name
       FROM campaigns c LEFT JOIN workflow_stages ws ON c.workflow_stage_id = ws.id
       WHERE c.id=? AND c.advertiser_id=?`,
      [req.params.id, req.advertiser.id]
    );
    if (!own) return res.status(404).json({ message: 'Campaign not found' });
    if (own.stage_name !== 'Draft')
      return res.status(400).json({ message: `Campaign is already "${own.stage_name}"` });

    const [[transition]] = await pool.query(
      `SELECT t.id AS transition_id, ts.id AS to_stage_id, ts.stage_name AS to_stage_name
       FROM workflow_transitions t JOIN workflow_stages ts ON t.to_stage_id = ts.id
       WHERE t.workflow_id=? AND t.from_stage_id=? AND ts.stage_name='Reviewing' LIMIT 1`,
      [own.workflow_id, own.workflow_stage_id]
    );
    if (!transition) return res.status(400).json({ message: 'No submit transition configured' });

    await pool.query('UPDATE campaigns SET workflow_stage_id=? WHERE id=?', [transition.to_stage_id, req.params.id]);
    await recordHistory({
      workflowId: own.workflow_id, entityType: 'campaign', entityId: own.id, entityRef: own.file_no,
      fromStageId: own.workflow_stage_id, toStageId: transition.to_stage_id,
      fromStatus: own.stage_name, toStatus: transition.to_stage_name,
      notes: `Submitted for review via advertiser portal (advertiser #${req.advertiser.id})`,
    });
    await notifyAdmins('campaign_submitted', {
      title: 'New campaign submitted',
      body: `A campaign${own.file_no ? ` (${own.file_no})` : ''} was submitted for review from the advertiser portal.`,
      url: '/campaigns',
    });
    res.json({ message: 'Campaign submitted for review', stage_name: transition.to_stage_name });
  } catch (err) { next(err); }
});

/* ── Web Push ─────────────────────────────────────────────────────────────── */
mountPushRoutes(router, 'advertiser', req => req.advertiser.id, auth);

module.exports = router;
