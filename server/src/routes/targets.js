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
  SELECT t.id, t.target_amount, DATE_FORMAT(t.target_date, '%Y-%m-%d') AS target_date, t.is_active,
         t.created_by, t.created_on, t.updated_on,
         NULLIF(TRIM(CONCAT_WS(' ', u.firstname, u.lastname)), '') AS created_by_name, u.username AS created_by_username
  FROM targets t
  LEFT JOIN users u ON t.created_by = u.id
`;

/* Only one target can be active — enforced by the uq_targets_single_active
   index. The write runs in a transaction that first locks and clears the
   current active row, so switching the active target is atomic and two
   concurrent saves can't both end up active. */
async function writeTarget(isActive, exceptId, write) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    if (isActive) {
      await conn.query('SELECT id FROM targets WHERE is_active=1 FOR UPDATE');
      await conn.query('UPDATE targets SET is_active=0 WHERE is_active=1 AND id<>?', [exceptId]);
    }
    const result = await write(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

const isDuplicateActive = err => err.code === 'ER_DUP_ENTRY' && /uq_targets_single_active/.test(err.message);
const DUPLICATE_ACTIVE_MSG = 'Another target was activated at the same time — refresh and try again';

function validate({ target_amount, target_date }) {
  if (target_amount === undefined || target_amount === null || target_amount === '') return 'Target amount is required';
  if (Number(target_amount) <= 0) return 'Target amount must be greater than zero';
  if (!target_date) return 'Target date is required';
  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${SELECT} ORDER BY t.target_date DESC, t.id DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    const { target_amount, target_date, is_active } = req.body;
    const [result] = await writeTarget(!!is_active, 0, conn => conn.query(
      'INSERT INTO targets (target_amount, target_date, is_active, created_by) VALUES (?,?,?,?)',
      [target_amount, target_date, is_active ? 1 : 0, req.user.id]
    ));
    const [rows] = await pool.query(`${SELECT} WHERE t.id=?`, [result.insertId]);
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
    const { target_amount, target_date, is_active } = req.body;
    const [[existing]] = await pool.query('SELECT id FROM targets WHERE id=?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    await writeTarget(!!is_active, req.params.id, conn => conn.query(
      'UPDATE targets SET target_amount=?, target_date=?, is_active=?, updated_by=? WHERE id=?',
      [target_amount, target_date, is_active ? 1 : 0, req.user.id, req.params.id]
    ));
    const [rows] = await pool.query(`${SELECT} WHERE t.id=?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    if (isDuplicateActive(err)) return res.status(409).json({ message: DUPLICATE_ACTIVE_MSG });
    next(err);
  }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM targets WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
