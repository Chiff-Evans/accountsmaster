const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool   = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');
const { getInitialStage, getWorkflowStages, recordHistory, validateTransition, statusForStage } = require('../helpers/workflow');
const { notify } = require('../helpers/notify');
const { sendMail, escapeHtml } = require('../helpers/mailer');

router.use(authenticate);

const canCreate = requirePermission('/members', 'can_create');
const canEdit   = requirePermission('/members', 'can_edit');
const canDelete = requirePermission('/members', 'can_delete');

const LIST_SELECT = `
  SELECT c.id, c.member_ref_no, c.member_name, c.firstname, c.lastname, c.position_id, c.id_number,
         c.gender_id, c.phone, c.email, DATE_FORMAT(c.reg_date, '%Y-%m-%d') AS reg_date, c.reg_fee, c.other_details, c.username, (c.password_hash IS NOT NULL) AS has_password, c.status,
         c.loyalty_points, c.workflow_id, c.workflow_stage_id, c.created_at, c.updated_at,
         pos.paramater_value AS position_name, gen.paramater_value AS gender_name,
         ws.stage_name, ws.stage_color, ws.responsible_group
  FROM members c
  LEFT JOIN parameter_values pos ON c.position_id = pos.id
  LEFT JOIN parameter_values gen ON c.gender_id = gen.id
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
       WHERE (c.member_name LIKE ? OR c.id_number LIKE ? OR c.phone LIKE ? OR c.email LIKE ?
          OR c.member_ref_no LIKE ?) ${stageFilter}
       GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [search, search, search, search, search, ...stageParam, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM members c
       LEFT JOIN workflow_stages ws ON c.workflow_stage_id = ws.id
       WHERE (c.member_name LIKE ? OR c.id_number LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR c.member_ref_no LIKE ?) ${stageFilter}`,
      [search, search, search, search, search, ...stageParam]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

/* ── Stages of the active Member workflow, for the grid's stage filter ── */
router.get('/stages', async (req, res, next) => {
  try { res.json(await getWorkflowStages('members')); } catch (err) { next(err); }
});

