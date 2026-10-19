const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');
const { getInitialStage, getWorkflowStages, recordHistory, validateTransition } = require('../helpers/workflow');
const { maybeAwardLoyaltyPoints } = require('../helpers/loyalty');
const { notify } = require('../helpers/notify');
const { getBrandAmbassadorPayoutPool } = require('../helpers/brandAmbassadorPay');
const { encodeId } = require('../utils/hashids');

const storage = multer.diskStorage({
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
const fileFilter = (req, file, cb) => {
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
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });
const uploadFields = upload.fields([{ name: 'posters', maxCount: 10 }, { name: 'attachments', maxCount: 10 }]);

router.use(authenticate);

const canCreate = requirePermission('/campaigns', 'can_create');
const canEdit   = requirePermission('/campaigns', 'can_edit');
const canDelete = requirePermission('/campaigns', 'can_delete');

function parseJsonArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
}

/* end_date is always derived, never trusted from the client — inclusive of
   the start date itself (e.g. "5 Days" from a Monday ends Friday, not
   Saturday). Month/year use calendar-correct rollover (via setMonth/
   setFullYear) rather than flat day multipliers, so a month-long campaign
   starting on the 31st doesn't silently drift. */
function computeEndDate(startDateStr, durationValue, unitName) {
  const n = Number(durationValue);
  if (!startDateStr || !n) return null;
  const end = new Date(`${startDateStr}T00:00:00Z`);
  switch ((unitName || '').toLowerCase()) {
    case 'years':  end.setUTCFullYear(end.getUTCFullYear() + n); end.setUTCDate(end.getUTCDate() - 1); break;
    case 'months': end.setUTCMonth(end.getUTCMonth() + n); end.setUTCDate(end.getUTCDate() - 1); break;
    case 'weeks':  end.setUTCDate(end.getUTCDate() + n * 7 - 1); break;
    case 'hours':  end.setUTCDate(end.getUTCDate() + Math.max(0, Math.ceil(n / 24) - 1)); break;
    case 'days':
    default:       end.setUTCDate(end.getUTCDate() + n - 1); break;
  }
  return end.toISOString().slice(0, 10);
}

async function resolveEndDate(startDate, durationValue, durationUnitId) {
  if (!startDate || !durationValue) return null;
  let unitName = null;
  if (durationUnitId) {
    const [[unit]] = await pool.query('SELECT paramater_value FROM parameter_values WHERE id=?', [durationUnitId]);
    unitName = unit?.paramater_value;
  }
  return computeEndDate(startDate, durationValue, unitName);
}

const LIST_SELECT = `
  SELECT c.*,
         cl.member_name, cl.firstname AS member_firstname, cl.lastname AS member_lastname,
         ct.paramater_value  AS campaign_type_name,
         du.paramater_value  AS duration_unit_name,
         tco.paramater_value AS target_country_name, tcy.paramater_value AS target_county_name,
         tsc.paramater_value AS target_subcounty_name,
         ws.stage_name, ws.stage_color, ws.responsible_group, ws.is_terminal,
         (SELECT COALESCE(SUM(p.amount),0) FROM payments p WHERE p.campaign_id = c.id) AS paid_amount
  FROM campaigns c
  LEFT JOIN members cl       ON c.member_id = cl.id
  LEFT JOIN parameter_values ct  ON c.campaign_type_id = ct.id
  LEFT JOIN parameter_values du  ON c.duration_unit_id = du.id
  LEFT JOIN parameter_values tco ON c.target_country_id = tco.id
  LEFT JOIN parameter_values tcy ON c.target_county_id = tcy.id
  LEFT JOIN parameter_values tsc ON c.target_subcounty_id = tsc.id
  LEFT JOIN workflow_stages ws   ON c.workflow_stage_id = ws.id
`;

/* Balance = Budget - Discount - Paid (paid_amount comes from the LIST_SELECT
   subquery above; discount defaults to 0 when unset). */
