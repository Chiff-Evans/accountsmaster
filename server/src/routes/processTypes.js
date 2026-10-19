const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

const canCreate = requirePermission('/config/process-types', 'can_create');
const canEdit   = requirePermission('/config/process-types', 'can_edit');
const canDelete = requirePermission('/config/process-types', 'can_delete');

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM process_types ORDER BY process_type_name');
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM process_types WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { process_type_name, description, data_table } = req.body;
    const [result] = await pool.query(
      'INSERT INTO process_types (process_type_name, description, data_table) VALUES (?,?,?)',
      [process_type_name, description, data_table]
    );
    const [rows] = await pool.query('SELECT * FROM process_types WHERE id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { process_type_name, description, data_table } = req.body;
    await pool.query(
      'UPDATE process_types SET process_type_name=?, description=?, data_table=? WHERE id=?',
      [process_type_name, description, data_table, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM process_types WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM process_types WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