/* ── Preview the next ref no without consuming the serial ── */
router.get('/next-no', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.prefix, rn.next_serial, rn.padding, rn.use_year, rn.use_month
       FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       WHERE pt.process_type_name = 'member_registration'
       LIMIT 1`
    );
    if (!rows.length) return res.json({ member_ref_no: null });
    const cfg = rows[0];
    const padded = String(cfg.next_serial).padStart(cfg.padding, '0');
    const now = new Date();
    const year  = cfg.use_year  ? `-${now.getFullYear()}` : '';
    const month = cfg.use_month ? `-${String(now.getMonth() + 1).padStart(2, '0')}` : '';
    const sep = /[/-]$/.test(cfg.prefix) ? '' : '-';
    res.json({ member_ref_no: `${cfg.prefix}${year}${month}${sep}${padded}` });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${LIST_SELECT} WHERE c.id=? GROUP BY c.id`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

/* ── Available transitions from a member's current (approval) stage ── */
router.get('/:id/transitions', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id AS transition_id, t.action_label,
              cs.responsible_group,
              ts.id AS to_stage_id, ts.stage_name AS to_stage_name, ts.stage_color AS to_stage_color
       FROM members c
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

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { member_name, position_id, id_number, phone, email, gender_id, reg_date, reg_fee, other_details } = req.body;
    if (!member_name) return res.status(400).json({ message: 'Member name is required' });

    const initStage = await getInitialStage('members');
    const member_ref_no = initStage?.assign_ref_no ? await generateRefNo('member_registration') : null;

    const [result] = await pool.query(
      `INSERT INTO members
         (member_ref_no, member_name, firstname, lastname, position_id, id_number, phone, email, gender_id,
          reg_date, reg_fee, other_details, workflow_id, workflow_stage_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [member_ref_no, member_name, member_name, '', position_id || null, id_number || null,
       phone || null, email || null, gender_id || null, reg_date || null,
       reg_fee === '' || reg_fee == null ? null : reg_fee, other_details || null,
       initStage?.workflow_id || null, initStage?.stage_id || null]
    );

    if (initStage) {
      await recordHistory({
        workflowId: initStage.workflow_id, processTypeId: initStage.process_type_id,
        entityType: 'member', entityId: result.insertId, entityRef: member_ref_no,
        toStageId: initStage.stage_id, movedBy: req.user.id, notes: 'Member registered via MIS',
      });
    }

    const [rows] = await pool.query(`${LIST_SELECT} WHERE c.id=? GROUP BY c.id`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { member_name, position_id, id_number, phone, email, gender_id, reg_date, reg_fee, other_details, status } = req.body;
    if (!member_name) return res.status(400).json({ message: 'Member name is required' });

    const [[existing]] = await pool.query('SELECT id FROM members WHERE id=?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Not found' });

    await pool.query(
      `UPDATE members SET
         member_name=?, firstname=?, position_id=?, id_number=?, phone=?, email=?, gender_id=?,
         reg_date=?, reg_fee=?, other_details=?, status=?
       WHERE id=?`,
      [member_name, member_name, position_id || null, id_number || null, phone || null, email || null,
       gender_id || null, reg_date || null, reg_fee === '' || reg_fee == null ? null : reg_fee,
       other_details || null, status || 'active', req.params.id]
    );
    const [rows] = await pool.query(`${LIST_SELECT} WHERE c.id=? GROUP BY c.id`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM members WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

/* POST /members/:id/action — lock, suspend, revoke, activate */
router.post('/:id/action', canEdit, async (req, res, next) => {
  try {
    const { action } = req.body;
    const allowed = ['active', 'locked', 'suspended', 'revoked'];
    if (!allowed.includes(action))
      return res.status(400).json({ message: 'Invalid action' });
    await pool.query('UPDATE members SET status=? WHERE id=?', [action, req.params.id]);
    res.json({ message: `Member status updated to ${action}` });
  } catch (err) { next(err); }
});

/* ── Move a member through its registration-approval workflow —
   approving also activates the account (status='active'). ── */
router.post('/:id/transition', canEdit, async (req, res, next) => {
  try {
    const { transition_id, notes } = req.body;

    const [[member]] = await pool.query(
      `SELECT c.id, c.member_ref_no, c.workflow_id, c.workflow_stage_id, c.member_name, c.email,
              ws.responsible_group, ws.stage_name AS current_stage_name, w.process_type_id
       FROM members c
       JOIN workflow_stages ws ON c.workflow_stage_id = ws.id
       JOIN workflows w        ON c.workflow_id       = w.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (member.responsible_group) {
      const [[roleRow]] = await pool.query('SELECT id FROM roles WHERE role_name = ?', [member.responsible_group]);
      if (!roleRow || !(req.user.roles || []).includes(roleRow.id)) {
        return res.status(403).json({
          message: `Only users with role "${member.responsible_group}" can move members from "${member.current_stage_name}"`,
        });
      }
    }

    const transition = await validateTransition(transition_id, member.workflow_id, member.workflow_stage_id);
    if (!transition) return res.status(400).json({ message: 'Invalid transition for current stage' });

    const newStatus = statusForStage(transition.to_stage_name);
    await pool.query(
      `UPDATE members SET workflow_stage_id = ?${newStatus ? ', status = ?' : ''} WHERE id = ?`,
      newStatus ? [transition.to_stage_id, newStatus, req.params.id] : [transition.to_stage_id, req.params.id]
    );

    // A file number is assigned the first time a member reaches a stage
    // configured (Workflow config → stage → "Assign File Number") to trigger
    // it — typically "Approved" — rather than at registration.
    let assignedRef = null;
    if (transition.to_assign_ref_no && !member.member_ref_no) {
      assignedRef = await generateRefNo('member_registration');
      await pool.query('UPDATE members SET member_ref_no = ? WHERE id = ?', [assignedRef, req.params.id]);
    }

    await recordHistory({
      workflowId: member.workflow_id, processTypeId: member.process_type_id,
      entityType: 'member', entityId: member.id, entityRef: assignedRef || member.member_ref_no,
      fromStageId: member.workflow_stage_id, toStageId: transition.to_stage_id,
      fromStatus: member.current_stage_name, toStatus: transition.to_stage_name,
      movedBy: req.user.id, notes,
    });

    if (transition.to_is_terminal) {
      await notify('member', member.id, 'registration_reviewed', {
        title: `Registration ${transition.to_stage_name}`,
        body: newStatus === 'active'
          ? 'Your member registration has been approved — you can now log in to the portal.'
          : `Your member registration was marked "${transition.to_stage_name}".`,
        url: '/profile',
      });
    }

    // Whether this specific destination stage should trigger an email is a
    // per-stage toggle set by admins in Workflow config, not hardcoded to any
    // particular stage name — lets them decide exactly when it fires. The
    // Comment entered for this transition becomes the reason included in the
    // email when rejecting, so applicants learn why instead of just "pending".
    if (transition.to_send_approval_email && member.email) {
      const isApproved = newStatus === 'active';
      const loginUrl = `${process.env.PORTAL_BASE_URL || 'http://localhost:8800'}/login`;
      const reasonHtml = !isApproved && notes ? `<p><strong>Reason:</strong> ${escapeHtml(notes)}</p>` : '';
      const loginHtml = isApproved ? `<p><a href="${loginUrl}">Log in to the Portal</a></p>` : '';
      await sendMail({
        to: member.email,
        subject: `Your account — ${transition.to_stage_name}`,
        html: `<p>Hi ${member.member_name || ''},</p>
               <p>${isApproved
                 ? 'Your member registration has been approved. You can now log in to the portal.'
                 : `Your member registration status has been updated to "${transition.to_stage_name}".`}</p>
               ${reasonHtml}
               ${loginHtml}`,
      }).catch(err => console.error('Approval email failed:', err.message));
    }

    res.json({ message: 'Stage updated', stage_name: transition.to_stage_name, stage_color: transition.to_stage_color, status: newStatus, ref_no: assignedRef || undefined });
  } catch (err) { next(err); }
});