function withDisplayName(row) {
  if (!row) return row;
  const member_display_name = row.member_name || [row.member_firstname, row.member_lastname].filter(Boolean).join(' ');
  const balance = Number(row.budget || 0) - Number(row.discount || 0) - Number(row.paid_amount || 0);
  return {
    ...row, member_display_name, balance,
    posters: parseJsonArray(row.posters), attachments: parseJsonArray(row.attachments), target_audience: parseJsonArray(row.target_audience),
  };
}

/* ── Preview the next file_no without consuming the serial ── */
router.get('/next-no', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.prefix, rn.next_serial, rn.padding, rn.use_year, rn.use_month
       FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       WHERE pt.process_type_name = 'campaign_creation'
       LIMIT 1`
    );
    if (!rows.length) return res.json({ file_no: null });
    const cfg = rows[0];
    const padded = String(cfg.next_serial).padStart(cfg.padding, '0');
    const now = new Date();
    const year  = cfg.use_year  ? `-${now.getFullYear()}` : '';
    const month = cfg.use_month ? `-${String(now.getMonth() + 1).padStart(2, '0')}` : '';
    const sep = /[/-]$/.test(cfg.prefix) ? '' : '-';
    res.json({ file_no: `${cfg.prefix}${year}${month}${sep}${padded}` });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const memberFilter = req.query.member_id ? 'AND c.member_id=?' : '';
    const memberParam = req.query.member_id ? [req.query.member_id] : [];
    // No stage explicitly picked → hide stages staff marked "don't show in
    // grid by default" (e.g. Rejected/Cancelled). Picking one (even a hidden
    // one) shows exactly that stage's records, overriding the default.
    const stageFilter = req.query.stage_id ? 'AND c.workflow_stage_id = ?' : "AND (ws.id IS NULL OR ws.show_in_grid_default = 1)";
    const stageParam = req.query.stage_id ? [req.query.stage_id] : [];

    const [rows] = await pool.query(
      `${LIST_SELECT}
       WHERE (c.campaign_title LIKE ? OR c.file_no LIKE ?) ${memberFilter} ${stageFilter}
       ORDER BY c.created_on DESC LIMIT ? OFFSET ?`,
      [search, search, ...memberParam, ...stageParam, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM campaigns c
       LEFT JOIN workflow_stages ws ON c.workflow_stage_id = ws.id
       WHERE (c.campaign_title LIKE ? OR c.file_no LIKE ?) ${memberFilter} ${stageFilter}`,
      [search, search, ...memberParam, ...stageParam]
    );
    res.json({ data: rows.map(withDisplayName), total, page, limit });
  } catch (err) { next(err); }
});

/* ── Stages of the active Campaign workflow, for the grid's stage filter ── */
router.get('/stages', async (req, res, next) => {
  try { res.json(await getWorkflowStages('campaigns')); } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${LIST_SELECT} WHERE c.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(withDisplayName(rows[0]));
  } catch (err) { next(err); }
});

