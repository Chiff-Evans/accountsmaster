const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sha256 = str => crypto.createHash('sha256').update(str).digest('hex');
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');
const { getInitialStage, getWorkflowStages, recordHistory, validateTransition, statusForStage } = require('../helpers/workflow');
const { notify } = require('../helpers/notify');
const { sendMail, escapeHtml } = require('../helpers/mailer');

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/brand-ambassadors');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `brand_ambassador_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});
// `profile_image` (avatar) + `status_proof` (screenshot proving average
// status views, collected at registration) are both optional images.
const uploadFiles = upload.fields([
  { name: 'profile_image', maxCount: 1 },
  { name: 'status_proof', maxCount: 1 },
]);

router.use(authenticate);

const canCreate = requirePermission('/brand-ambassadors', 'can_create');
const canEdit   = requirePermission('/brand-ambassadors', 'can_edit');
const canDelete = requirePermission('/brand-ambassadors', 'can_delete');

async function getMinAvgStatusViews() {
  const [[row]] = await pool.query('SELECT min_avg_status_views FROM brand_ambassador_config WHERE id = 1');
  return Number(row?.min_avg_status_views || 0);
}

function parseJsonArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
}

const LIST_SELECT = `
  SELECT a.id, a.brand_ambassador_ref_no, a.full_name, a.phone, a.country_id, a.county_id, a.subcounty_id,
         a.avg_status_views, a.profile_image, a.status_proof_url, a.bio, a.areas_to_advertise, a.email, a.username,
         a.status, a.workflow_id, a.workflow_stage_id, a.created_at, a.updated_at,
         co.paramater_value AS country_name, cy.paramater_value AS county_name, sc.paramater_value AS subcounty_name,
         ws.stage_name, ws.stage_color, ws.responsible_group
  FROM brand_ambassadors a
  LEFT JOIN parameter_values co ON a.country_id = co.id
  LEFT JOIN parameter_values cy ON a.county_id = cy.id
  LEFT JOIN parameter_values sc ON a.subcounty_id = sc.id
  LEFT JOIN workflow_stages ws  ON a.workflow_stage_id = ws.id
`;

