const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    if (!users.length)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = users[0];
    if (user.status !== 'active')
      return res.status(403).json({ message: `Account is ${user.status}` });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' });

    const [roles] = await pool.query(
      `SELECT r.id, r.role_name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?`,
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, username: user.username, roles: roles.map(r => r.id) },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const ip = req.ip || req.connection.remoteAddress;
    await pool.query(
      'INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 8 HOUR))',
      [user.id, token.slice(-20), ip, req.headers['user-agent'] || '']
    );

    res.json({
      token,
      user: {
        id: user.id,
        user_ref_no: user.user_ref_no,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        profile_image: user.profile_image,
        roles,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/menus  — returns menu tree for the logged-in user
router.get('/menus', authenticate, async (req, res, next) => {
  try {
    const roleIds = req.user.roles;
    if (!roleIds || !roleIds.length) return res.json([]);

    const placeholders = roleIds.map(() => '?').join(',');
    const [menus] = await pool.query(
      `SELECT m.*,
              COALESCE(MAX(rma.can_view),   0) AS can_view,
              COALESCE(MAX(rma.can_create), 0) AS can_create,
              COALESCE(MAX(rma.can_edit),   0) AS can_edit,
              COALESCE(MAX(rma.can_delete), 0) AS can_delete
       FROM menus m
       LEFT JOIN role_menu_access rma
              ON m.id = rma.menu_id AND rma.role_id IN (${placeholders})
       WHERE m.is_visible = 1
       GROUP BY m.id
       ORDER BY m.level, m.menu_order`,
      roleIds
    );

    res.json(buildMenuTree(menus, null));
  } catch (err) {
    next(err);
  }
});

function buildMenuTree(menus, parentId) {
  return menus
    .filter(m => m.parent_menu_id === parentId)
    .map(m => ({ ...m, children: buildMenuTree(menus, m.id) }));
}

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.user_ref_no, u.firstname, u.lastname, u.username,
              u.email, u.phone, u.gender, u.profile_image, u.last_login
       FROM users u WHERE u.id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    const [roles] = await pool.query(
      `SELECT r.id, r.role_name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?`,
      [req.user.id]
    );
    res.json({ ...rows[0], roles });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE user_sessions SET is_active = 0 WHERE user_id = ? AND is_active = 1',
      [req.user.id]
    );
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
