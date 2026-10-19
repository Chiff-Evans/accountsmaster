const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

const canCreate = requirePermission('/config/targets', 'can_create');
const canEdit   = requirePermission('/config/targets', 'can_edit');
const canDelete = requirePermission('/config/targets', 'can_delete');

// target_date comes back as a plain YYYY-MM-DD string so the client never
// shifts it across a timezone boundary.
const SELECT = `
  SELECT id, target_amount, DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date, created_on, updated_on
  FROM targets
`;

function validate({ target_amount, target_date }) {
  if (target_amount === undefined || target_amount === null || target_amount === '') return 'Target amount is required';
  if (Number(target_amount) <= 0) return 'Target amount must be greater than zero';
  if (!target_date) return 'Target date is required';
  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${SELECT} ORDER BY target_date DESC, id DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    const { target_amount, target_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO targets (target_amount, target_date, created_by) VALUES (?,?,?)',
      [target_amount, target_date, req.user.id]
    );
    const [rows] = await pool.query(`${SELECT} WHERE id=?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    const { target_amount, target_date } = req.body;
    const [result] = await pool.query(
      'UPDATE targets SET target_amount=?, target_date=?, updated_by=? WHERE id=?',
      [target_amount, target_date, req.user.id, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
    const [rows] = await pool.query(`${SELECT} WHERE id=?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM targets WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
