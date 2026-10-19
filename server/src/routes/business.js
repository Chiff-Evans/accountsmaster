const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

const canCreate = requirePermission('/config/business', 'can_create');
const canEdit   = requirePermission('/config/business', 'can_edit');
const canDelete = requirePermission('/config/business', 'can_delete');

// ── Business CRUD ─────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM business ORDER BY id');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { business_name, owner_name, email, phone, location, incorporation_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO business (business_name, owner_name, email, phone, location, incorporation_date) VALUES (?,?,?,?,?,?)',
      [business_name, owner_name, email || null, phone || null, location || null, incorporation_date || null]
    );
    const [rows] = await pool.query('SELECT * FROM business WHERE id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { business_name, owner_name, email, phone, location, incorporation_date } = req.body;
    await pool.query(
      'UPDATE business SET business_name=?, owner_name=?, email=?, phone=?, location=?, incorporation_date=? WHERE id=?',
      [business_name, owner_name, email || null, phone || null, location || null, incorporation_date || null, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM business WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM business WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── Shareholders (defined before /:id to avoid param collision) ───

router.get('/shareholders', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, b.business_name
      FROM   business_shareholders s
      JOIN   business b ON b.id = s.business_id
      ORDER  BY s.business_id, s.shareholder_name
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/shareholders', canCreate, async (req, res, next) => {
  try {
    const { business_id, shareholder_name, role, id_number, phone, email, shares_percent, shares_amount } = req.body;
    const [result] = await pool.query(
      `INSERT INTO business_shareholders
         (business_id, shareholder_name, role, id_number, phone, email, shares_percent, shares_amount)
       VALUES (?,?,?,?,?,?,?,?)`,
      [business_id, shareholder_name, role || null, id_number || null,
       phone || null, email || null, shares_percent || 0, shares_amount || 0]
    );
    const [rows] = await pool.query(`
      SELECT s.*, b.business_name
      FROM   business_shareholders s
      JOIN   business b ON b.id = s.business_id
      WHERE  s.id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/shareholders/:id', canEdit, async (req, res, next) => {
  try {
    const { business_id, shareholder_name, role, id_number, phone, email, shares_percent, shares_amount } = req.body;
    await pool.query(
      `UPDATE business_shareholders SET
         business_id=?, shareholder_name=?, role=?, id_number=?,
         phone=?, email=?, shares_percent=?, shares_amount=?
       WHERE id=?`,
      [business_id, shareholder_name, role || null, id_number || null,
       phone || null, email || null, shares_percent || 0, shares_amount || 0, req.params.id]
    );
    const [rows] = await pool.query(`
      SELECT s.*, b.business_name
      FROM   business_shareholders s
      JOIN   business b ON b.id = s.business_id
      WHERE  s.id = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/shareholders/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM business_shareholders WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
