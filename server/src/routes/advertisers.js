const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sha256 = str => crypto.createHash('sha256').update(str).digest('hex');
const pool   = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');
const { getInitialStage, getWorkflowStages, recordHistory, validateTransition, statusForStage } = require('../helpers/workflow');
const { notify } = require('../helpers/notify');
const { sendMail, escapeHtml } = require('../helpers/mailer');

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/advertisers');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `advertiser_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});

router.use(authenticate);

const canCreate = requirePermission('/advertisers', 'can_create');
const canEdit   = requirePermission('/advertisers', 'can_edit');
const canDelete = requirePermission('/advertisers', 'can_delete');

const LIST_SELECT = `
  SELECT c.id, c.advertiser_ref_no, c.advertiser_type_id, c.advertiser_name, c.firstname, c.lastname, c.gender,
         c.industry_id, c.country_id, c.county_id, c.subcounty_id, c.logo_url,
         c.phone, c.email, c.username, c.status, c.loyalty_points, c.workflow_id, c.workflow_stage_id,
         c.created_at, c.updated_at,
         ct.paramater_value AS advertiser_type_name, ind.paramater_value AS industry_name,
         co.paramater_value AS country_name, cy.paramater_value AS county_name, sc.paramater_value AS subcounty_name,
         ws.stage_name, ws.stage_color, ws.responsible_group
  FROM advertisers c
  LEFT JOIN parameter_values ct  ON c.advertiser_type_id = ct.id
  LEFT JOIN parameter_values ind ON c.industry_id = ind.id
  LEFT JOIN parameter_values co  ON c.country_id = co.id
  LEFT JOIN parameter_values cy  ON c.county_id = cy.id
  LEFT JOIN parameter_values sc  ON c.subcounty_id = sc.id
  LEFT JOIN workflow_stages ws   ON c.workflow_stage_id = ws.id
`;

