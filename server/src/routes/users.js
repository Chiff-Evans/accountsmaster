const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sha256 = str => crypto.createHash('sha256').update(str).digest('hex');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user?.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});

router.use(authenticate);

const canCreate = requirePermission('/users', 'can_create');
const canEdit   = requirePermission('/users', 'can_edit');
const canDelete = requirePermission('/users', 'can_delete');

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const [rows] = await pool.query(
      `SELECT u.id, u.user_ref_no, u.firstname, u.lastname, u.username,
              u.email, u.phone, u.gender, u.status, u.last_login, u.created_at,
              GROUP_CONCAT(r.role_name) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.firstname LIKE ? OR u.lastname LIKE ? OR u.username LIKE ? OR u.email LIKE ?
       GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [search, search, search, search, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(DISTINCT u.id) AS total FROM users u
       WHERE u.firstname LIKE ? OR u.lastname LIKE ? OR u.username LIKE ? OR u.email LIKE ?`,
      [search, search, search, search]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

// ── Users by role (must be before /:id) ───────────────────────
router.get('/by-role/:roleName', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.firstname, u.lastname, u.username
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r       ON r.id       = ur.role_id
       WHERE r.role_name = ? AND u.status = 'active'
       ORDER BY u.firstname, u.lastname`,
      [req.params.roleName]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── Current-user profile routes (must be before /:id) ─────────

router.get('/me', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, user_ref_no, firstname, lastname, username, email, phone, gender, profile_image, status FROM users WHERE id=?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/me/change-password', async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id=?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash=? WHERE id=?', [hash, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(err); }
});

router.post('/me/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const imageUrl = `/uploads/avatars/${req.file.filename}`;
    await pool.query('UPDATE users SET profile_image=? WHERE id=?', [imageUrl, req.user.id]);
    res.json({ profile_image: imageUrl });
  } catch (err) { next(err); }
});

// ── Admin user CRUD ────────────────────────────────────────────

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_ref_no, firstname, lastname, username, email, phone, gender, profile_image, status, last_login, created_at
       FROM users WHERE id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    const [roles] = await pool.query(
      `SELECT r.id, r.role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id=?`,
      [req.params.id]
    );
    const [sessions] = await pool.query(
      'SELECT id, ip_address, user_agent, created_at, expires_at, is_active FROM user_sessions WHERE user_id=? ORDER BY created_at DESC LIMIT 10',
      [req.params.id]
    );
    res.json({ ...rows[0], roles, sessions });
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { firstname, lastname, gender, phone, email, username, password, role_ids } = req.body;
    const user_ref_no = await generateRefNo('user_registration');
    const hash = await bcrypt.hash(password || sha256('Password@12345'), 10);
    const [result] = await pool.query(
      'INSERT INTO users (user_ref_no,firstname,lastname,gender,phone,email,username,password_hash) VALUES (?,?,?,?,?,?,?,?)',
      [user_ref_no, firstname, lastname, gender, phone, email, username, hash]
    );
    const userId = result.insertId;
    if (role_ids && role_ids.length) {
      const values = role_ids.map(rid => [userId, rid]);
      await pool.query('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES ?', [values]);
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE id=?', [userId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { firstname, lastname, gender, phone, email, username, role_ids } = req.body;
    await pool.query(
      'UPDATE users SET firstname=?,lastname=?,gender=?,phone=?,email=?,username=? WHERE id=?',
      [firstname, lastname, gender, phone, email, username, req.params.id]
    );
    if (role_ids !== undefined) {
      await pool.query('DELETE FROM user_roles WHERE user_id=?', [req.params.id]);
      if (role_ids.length) {
        const values = role_ids.map(rid => [req.params.id, rid]);
        await pool.query('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES ?', [values]);
      }
    }
    const [rows] = await pool.query(
      'SELECT id, user_ref_no, firstname, lastname, username, email, phone, gender, status FROM users WHERE id=?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    if (req.params.id == req.user.id)
      return res.status(400).json({ message: 'Cannot delete your own account' });
    await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
});

// POST /api/users/:id/action  — lock, suspend, revoke, activate
router.post('/:id/action', canEdit, async (req, res, next) => {
  try {
    const { action } = req.body;
    const allowed = ['active', 'locked', 'suspended', 'revoked'];
    if (!allowed.includes(action))
      return res.status(400).json({ message: 'Invalid action' });
    await pool.query('UPDATE users SET status=? WHERE id=?', [action, req.params.id]);
    res.json({ message: `User status updated to ${action}` });
  } catch (err) { next(err); }
});

// POST /api/users/:id/reset-password
router.post('/:id/reset-password', canEdit, async (req, res, next) => {
  try {
    const { new_password } = req.body;
    const hash = await bcrypt.hash(new_password || sha256('Password@12345'), 10);
    await pool.query('UPDATE users SET password_hash=? WHERE id=?', [hash, req.params.id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
