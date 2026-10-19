const router = require('express').Router();
const pool   = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

const canCreate = requirePermission('/stock/receipt-config', 'can_create');
const canEdit   = requirePermission('/stock/receipt-config', 'can_edit');
const canDelete = requirePermission('/stock/receipt-config', 'can_delete');

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rc.*,
              CONCAT(uc.firstname,' ',uc.lastname) AS created_by_name,
              CONCAT(uu.firstname,' ',uu.lastname) AS updated_by_name
       FROM receipt_config rc
       LEFT JOIN users uc ON rc.created_by = uc.id
       LEFT JOIN users uu ON rc.updated_by = uu.id
       ORDER BY rc.id`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

/* Active config — first record; used by receipt modal */
router.get('/active', async (req, res, next) => {
  try {
    const [[row]] = await pool.query(
      'SELECT * FROM receipt_config ORDER BY id LIMIT 1'
    );
    res.json(row || null);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { config_name, payment_details, customer_care_no, email, other_conditions } = req.body;
    const [result] = await pool.query(
      `INSERT INTO receipt_config (config_name, payment_details, customer_care_no, email, other_conditions, created_by)
       VALUES (?,?,?,?,?,?)`,
      [config_name || 'Default', payment_details || null,
       customer_care_no || null, email || null, other_conditions || null, req.user.id]
    );
    const [[row]] = await pool.query(
      `SELECT rc.*,
              CONCAT(uc.firstname,' ',uc.lastname) AS created_by_name,
              CONCAT(uu.firstname,' ',uu.lastname) AS updated_by_name
       FROM receipt_config rc
       LEFT JOIN users uc ON rc.created_by = uc.id
       LEFT JOIN users uu ON rc.updated_by = uu.id
       WHERE rc.id = ?`,
      [result.insertId]
    );
    res.status(201).json(row);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { config_name, payment_details, customer_care_no, email, other_conditions } = req.body;
    await pool.query(
      `UPDATE receipt_config SET
         config_name=?, payment_details=?, customer_care_no=?, email=?,
         other_conditions=?, updated_by=?, updated_at=NOW()
       WHERE id=?`,
      [config_name || 'Default', payment_details || null,
       customer_care_no || null, email || null, other_conditions || null,
       req.user.id, req.params.id]
    );
    const [[row]] = await pool.query(
      `SELECT rc.*,
              CONCAT(uc.firstname,' ',uc.lastname) AS created_by_name,
              CONCAT(uu.firstname,' ',uu.lastname) AS updated_by_name
       FROM receipt_config rc
       LEFT JOIN users uc ON rc.created_by = uc.id
       LEFT JOIN users uu ON rc.updated_by = uu.id
       WHERE rc.id = ?`,
      [req.params.id]
    );
    res.json(row);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM receipt_config WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
