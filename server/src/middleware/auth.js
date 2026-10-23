const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, username, status FROM users WHERE id = ?',
      [decoded.id]
    );
    if (!rows.length) return res.status(401).json({ message: 'User not found' });
    if (rows[0].status !== 'active') {
      return res.status(403).json({ message: `Account is ${rows[0].status}` });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Checks that the user's roles grant the required permission on the menu matched by viewPath.
// Usage: requirePermission('/members', 'can_edit')
const requirePermission = (viewPath, permission) => async (req, res, next) => {
  try {
    const roleIds = req.user?.roles;
    if (!roleIds?.length) return res.status(403).json({ message: 'Access denied' });

    const placeholders = roleIds.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT MAX(rma.${permission}) AS granted
       FROM menus m
       JOIN role_menu_access rma ON m.id = rma.menu_id
       WHERE m.view_path = ? AND rma.role_id IN (${placeholders})`,
      [viewPath, ...roleIds]
    );
    if (!rows[0]?.granted) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  } catch (err) { next(err); }
};

module.exports = { authenticate, requirePermission };
