const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

const canCreate = requirePermission('/config/ref-numbering', 'can_create');
const canEdit   = requirePermission('/config/ref-numbering', 'can_edit');
const canDelete = requirePermission('/config/ref-numbering', 'can_delete');

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.*, pt.process_type_name FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       ORDER BY pt.process_type_name`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.*, pt.process_type_name FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id WHERE rn.id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { process_type_id, prefix, initial_serial, next_serial, use_year, use_month, padding } = req.body;
    const [result] = await pool.query(
      'INSERT INTO ref_numbering (process_type_id, prefix, initial_serial, next_serial, use_year, use_month, padding) VALUES (?,?,?,?,?,?,?)',
      [process_type_id, prefix, initial_serial || 1, next_serial || 1, use_year || 0, use_month || 0, padding || 4]
    );
    const [rows] = await pool.query('SELECT * FROM ref_numbering WHERE id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { process_type_id, prefix, initial_serial, next_serial, use_year, use_month, padding } = req.body;
    await pool.query(
      'UPDATE ref_numbering SET process_type_id=?, prefix=?, initial_serial=?, next_serial=?, use_year=?, use_month=?, padding=? WHERE id=?',
      [process_type_id, prefix, initial_serial, next_serial, use_year, use_month, padding, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM ref_numbering WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM ref_numbering WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
