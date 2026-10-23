const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

const canCreate = requirePermission('/config/workflows', 'can_create');
const canEdit   = requirePermission('/config/workflows', 'can_edit');
const canDelete = requirePermission('/config/workflows', 'can_delete');

/* ══════════════════════════════════════
   Workflow History  (must be before /:wid routes)
══════════════════════════════════════ */

router.get('/history', async (req, res, next) => {
  try {
    const { entity_type, entity_id, page = 1, limit = 50 } = req.query;
    let where = '1=1';
    const params = [];
    if (entity_type) { where += ' AND h.entity_type=?'; params.push(entity_type); }
    if (entity_id)   { where += ' AND h.entity_id=?';   params.push(entity_id); }
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(
      `SELECT h.*,
              CONCAT(u.firstname,' ',u.lastname) AS moved_by_name,
              w.workflow_name,
              fs.stage_color AS from_stage_color,
              ts.stage_color AS to_stage_color
       FROM workflow_history h
       LEFT JOIN users u            ON h.moved_by      = u.id
       LEFT JOIN workflows w        ON h.workflow_id   = w.id
       LEFT JOIN workflow_stages fs ON h.from_stage_id = fs.id
       LEFT JOIN workflow_stages ts ON h.to_stage_id   = ts.id
       WHERE ${where}
       ORDER BY h.moved_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM workflow_history h WHERE ${where}`,
      params
    );
    res.json({ data: rows, total });
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════
   Active stages list for order filter  (before /:wid routes)
══════════════════════════════════════ */

router.get('/active-stages', async (req, res, next) => {
  try {
    const { workflow_id } = req.query;
    const params = [];
    let extra = '';
    if (workflow_id) { extra = ' AND ws.workflow_id = ?'; params.push(workflow_id); }
    const [rows] = await pool.query(
      `SELECT ws.id, ws.stage_name, ws.stage_color, ws.stage_order, ws.workflow_id
       FROM workflow_stages ws
       JOIN workflows w ON ws.workflow_id = w.id
       WHERE w.is_active = 1${extra}
       ORDER BY ws.stage_order, ws.id`,
      params
    );
    res.json(rows);
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════
   Stage Colors Map  (before /:wid routes)
══════════════════════════════════════ */

router.get('/stage-colors', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT workflow_status, stage_color FROM workflow_stages WHERE workflow_status IS NOT NULL AND stage_color IS NOT NULL'
    );
    const map = {};
    rows.forEach(r => { map[r.workflow_status] = r.stage_color; });
    res.json(map);
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════
   Workflows CRUD
══════════════════════════════════════ */

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.*, pt.process_type_name, pt.data_table
       FROM workflows w
       LEFT JOIN process_types pt ON w.process_type_id = pt.id
       ORDER BY w.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { workflow_name, description, process_type_id, is_active } = req.body;
    const [r] = await pool.query(
      'INSERT INTO workflows (workflow_name, description, process_type_id, is_active) VALUES (?,?,?,?)',
      [workflow_name, description || null, process_type_id || null, is_active ?? 1]
    );
    res.json({ id: r.insertId, message: 'Created' });
  } catch (err) { next(err); }
});

router.put('/:wid', canEdit, async (req, res, next) => {
  try {
    const { workflow_name, description, process_type_id, is_active } = req.body;
    await pool.query(
      'UPDATE workflows SET workflow_name=?, description=?, process_type_id=?, is_active=? WHERE id=?',
      [workflow_name, description || null, process_type_id || null, is_active ?? 1, req.params.wid]
    );
    res.json({ message: 'Updated' });
  } catch (err) { next(err); }
});

router.delete('/:wid', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM workflows WHERE id=?', [req.params.wid]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════
   Stages
══════════════════════════════════════ */

router.get('/:wid/stages', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM workflow_stages WHERE workflow_id=? ORDER BY stage_order, id',
      [req.params.wid]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/:wid/stages', canCreate, async (req, res, next) => {
  try {
    const { stage_name, description, responsible_group, workflow_status, stage_color, stage_order, is_initial, is_terminal, include_in_revenue, member_can_edit, send_approval_email, assign_ref_no, show_in_grid_default } = req.body;
    const [r] = await pool.query(
      `INSERT INTO workflow_stages
         (workflow_id, stage_name, description, responsible_group, workflow_status, stage_color, stage_order, is_initial, is_terminal, include_in_revenue, member_can_edit, send_approval_email, assign_ref_no, show_in_grid_default)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [req.params.wid, stage_name, description || null, responsible_group || null,
       workflow_status || null, stage_color || null, stage_order || 0, is_initial ? 1 : 0, is_terminal ? 1 : 0,
       include_in_revenue === false || include_in_revenue === 0 ? 0 : 1,
       member_can_edit === false || member_can_edit === 0 ? 0 : 1,
       send_approval_email ? 1 : 0,
       assign_ref_no ? 1 : 0,
       show_in_grid_default === false || show_in_grid_default === 0 ? 0 : 1]
    );
    res.json({ id: r.insertId, message: 'Created' });
  } catch (err) { next(err); }
});

router.put('/:wid/stages/:id', canEdit, async (req, res, next) => {
  try {
    const { stage_name, description, responsible_group, workflow_status, stage_color, stage_order, is_initial, is_terminal, include_in_revenue, member_can_edit, send_approval_email, assign_ref_no, show_in_grid_default } = req.body;
    await pool.query(
      `UPDATE workflow_stages SET
         stage_name=?, description=?, responsible_group=?, workflow_status=?, stage_color=?,
         stage_order=?, is_initial=?, is_terminal=?, include_in_revenue=?, member_can_edit=?, send_approval_email=?, assign_ref_no=?, show_in_grid_default=?
       WHERE id=? AND workflow_id=?`,
      [stage_name, description || null, responsible_group || null, workflow_status || null,
       stage_color || null, stage_order || 0, is_initial ? 1 : 0, is_terminal ? 1 : 0,
       include_in_revenue === false || include_in_revenue === 0 ? 0 : 1,
       member_can_edit === false || member_can_edit === 0 ? 0 : 1,
       send_approval_email ? 1 : 0,
       assign_ref_no ? 1 : 0,
       show_in_grid_default === false || show_in_grid_default === 0 ? 0 : 1,
       req.params.id, req.params.wid]
    );
    res.json({ message: 'Updated' });
  } catch (err) { next(err); }
});

router.delete('/:wid/stages/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM workflow_stages WHERE id=? AND workflow_id=?', [req.params.id, req.params.wid]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════
   Transitions
══════════════════════════════════════ */

router.get('/:wid/transitions', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, fs.stage_name AS from_stage_name, ts.stage_name AS to_stage_name
       FROM workflow_transitions t
       JOIN workflow_stages fs ON t.from_stage_id = fs.id
       JOIN workflow_stages ts ON t.to_stage_id   = ts.id
       WHERE t.workflow_id=?
       ORDER BY fs.stage_order, fs.id`,
      [req.params.wid]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/:wid/transitions', canCreate, async (req, res, next) => {
  try {
    const { from_stage_id, to_stage_id, action_label } = req.body;
    const [r] = await pool.query(
      'INSERT INTO workflow_transitions (workflow_id, from_stage_id, to_stage_id, action_label) VALUES (?,?,?,?)',
      [req.params.wid, from_stage_id, to_stage_id, action_label || 'Move']
    );
    res.json({ id: r.insertId, message: 'Created' });
  } catch (err) { next(err); }
});

router.put('/:wid/transitions/:id', canEdit, async (req, res, next) => {
  try {
    const { from_stage_id, to_stage_id, action_label } = req.body;
    await pool.query(
      'UPDATE workflow_transitions SET from_stage_id=?, to_stage_id=?, action_label=? WHERE id=? AND workflow_id=?',
      [from_stage_id, to_stage_id, action_label || 'Move', req.params.id, req.params.wid]
    );
    res.json({ message: 'Updated' });
  } catch (err) { next(err); }
});

router.delete('/:wid/transitions/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM workflow_transitions WHERE id=? AND workflow_id=?', [req.params.id, req.params.wid]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