/* ── Preview the next ref no without consuming the serial ── */
router.get('/next-no', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.prefix, rn.next_serial, rn.padding, rn.use_year, rn.use_month
       FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       WHERE pt.process_type_name = 'brand_ambassador_registration'
       LIMIT 1`
    );
    if (!rows.length) return res.json({ brand_ambassador_ref_no: null });
    const cfg = rows[0];
    const padded = String(cfg.next_serial).padStart(cfg.padding, '0');
    const now = new Date();
    const year  = cfg.use_year  ? `-${now.getFullYear()}` : '';
    const month = cfg.use_month ? `-${String(now.getMonth() + 1).padStart(2, '0')}` : '';
    const sep = /[/-]$/.test(cfg.prefix) ? '' : '-';
    res.json({ brand_ambassador_ref_no: `${cfg.prefix}${year}${month}${sep}${padded}` });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    // No stage explicitly picked → hide stages staff marked "don't show in
    // grid by default" (e.g. Rejected). Picking one (even a hidden one)
    // shows exactly that stage's records, overriding the default.
    const stageFilter = req.query.stage_id ? 'AND a.workflow_stage_id = ?' : "AND (ws.id IS NULL OR ws.show_in_grid_default = 1)";
    const stageParam = req.query.stage_id ? [req.query.stage_id] : [];
    const [rows] = await pool.query(
      `${LIST_SELECT}
       WHERE (a.full_name LIKE ? OR a.phone LIKE ? OR a.email LIKE ? OR a.username LIKE ? OR a.brand_ambassador_ref_no LIKE ?) ${stageFilter}
       ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
      [search, search, search, search, search, ...stageParam, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM brand_ambassadors a
       LEFT JOIN workflow_stages ws ON a.workflow_stage_id = ws.id
       WHERE (a.full_name LIKE ? OR a.phone LIKE ? OR a.email LIKE ? OR a.username LIKE ? OR a.brand_ambassador_ref_no LIKE ?) ${stageFilter}`,
      [search, search, search, search, search, ...stageParam]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

/* ── Stages of the active Brand Ambassador workflow, for the grid's stage filter ── */
router.get('/stages', async (req, res, next) => {
  try { res.json(await getWorkflowStages('brand_ambassadors')); } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${LIST_SELECT} WHERE a.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json({ ...rows[0], areas_to_advertise: parseJsonArray(rows[0].areas_to_advertise) });
  } catch (err) { next(err); }
});

/* ── Available transitions from a brand ambassador's current stage ── */
router.get('/:id/transitions', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id AS transition_id, t.action_label,
              cs.responsible_group,
              ts.id AS to_stage_id, ts.stage_name AS to_stage_name, ts.stage_color AS to_stage_color
       FROM brand_ambassadors a
       JOIN workflow_stages cs     ON a.workflow_stage_id = cs.id
       JOIN workflow_transitions t ON t.from_stage_id = cs.id AND t.workflow_id = a.workflow_id
       JOIN workflow_stages ts     ON t.to_stage_id = ts.id
       WHERE a.id = ?
       ORDER BY t.id`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', canCreate, uploadFiles, async (req, res, next) => {
  try {
    const { full_name, phone, country_id, county_id, subcounty_id, avg_status_views,
            bio, email, username, password } = req.body;
    if (!full_name) return res.status(400).json({ message: 'Full name is required' });

    const minViews = await getMinAvgStatusViews();
    if (!avg_status_views || Number(avg_status_views) < minViews)
      return res.status(400).json({ message: `Average Status Views is required and must be at least ${minViews.toLocaleString()}` });

    const profile_image = req.files?.profile_image?.[0] ? `/uploads/brand-ambassadors/${req.files.profile_image[0].filename}` : null;
    const status_proof_url = req.files?.status_proof?.[0] ? `/uploads/brand-ambassadors/${req.files.status_proof[0].filename}` : null;
    const areas_to_advertise = JSON.stringify(parseJsonArray(req.body.areas_to_advertise));
    const hash = username ? await bcrypt.hash(password || sha256('Password@12345'), 10) : null;
    const initStage = await getInitialStage('brand_ambassadors');
    const brand_ambassador_ref_no = initStage?.assign_ref_no ? await generateRefNo('brand_ambassador_registration') : null;

    const [result] = await pool.query(
      `INSERT INTO brand_ambassadors
         (brand_ambassador_ref_no, full_name, phone, country_id, county_id, subcounty_id, avg_status_views,
          profile_image, status_proof_url, bio, areas_to_advertise, email, username, password_hash, status,
          workflow_id, workflow_stage_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [brand_ambassador_ref_no, full_name, phone || null, country_id || null, county_id || null, subcounty_id || null,
       avg_status_views || null, profile_image, status_proof_url, bio || null, areas_to_advertise, email || null,
       username || null, hash, 'active', initStage?.workflow_id || null, initStage?.stage_id || null]
    );

    if (initStage) {
      await recordHistory({
        workflowId: initStage.workflow_id, processTypeId: initStage.process_type_id,
        entityType: 'brand_ambassador', entityId: result.insertId, entityRef: brand_ambassador_ref_no,
        toStageId: initStage.stage_id, movedBy: req.user.id, notes: 'Brand Ambassador registered via MIS',
      });
    }

    const [rows] = await pool.query(`${LIST_SELECT} WHERE a.id=?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, uploadFiles, async (req, res, next) => {
  try {
    const { full_name, phone, country_id, county_id, subcounty_id, avg_status_views,
            bio, email, username, status } = req.body;

    const minViews = await getMinAvgStatusViews();
    if (!avg_status_views || Number(avg_status_views) < minViews)
      return res.status(400).json({ message: `Average Status Views is required and must be at least ${minViews.toLocaleString()}` });

    const [[existing]] = await pool.query('SELECT profile_image, status_proof_url FROM brand_ambassadors WHERE id=?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const profile_image = req.files?.profile_image?.[0] ? `/uploads/brand-ambassadors/${req.files.profile_image[0].filename}` : existing.profile_image;
    const status_proof_url = req.files?.status_proof?.[0] ? `/uploads/brand-ambassadors/${req.files.status_proof[0].filename}` : existing.status_proof_url;
    const areas_to_advertise = JSON.stringify(parseJsonArray(req.body.areas_to_advertise));

    await pool.query(
      `UPDATE brand_ambassadors SET
         full_name=?, phone=?, country_id=?, county_id=?, subcounty_id=?, avg_status_views=?,
         profile_image=?, status_proof_url=?, bio=?, areas_to_advertise=?, email=?, username=?, status=?
       WHERE id=?`,
      [full_name, phone || null, country_id || null, county_id || null, subcounty_id || null,
       avg_status_views || null, profile_image, status_proof_url, bio || null, areas_to_advertise, email || null,
       username || null, status || 'active', req.params.id]
    );
    const [rows] = await pool.query(`${LIST_SELECT} WHERE a.id=?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM brand_ambassadors WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

/* POST /brand-ambassadors/:id/action — lock, suspend, revoke, activate */
router.post('/:id/action', canEdit, async (req, res, next) => {
  try {
    const { action } = req.body;
    const allowed = ['active', 'inactive', 'locked', 'suspended', 'revoked'];
    if (!allowed.includes(action)) return res.status(400).json({ message: 'Invalid action' });
    await pool.query('UPDATE brand_ambassadors SET status=? WHERE id=?', [action, req.params.id]);
    res.json({ message: `Brand Ambassador status updated to ${action}` });
  } catch (err) { next(err); }
});

/* POST /brand-ambassadors/:id/reset-password */
router.post('/:id/reset-password', canEdit, async (req, res, next) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE brand_ambassadors SET password_hash=? WHERE id=?', [hash, req.params.id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) { next(err); }
});

/* ── Move a brand ambassador to the next stage via a defined workflow
   transition — approving also activates the account (status='active'),
   letting them log into the portal for the first time. ── */
router.post('/:id/transition', canEdit, async (req, res, next) => {
  try {
    const { transition_id, notes } = req.body;

    const [[brandAmbassador]] = await pool.query(
      `SELECT a.id, a.brand_ambassador_ref_no, a.workflow_id, a.workflow_stage_id, a.full_name, a.email,
              ws.responsible_group, ws.stage_name AS current_stage_name, w.process_type_id
       FROM brand_ambassadors a
       JOIN workflow_stages ws ON a.workflow_stage_id = ws.id
       JOIN workflows w        ON a.workflow_id       = w.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (!brandAmbassador) return res.status(404).json({ message: 'Brand Ambassador not found' });

    if (brandAmbassador.responsible_group) {
      const [[roleRow]] = await pool.query('SELECT id FROM roles WHERE role_name = ?', [brandAmbassador.responsible_group]);
      if (!roleRow || !(req.user.roles || []).includes(roleRow.id)) {
        return res.status(403).json({
          message: `Only users with role "${brandAmbassador.responsible_group}" can move brand ambassadors from "${brandAmbassador.current_stage_name}"`,
        });
      }
    }

    const transition = await validateTransition(transition_id, brandAmbassador.workflow_id, brandAmbassador.workflow_stage_id);
    if (!transition) return res.status(400).json({ message: 'Invalid transition for current stage' });

    const newStatus = statusForStage(transition.to_stage_name);
    await pool.query(
      `UPDATE brand_ambassadors SET workflow_stage_id = ?${newStatus ? ', status = ?' : ''} WHERE id = ?`,
      newStatus ? [transition.to_stage_id, newStatus, req.params.id] : [transition.to_stage_id, req.params.id]
    );

    // A file number is assigned the first time a brand ambassador reaches a
    // stage configured (Workflow config → stage → "Assign File Number") to
    // trigger it — typically "Approved" — rather than at registration.
    let assignedRef = null;
    if (transition.to_assign_ref_no && !brandAmbassador.brand_ambassador_ref_no) {
      assignedRef = await generateRefNo('brand_ambassador_registration');
      await pool.query('UPDATE brand_ambassadors SET brand_ambassador_ref_no = ? WHERE id = ?', [assignedRef, req.params.id]);
    }

    await recordHistory({
      workflowId: brandAmbassador.workflow_id, processTypeId: brandAmbassador.process_type_id,
      entityType: 'brand_ambassador', entityId: brandAmbassador.id, entityRef: assignedRef || brandAmbassador.brand_ambassador_ref_no,
      fromStageId: brandAmbassador.workflow_stage_id, toStageId: transition.to_stage_id,
      fromStatus: brandAmbassador.current_stage_name, toStatus: transition.to_stage_name,
      movedBy: req.user.id, notes,
    });

    if (transition.to_is_terminal) {
      await notify('brand_ambassador', brandAmbassador.id, 'registration_reviewed', {
        title: `Registration ${transition.to_stage_name}`,
        body: newStatus === 'active'
          ? 'Your brand ambassador registration has been approved — you can now log in to the portal.'
          : `Your brand ambassador registration was marked "${transition.to_stage_name}".`,
        url: '/brand-ambassador/profile',
      });
    }

    // Whether this specific destination stage should trigger an email is a
    // per-stage toggle set by admins in Workflow config, not hardcoded to any
    // particular stage name — lets them decide exactly when it fires. The
    // Comment entered for this transition becomes the reason included in the
    // email when rejecting, so applicants learn why instead of just "pending".
    if (transition.to_send_approval_email && brandAmbassador.email) {
      const isApproved = newStatus === 'active';
      const loginUrl = `${process.env.PORTAL_BASE_URL || 'http://localhost:8800'}/brand-ambassador/login`;
      const reasonHtml = !isApproved && notes ? `<p><strong>Reason:</strong> ${escapeHtml(notes)}</p>` : '';
      const loginHtml = isApproved ? `<p><a href="${loginUrl}">Log in to the Portal</a></p>` : '';
      await sendMail({
        to: brandAmbassador.email,
        subject: `Your account — ${transition.to_stage_name}`,
        html: `<p>Hi ${brandAmbassador.full_name || ''},</p>
               <p>${isApproved
                 ? 'Your brand ambassador registration has been approved. You can now log in to the portal.'
                 : `Your brand ambassador registration status has been updated to "${transition.to_stage_name}".`}</p>
               ${reasonHtml}
               ${loginHtml}`,
      }).catch(err => console.error('Approval email failed:', err.message));
    }

    res.json({ message: 'Stage updated', stage_name: transition.to_stage_name, stage_color: transition.to_stage_color, status: newStatus, ref_no: assignedRef || undefined });
  } catch (err) { next(err); }
});

module.exports = router;