router.get('/', async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    // No stage explicitly picked → hide stages staff marked "don't show in
    // grid by default" (e.g. Rejected). Picking one (even a hidden one)
    // shows exactly that stage's records, overriding the default.
    const stageFilter = req.query.stage_id ? 'AND c.workflow_stage_id = ?' : "AND (ws.id IS NULL OR ws.show_in_grid_default = 1)";
    const stageParam = req.query.stage_id ? [req.query.stage_id] : [];
    const [rows] = await pool.query(
      `${LIST_SELECT}
       WHERE (c.advertiser_name LIKE ? OR c.firstname LIKE ? OR c.lastname LIKE ? OR c.phone LIKE ?
          OR c.email LIKE ? OR c.username LIKE ?) ${stageFilter}
       GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [search, search, search, search, search, search, ...stageParam, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM advertisers c
       LEFT JOIN workflow_stages ws ON c.workflow_stage_id = ws.id
       WHERE (c.advertiser_name LIKE ? OR c.firstname LIKE ? OR c.lastname LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR c.username LIKE ?) ${stageFilter}`,
      [search, search, search, search, search, search, ...stageParam]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

/* ── Stages of the active Advertiser workflow, for the grid's stage filter ── */
router.get('/stages', async (req, res, next) => {
  try { res.json(await getWorkflowStages('advertisers')); } catch (err) { next(err); }
});

/* ── Preview the next ref no without consuming the serial ── */
router.get('/next-no', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.prefix, rn.next_serial, rn.padding, rn.use_year, rn.use_month
       FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       WHERE pt.process_type_name = 'advertiser_registration'
       LIMIT 1`
    );
    if (!rows.length) return res.json({ advertiser_ref_no: null });
    const cfg = rows[0];
    const padded = String(cfg.next_serial).padStart(cfg.padding, '0');
    const now = new Date();
    const year  = cfg.use_year  ? `-${now.getFullYear()}` : '';
    const month = cfg.use_month ? `-${String(now.getMonth() + 1).padStart(2, '0')}` : '';
    const sep = /[/-]$/.test(cfg.prefix) ? '' : '-';
    res.json({ advertiser_ref_no: `${cfg.prefix}${year}${month}${sep}${padded}` });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${LIST_SELECT} WHERE c.id=? GROUP BY c.id`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

/* ── Available transitions from an advertiser's current (approval) stage ── */
router.get('/:id/transitions', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id AS transition_id, t.action_label,
              cs.responsible_group,
              ts.id AS to_stage_id, ts.stage_name AS to_stage_name, ts.stage_color AS to_stage_color
       FROM advertisers c
       JOIN workflow_stages cs     ON c.workflow_stage_id = cs.id
       JOIN workflow_transitions t ON t.from_stage_id = cs.id AND t.workflow_id = c.workflow_id
       JOIN workflow_stages ts     ON t.to_stage_id = ts.id
       WHERE c.id = ?
       ORDER BY t.id`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', canCreate, upload.single('logo'), async (req, res, next) => {
  try {
    const { advertiser_type_id, advertiser_name, industry_id, country_id, county_id, subcounty_id,
            gender, phone, email, username, password } = req.body;
    if (!advertiser_name) return res.status(400).json({ message: 'Advertiser name is required' });

    const logo_url = req.file ? `/uploads/advertisers/${req.file.filename}` : null;
    const hash = username ? await bcrypt.hash(password || sha256('Password@12345'), 10) : null;
    const initStage = await getInitialStage('advertisers');
    const advertiser_ref_no = initStage?.assign_ref_no ? await generateRefNo('advertiser_registration') : null;

    const [result] = await pool.query(
      `INSERT INTO advertisers
         (advertiser_ref_no, advertiser_type_id, advertiser_name, firstname, lastname, gender, industry_id,
          country_id, county_id, subcounty_id, logo_url, phone, email, username, password_hash,
          workflow_id, workflow_stage_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [advertiser_ref_no, advertiser_type_id || null, advertiser_name, advertiser_name, '', gender || null,
       industry_id || null, country_id || null, county_id || null, subcounty_id || null, logo_url,
       phone || null, email || null, username || null, hash,
       initStage?.workflow_id || null, initStage?.stage_id || null]
    );

    if (initStage) {
      await recordHistory({
        workflowId: initStage.workflow_id, processTypeId: initStage.process_type_id,
        entityType: 'advertiser', entityId: result.insertId, entityRef: advertiser_ref_no,
        toStageId: initStage.stage_id, movedBy: req.user.id, notes: 'Advertiser registered via MIS',
      });
    }

    const [rows] = await pool.query(`${LIST_SELECT} WHERE c.id=? GROUP BY c.id`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, upload.single('logo'), async (req, res, next) => {
  try {
    const { advertiser_type_id, advertiser_name, industry_id, country_id, county_id, subcounty_id,
            gender, phone, email, username, status } = req.body;
    if (!advertiser_name) return res.status(400).json({ message: 'Advertiser name is required' });

    const [[existing]] = await pool.query('SELECT logo_url FROM advertisers WHERE id=?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const logo_url = req.file ? `/uploads/advertisers/${req.file.filename}` : existing.logo_url;

    await pool.query(
      `UPDATE advertisers SET
         advertiser_type_id=?, advertiser_name=?, firstname=?, industry_id=?, country_id=?, county_id=?,
         subcounty_id=?, logo_url=?, gender=?, phone=?, email=?, username=?, status=?
       WHERE id=?`,
      [advertiser_type_id || null, advertiser_name, advertiser_name, industry_id || null, country_id || null,
       county_id || null, subcounty_id || null, logo_url, gender || null, phone || null, email || null,
       username || null, status || 'active', req.params.id]
    );
    const [rows] = await pool.query(`${LIST_SELECT} WHERE c.id=? GROUP BY c.id`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM advertisers WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

/* POST /advertisers/:id/action — lock, suspend, revoke, activate */
router.post('/:id/action', canEdit, async (req, res, next) => {
  try {
    const { action } = req.body;
    const allowed = ['active', 'locked', 'suspended', 'revoked'];
    if (!allowed.includes(action))
      return res.status(400).json({ message: 'Invalid action' });
    await pool.query('UPDATE advertisers SET status=? WHERE id=?', [action, req.params.id]);
    res.json({ message: `Advertiser status updated to ${action}` });
  } catch (err) { next(err); }
});

/* ── Move an advertiser through its registration-approval workflow —
   approving also activates the account (status='active'). ── */
router.post('/:id/transition', canEdit, async (req, res, next) => {
  try {
    const { transition_id, notes } = req.body;

    const [[advertiser]] = await pool.query(
      `SELECT c.id, c.advertiser_ref_no, c.workflow_id, c.workflow_stage_id, c.advertiser_name, c.email,
              ws.responsible_group, ws.stage_name AS current_stage_name, w.process_type_id
       FROM advertisers c
       JOIN workflow_stages ws ON c.workflow_stage_id = ws.id
       JOIN workflows w        ON c.workflow_id       = w.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

    if (advertiser.responsible_group) {
      const [[roleRow]] = await pool.query('SELECT id FROM roles WHERE role_name = ?', [advertiser.responsible_group]);
      if (!roleRow || !(req.user.roles || []).includes(roleRow.id)) {
        return res.status(403).json({
          message: `Only users with role "${advertiser.responsible_group}" can move advertisers from "${advertiser.current_stage_name}"`,
        });
      }
    }

    const transition = await validateTransition(transition_id, advertiser.workflow_id, advertiser.workflow_stage_id);
    if (!transition) return res.status(400).json({ message: 'Invalid transition for current stage' });

    const newStatus = statusForStage(transition.to_stage_name);
    await pool.query(
      `UPDATE advertisers SET workflow_stage_id = ?${newStatus ? ', status = ?' : ''} WHERE id = ?`,
      newStatus ? [transition.to_stage_id, newStatus, req.params.id] : [transition.to_stage_id, req.params.id]
    );

    // A file number is assigned the first time an advertiser reaches a stage
    // configured (Workflow config → stage → "Assign File Number") to trigger
    // it — typically "Approved" — rather than at registration.
    let assignedRef = null;
    if (transition.to_assign_ref_no && !advertiser.advertiser_ref_no) {
      assignedRef = await generateRefNo('advertiser_registration');
      await pool.query('UPDATE advertisers SET advertiser_ref_no = ? WHERE id = ?', [assignedRef, req.params.id]);
    }

    await recordHistory({
      workflowId: advertiser.workflow_id, processTypeId: advertiser.process_type_id,
      entityType: 'advertiser', entityId: advertiser.id, entityRef: assignedRef || advertiser.advertiser_ref_no,
      fromStageId: advertiser.workflow_stage_id, toStageId: transition.to_stage_id,
      fromStatus: advertiser.current_stage_name, toStatus: transition.to_stage_name,
      movedBy: req.user.id, notes,
    });

    if (transition.to_is_terminal) {
      await notify('advertiser', advertiser.id, 'registration_reviewed', {
        title: `Registration ${transition.to_stage_name}`,
        body: newStatus === 'active'
          ? 'Your advertiser registration has been approved — you can now log in to the portal.'
          : `Your advertiser registration was marked "${transition.to_stage_name}".`,
        url: '/profile',
      });
    }

    // Whether this specific destination stage should trigger an email is a
    // per-stage toggle set by admins in Workflow config, not hardcoded to any
    // particular stage name — lets them decide exactly when it fires. The
    // Comment entered for this transition becomes the reason included in the
    // email when rejecting, so applicants learn why instead of just "pending".
    if (transition.to_send_approval_email && advertiser.email) {
      const isApproved = newStatus === 'active';
      const loginUrl = `${process.env.PORTAL_BASE_URL || 'http://localhost:8800'}/login`;
      const reasonHtml = !isApproved && notes ? `<p><strong>Reason:</strong> ${escapeHtml(notes)}</p>` : '';
      const loginHtml = isApproved ? `<p><a href="${loginUrl}">Log in to the Portal</a></p>` : '';
      await sendMail({
        to: advertiser.email,
        subject: `Your account — ${transition.to_stage_name}`,
        html: `<p>Hi ${advertiser.advertiser_name || ''},</p>
               <p>${isApproved
                 ? 'Your advertiser registration has been approved. You can now log in to the portal.'
                 : `Your advertiser registration status has been updated to "${transition.to_stage_name}".`}</p>
               ${reasonHtml}
               ${loginHtml}`,
      }).catch(err => console.error('Approval email failed:', err.message));
    }

    res.json({ message: 'Stage updated', stage_name: transition.to_stage_name, stage_color: transition.to_stage_color, status: newStatus, ref_no: assignedRef || undefined });
  } catch (err) { next(err); }
});

/* POST /advertisers/:id/reset-password */
router.post('/:id/reset-password', canEdit, async (req, res, next) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE advertisers SET password_hash=? WHERE id=?', [hash, req.params.id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
