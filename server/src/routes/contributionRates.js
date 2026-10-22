const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

const canCreate = requirePermission('/config/contribution-rates', 'can_create');
const canEdit   = requirePermission('/config/contribution-rates', 'can_edit');
const canDelete = requirePermission('/config/contribution-rates', 'can_delete');

// Dates come back as plain YYYY-MM-DD strings so the client never shifts
// them across a timezone boundary.
const SELECT = `
  SELECT cr.id, cr.time_unit_id, tu.paramater_value AS time_unit_name, cr.amount,
         DATE_FORMAT(cr.start_date, '%Y-%m-%d') AS start_date,
         DATE_FORMAT(cr.end_date, '%Y-%m-%d')   AS end_date,
         cr.is_active, cr.created_by, cr.created_on, cr.updated_on,
         NULLIF(TRIM(CONCAT_WS(' ', u.firstname, u.lastname)), '') AS created_by_name, u.username AS created_by_username
  FROM contribution_rates cr
  LEFT JOIN parameter_values tu ON cr.time_unit_id = tu.id
  LEFT JOIN users u             ON cr.created_by = u.id
`;

/* Only one rate can be active — enforced by the
   uq_contribution_rates_single_active index. The write runs in a
   transaction that first locks and clears the current active row, so
   switching the active rate is atomic and two concurrent saves can't both
   end up active. */
async function writeRate(isActive, exceptId, write) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    if (isActive) {
      await conn.query('SELECT id FROM contribution_rates WHERE is_active=1 FOR UPDATE');
      await conn.query('UPDATE contribution_rates SET is_active=0 WHERE is_active=1 AND id<>?', [exceptId]);
    }
    const result = await write(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

const isDuplicateActive = err => err.code === 'ER_DUP_ENTRY' && /uq_contribution_rates_single_active/.test(err.message);
const DUPLICATE_ACTIVE_MSG = 'Another contribution rate was activated at the same time — refresh and try again';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validate({ time_unit_id, amount, start_date, end_date }) {
  if (!time_unit_id) return 'Time unit is required';
  if (amount === undefined || amount === null || amount === '') return 'Amount is required';
  if (!(Number(amount) > 0)) return 'Amount must be greater than zero';
  if (!start_date || !DATE_RE.test(start_date)) return 'Start date is required';
  // End date is optional (an open-ended rate); when given it must be valid.
  if (end_date && !DATE_RE.test(end_date)) return 'End date is not a valid date';
  if (end_date && end_date < start_date) return 'End date cannot be before start date';
  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${SELECT} ORDER BY cr.is_active DESC, cr.start_date DESC, cr.id DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    const { time_unit_id, amount, start_date, end_date, is_active } = req.body;
    const [result] = await writeRate(!!is_active, 0, conn => conn.query(
      `INSERT INTO contribution_rates (time_unit_id, amount, start_date, end_date, is_active, created_by)
       VALUES (?,?,?,?,?,?)`,
      [time_unit_id, amount, start_date, end_date || null, is_active ? 1 : 0, req.user.id]
    ));
    const [rows] = await pool.query(`${SELECT} WHERE cr.id=?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (isDuplicateActive(err)) return res.status(409).json({ message: DUPLICATE_ACTIVE_MSG });
    next(err);
  }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    const { time_unit_id, amount, start_date, end_date, is_active } = req.body;
    const [[existing]] = await pool.query('SELECT id FROM contribution_rates WHERE id=?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    await writeRate(!!is_active, req.params.id, conn => conn.query(
      `UPDATE contribution_rates SET time_unit_id=?, amount=?, start_date=?, end_date=?, is_active=?, updated_by=?
       WHERE id=?`,
      [time_unit_id, amount, start_date, end_date || null, is_active ? 1 : 0, req.user.id, req.params.id]
    ));
    const [rows] = await pool.query(`${SELECT} WHERE cr.id=?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    if (isDuplicateActive(err)) return res.status(409).json({ message: DUPLICATE_ACTIVE_MSG });
    next(err);
  }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM contribution_rates WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
