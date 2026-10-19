const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

const canCreate = requirePermission('/config/parameters', 'can_create');
const canEdit   = requirePermission('/config/parameters', 'can_edit');
const canDelete = requirePermission('/config/parameters', 'can_delete');

// ── Parameters CRUD ───────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM parameters ORDER BY parameter_name');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { parameter_name, text_id, description, is_active } = req.body;
    const [result] = await pool.query(
      'INSERT INTO parameters (parameter_name, text_id, description, is_active) VALUES (?,?,?,?)',
      [parameter_name, text_id || null, description || null, is_active !== undefined ? is_active : 1]
    );
    const [rows] = await pool.query('SELECT * FROM parameters WHERE id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { parameter_name, text_id, description, is_active } = req.body;
    await pool.query(
      'UPDATE parameters SET parameter_name=?, text_id=?, description=?, is_active=? WHERE id=?',
      [parameter_name, text_id || null, description || null, is_active !== undefined ? is_active : 1, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM parameters WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM parameters WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

// ── Parameter Values (defined before /:id to avoid param collision) ──

/* By default only active values are returned — every dropdown across the
   app (Trip status/inclusives, Participant status, Expenditure type/currency,
   Payment currency, …) consumes this endpoint directly, so an inactive
   value shouldn't be selectable anywhere just because it still exists.
   The Parameters config screen manages the full list (active + inactive),
   so it passes include_inactive=1 to see everything. */
router.get('/values', async (req, res, next) => {
  try {
    const { parameter_id, include_inactive } = req.query;
    const where = [];
    const params = [];
    if (parameter_id) { where.push('pv.parameter_id=?'); params.push(parameter_id); }
    if (!include_inactive) { where.push('pv.is_active=1'); }
    let sql = `
      SELECT pv.*, ppv.paramater_value AS parent_value_name, ppv.parameter_id AS parent_parameter_id
      FROM parameter_values pv
      LEFT JOIN parameter_values ppv ON pv.parent_value_id = ppv.id`;
    if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
    sql += ' ORDER BY pv.paramater_value';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/values', canCreate, async (req, res, next) => {
  try {
    const { parameter_id, parent_value_id, paramater_value, description, is_active, is_default } = req.body;
    // Only one default per parameter — clear any existing one first.
    if (is_default) {
      await pool.query('UPDATE parameter_values SET is_default=0 WHERE parameter_id=?', [parameter_id]);
    }
    const [result] = await pool.query(
      'INSERT INTO parameter_values (parameter_id, parent_value_id, paramater_value, description, is_active, is_default) VALUES (?,?,?,?,?,?)',
      [parameter_id, parent_value_id || null, paramater_value, description || null, is_active !== undefined ? is_active : 1, is_default ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM parameter_values WHERE id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/values/:id', canEdit, async (req, res, next) => {
  try {
    const { parameter_id, parent_value_id, paramater_value, description, is_active, is_default } = req.body;
    // COALESCE guards against a caller omitting parameter_id (it's not part
    // of every edit form) — falls back to the value's current parameter_id
    // instead of silently nulling out the link.
    const [[current]] = await pool.query('SELECT parameter_id FROM parameter_values WHERE id=?', [req.params.id]);
    const effectiveParamId = parameter_id ?? current?.parameter_id;
    // Only one default per parameter — clear any existing one first (this
    // value's own row included, it gets re-set below if is_default is true).
    if (is_default && effectiveParamId) {
      await pool.query('UPDATE parameter_values SET is_default=0 WHERE parameter_id=?', [effectiveParamId]);
    }
    await pool.query(
      'UPDATE parameter_values SET parameter_id=COALESCE(?, parameter_id), parent_value_id=?, paramater_value=?, description=?, is_active=?, is_default=? WHERE id=?',
      [parameter_id ?? null, parent_value_id || null, paramater_value, description || null, is_active !== undefined ? is_active : 1, is_default ? 1 : 0, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM parameter_values WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/values/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM parameter_values WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