/* POST /members/:id/portal-access — set the member's portal username and
   (re)set their password. A password is required the first time; after
   that it's optional, so staff can change just the username. */
router.post('/:id/portal-access', canEdit, async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const { new_password } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required' });
    if (new_password && new_password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const [[member]] = await pool.query('SELECT id, password_hash FROM members WHERE id=?', [req.params.id]);
    if (!member) return res.status(404).json({ message: 'Not found' });
    if (!member.password_hash && !new_password)
      return res.status(400).json({ message: 'Set a password to give this member portal access' });

    const [[taken]] = await pool.query('SELECT id FROM members WHERE username=? AND id<>?', [username, req.params.id]);
    if (taken) return res.status(409).json({ message: 'Username already taken' });

    if (new_password) {
      const hash = await bcrypt.hash(new_password, 10);
      await pool.query('UPDATE members SET username=?, password_hash=? WHERE id=?', [username, hash, req.params.id]);
    } else {
      await pool.query('UPDATE members SET username=? WHERE id=?', [username, req.params.id]);
    }
    res.json({ message: 'Portal access updated' });
  } catch (err) { next(err); }
});

/* ── Next of kin — nested under a member, same permissions as members ── */

const KIN_SELECT = `
  SELECT k.id, k.member_id, k.kin_ref_no, k.kin_name, k.relationship_id, k.id_number, k.phone, k.email,
         k.created_on, k.updated_on, rel.paramater_value AS relationship_name
  FROM member_next_of_kin k
  LEFT JOIN parameter_values rel ON k.relationship_id = rel.id
`;

router.get('/:id/next-of-kin', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${KIN_SELECT} WHERE k.member_id=? ORDER BY k.id`, [req.params.id]);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/:id/next-of-kin', canCreate, async (req, res, next) => {
  try {
    const { kin_name, relationship_id, id_number, phone, email } = req.body;
    if (!kin_name) return res.status(400).json({ message: 'Name is required' });
    const [[member]] = await pool.query('SELECT id FROM members WHERE id=?', [req.params.id]);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const kin_ref_no = await generateRefNo('next_of_kin_registration');
    const [result] = await pool.query(
      `INSERT INTO member_next_of_kin (member_id, kin_ref_no, kin_name, relationship_id, id_number, phone, email, created_by)
       VALUES (?,?,?,?,?,?,?,?)`,
      [req.params.id, kin_ref_no, kin_name, relationship_id || null, id_number || null, phone || null, email || null, req.user.id]
    );
    const [rows] = await pool.query(`${KIN_SELECT} WHERE k.id=?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id/next-of-kin/:kinId', canEdit, async (req, res, next) => {
  try {
    const { kin_name, relationship_id, id_number, phone, email } = req.body;
    if (!kin_name) return res.status(400).json({ message: 'Name is required' });
    const [result] = await pool.query(
      `UPDATE member_next_of_kin SET kin_name=?, relationship_id=?, id_number=?, phone=?, email=?, updated_by=?
       WHERE id=? AND member_id=?`,
      [kin_name, relationship_id || null, id_number || null, phone || null, email || null, req.user.id,
       req.params.kinId, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
    const [rows] = await pool.query(`${KIN_SELECT} WHERE k.id=?`, [req.params.kinId]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id/next-of-kin/:kinId', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM member_next_of_kin WHERE id=? AND member_id=?', [req.params.kinId, req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