/* ── Available transitions from a campaign's current stage ── */
router.get('/:id/transitions', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id AS transition_id, t.action_label,
              cs.responsible_group,
              ts.id AS to_stage_id, ts.stage_name AS to_stage_name, ts.stage_color AS to_stage_color
       FROM campaigns c
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

router.post('/', canCreate, uploadFields, async (req, res, next) => {
  try {
    const { member_id, campaign_title, campaign_type_id, description, website_link, whatsapp_number,
            promo_code, duration_value, duration_unit_id, start_date, target_country_id, target_county_id,
            target_subcounty_id, budget, discount, brand_ambassador_pay_percentage, comments } = req.body;
    if (!member_id) return res.status(400).json({ message: 'Member is required' });
    if (!campaign_title) return res.status(400).json({ message: 'Campaign title is required' });

    const posters = JSON.stringify((req.files?.posters || []).map(f => `/uploads/campaigns/${f.filename}`));
    const attachments = JSON.stringify((req.files?.attachments || []).map(f => `/uploads/campaigns/${f.filename}`));
    const target_audience = JSON.stringify(parseJsonArray(req.body.target_audience));
    const end_date = await resolveEndDate(start_date, duration_value, duration_unit_id);
    const initStage = await getInitialStage('campaigns');
    // A file number is only assigned immediately if the initial stage is
    // configured to do so (Workflow config → stage → "Assign File Number");
    // otherwise it's left null and assigned later, on approval.
    const file_no = initStage?.assign_ref_no ? await generateRefNo('campaign_creation') : null;

    const [result] = await pool.query(
      `INSERT INTO campaigns
         (file_no, member_id, campaign_title, campaign_type_id, description, posters, attachments,
          website_link, whatsapp_number, promo_code, duration_value, duration_unit_id, start_date, end_date,
          target_audience, target_country_id, target_county_id, target_subcounty_id, budget, discount,
          brand_ambassador_pay_percentage, comments, workflow_id, workflow_stage_id, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [file_no, member_id, campaign_title, campaign_type_id || null, description || null, posters, attachments,
       website_link || null, whatsapp_number || null, promo_code || null, duration_value || null,
       duration_unit_id || null, start_date || null, end_date, target_audience, target_country_id || null,
       target_county_id || null, target_subcounty_id || null, budget || null, discount || 0,
       brand_ambassador_pay_percentage === '' || brand_ambassador_pay_percentage == null ? null : brand_ambassador_pay_percentage,
       comments || null, initStage?.workflow_id || null, initStage?.stage_id || null, req.user.id]
    );

    if (initStage) {
      await recordHistory({
        workflowId: initStage.workflow_id, processTypeId: initStage.process_type_id,
        entityType: 'campaign', entityId: result.insertId, entityRef: file_no,
        toStageId: initStage.stage_id, movedBy: req.user.id, notes: 'Campaign created via MIS',
      });
    }

    const [rows] = await pool.query(`${LIST_SELECT} WHERE c.id=?`, [result.insertId]);
    res.status(201).json(withDisplayName(rows[0]));
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, uploadFields, async (req, res, next) => {
  try {
    const { member_id, campaign_title, campaign_type_id, description, website_link, whatsapp_number,
            promo_code, duration_value, duration_unit_id, start_date, target_country_id, target_county_id,
            target_subcounty_id, budget, discount, brand_ambassador_pay_percentage, comments } = req.body;
    if (!member_id) return res.status(400).json({ message: 'Member is required' });
    if (!campaign_title) return res.status(400).json({ message: 'Campaign title is required' });

    const [[existing]] = await pool.query('SELECT posters, attachments FROM campaigns WHERE id=?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const newPosters = (req.files?.posters || []).map(f => `/uploads/campaigns/${f.filename}`);
    const newAttachments = (req.files?.attachments || []).map(f => `/uploads/campaigns/${f.filename}`);
    // Keep any existing files explicitly kept (sent back as JSON), then append newly uploaded ones.
    const keptPosters = parseJsonArray(req.body.existing_posters);
    const keptAttachments = parseJsonArray(req.body.existing_attachments);
    const posters = JSON.stringify([...keptPosters, ...newPosters]);
    const attachments = JSON.stringify([...keptAttachments, ...newAttachments]);
    const target_audience = JSON.stringify(parseJsonArray(req.body.target_audience));
    const end_date = await resolveEndDate(start_date, duration_value, duration_unit_id);

    await pool.query(
      `UPDATE campaigns SET
         member_id=?, campaign_title=?, campaign_type_id=?, description=?, posters=?, attachments=?,
         website_link=?, whatsapp_number=?, promo_code=?, duration_value=?, duration_unit_id=?,
         start_date=?, end_date=?, target_audience=?, target_country_id=?, target_county_id=?,
         target_subcounty_id=?, budget=?, discount=?, brand_ambassador_pay_percentage=?, comments=?, updated_by=?
       WHERE id=?`,
      [member_id, campaign_title, campaign_type_id || null, description || null, posters, attachments,
       website_link || null, whatsapp_number || null, promo_code || null, duration_value || null,
       duration_unit_id || null, start_date || null, end_date, target_audience, target_country_id || null,
       target_county_id || null, target_subcounty_id || null, budget || null, discount || 0,
       brand_ambassador_pay_percentage === '' || brand_ambassador_pay_percentage == null ? null : brand_ambassador_pay_percentage,
       comments || null, req.user.id, req.params.id]
    );
    const [rows] = await pool.query(`${LIST_SELECT} WHERE c.id=?`, [req.params.id]);
    res.json(withDisplayName(rows[0]));
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM campaigns WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

/* ── Move a campaign to the next stage via a defined workflow transition ── */
router.post('/:id/transition', canEdit, async (req, res, next) => {
  try {
    const { transition_id, notes } = req.body;

    const [[campaign]] = await pool.query(
      `SELECT c.id, c.file_no, c.member_id, c.workflow_id, c.workflow_stage_id,
              ws.responsible_group, ws.stage_name AS current_stage_name, w.process_type_id
       FROM campaigns c
       JOIN workflow_stages ws ON c.workflow_stage_id = ws.id
       JOIN workflows w        ON c.workflow_id       = w.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    if (campaign.responsible_group) {
      const [[roleRow]] = await pool.query('SELECT id FROM roles WHERE role_name = ?', [campaign.responsible_group]);
      if (!roleRow || !(req.user.roles || []).includes(roleRow.id)) {
        return res.status(403).json({
          message: `Only users with role "${campaign.responsible_group}" can move campaigns from "${campaign.current_stage_name}"`,
        });
      }
    }

    const transition = await validateTransition(transition_id, campaign.workflow_id, campaign.workflow_stage_id);
    if (!transition) return res.status(400).json({ message: 'Invalid transition for current stage' });

    await pool.query('UPDATE campaigns SET workflow_stage_id = ? WHERE id = ?', [transition.to_stage_id, req.params.id]);

    // A file number is assigned the first time a campaign reaches a stage
    // configured (Workflow config → stage → "Assign File Number") to
    // trigger it — typically "Approved" — rather than at creation.
    let assignedRef = null;
    if (transition.to_assign_ref_no && !campaign.file_no) {
      assignedRef = await generateRefNo('campaign_creation');
      await pool.query('UPDATE campaigns SET file_no = ? WHERE id = ?', [assignedRef, req.params.id]);
    }
    const fileNo = assignedRef || campaign.file_no;

    await recordHistory({
      workflowId: campaign.workflow_id, processTypeId: campaign.process_type_id,
      entityType: 'campaign', entityId: campaign.id, entityRef: fileNo,
      fromStageId: campaign.workflow_stage_id, toStageId: transition.to_stage_id,
      fromStatus: campaign.current_stage_name, toStatus: transition.to_stage_name,
      movedBy: req.user.id, notes,
    });

    /* Award loyalty points if this stage qualifies (best-effort) */
    await maybeAwardLoyaltyPoints({ ...campaign, workflow_stage_id: transition.to_stage_id });

    await notify('member', campaign.member_id, 'campaign_stage_changed', {
      title: `Campaign ${transition.to_stage_name}`,
      body: `"${fileNo || 'Campaign'}" is now "${transition.to_stage_name}".`,
      url: `/campaigns/${encodeId(campaign.id)}`,
    });

    res.json({ message: 'Stage updated', stage_name: transition.to_stage_name, stage_color: transition.to_stage_color, file_no: assignedRef || undefined });
  } catch (err) { next(err); }
});

/* ── Brand ambassadors assigned to run this campaign ── */
const ASSIGNED_BRAND_AMBASSADORS_SELECT = `
  SELECT ca.id, ca.brand_ambassador_id, ca.assigned_on, ca.proof_deadline,
         a.brand_ambassador_ref_no, a.full_name, a.phone, a.avg_status_views, a.status,
         (SELECT COALESCE(SUM(cp.status_views), 0)
          FROM campaign_proofs cp
          WHERE cp.campaign_id = ca.campaign_id AND cp.brand_ambassador_id = ca.brand_ambassador_id
            AND cp.status = 'accepted') AS total_views
  FROM campaign_brand_ambassadors ca
  JOIN brand_ambassadors a ON ca.brand_ambassador_id = a.id
  WHERE ca.campaign_id = ?
  ORDER BY ca.assigned_on DESC
`;

/* Each brand ambassador's estimated earnings = their share of (campaign
   budget * brand_ambassador_pay_percentage — the campaign's own override if
   set, else the global default), split in proportion to their own accepted
   views against the total accepted views across everyone assigned to this
   campaign. Purely an estimate for staff — not wired to actual payouts. */
async function withBrandAmbassadorEarnings(rows, campaignId) {
  const payoutPool = await getBrandAmbassadorPayoutPool(campaignId) || 0;
  const totalViews = rows.reduce((sum, r) => sum + Number(r.total_views || 0), 0);
  return rows.map(r => ({
    ...r,
    revenue: totalViews > 0 ? payoutPool * (Number(r.total_views || 0) / totalViews) : 0,
  }));
}

router.get('/:id/brand-ambassadors', async (req, res, next) => {
  try {
    const [rows] = await pool.query(ASSIGNED_BRAND_AMBASSADORS_SELECT, [req.params.id]);
    res.json(await withBrandAmbassadorEarnings(rows, req.params.id));
  } catch (err) { next(err); }
});

router.post('/:id/brand-ambassadors', canEdit, async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.brand_ambassador_ids) ? req.body.brand_ambassador_ids : [req.body.brand_ambassador_ids].filter(Boolean);
    if (!ids.length) return res.status(400).json({ message: 'Select at least one brand ambassador' });

    const [[stage]] = await pool.query(
      `SELECT c.campaign_title, ws.stage_name, ws.is_terminal
       FROM campaigns c JOIN workflow_stages ws ON c.workflow_stage_id = ws.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (stage?.is_terminal) {
      return res.status(400).json({ message: `Cannot assign brand ambassadors — this campaign is already ${stage.stage_name}` });
    }

    for (const brandAmbassadorId of ids) {
      const [result] = await pool.query(
        'INSERT IGNORE INTO campaign_brand_ambassadors (campaign_id, brand_ambassador_id, assigned_by) VALUES (?,?,?)',
        [req.params.id, brandAmbassadorId, req.user.id]
      );
      if (result.affectedRows) {
        await notify('brand_ambassador', brandAmbassadorId, 'campaign_assigned', {
          title: 'Assigned to a campaign',
          body: `You've been assigned to run "${stage?.campaign_title || 'a campaign'}".`,
          url: `/brand-ambassador/campaigns/${encodeId(req.params.id)}`,
        });
      }
    }
    const [rows] = await pool.query(ASSIGNED_BRAND_AMBASSADORS_SELECT, [req.params.id]);
    res.status(201).json(await withBrandAmbassadorEarnings(rows, req.params.id));
  } catch (err) { next(err); }
});

router.delete('/:id/brand-ambassadors/:brandAmbassadorId', canEdit, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM campaign_brand_ambassadors WHERE campaign_id=? AND brand_ambassador_id=?', [req.params.id, req.params.brandAmbassadorId]);
    res.json({ message: 'Removed' });
  } catch (err) { next(err); }
});

/* Per-assignment override of the last date this brand ambassador may submit
   posting proof — null clears it back to following the campaign's own
   end_date. */
router.put('/:id/brand-ambassadors/:brandAmbassadorId/deadline', canEdit, async (req, res, next) => {
  try {
    const { proof_deadline } = req.body;
    await pool.query(
      'UPDATE campaign_brand_ambassadors SET proof_deadline=? WHERE campaign_id=? AND brand_ambassador_id=?',
      [proof_deadline || null, req.params.id, req.params.brandAmbassadorId]
    );
    res.json({ message: 'Updated' });
  } catch (err) { next(err); }
});

module.exports = router;
