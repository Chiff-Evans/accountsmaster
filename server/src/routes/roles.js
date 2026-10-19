const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

const canCreate = requirePermission('/config/roles', 'can_create');
const canEdit   = requirePermission('/config/roles', 'can_edit');
const canDelete = requirePermission('/config/roles', 'can_delete');

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM roles ORDER BY role_name');
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [role] = await pool.query('SELECT * FROM roles WHERE id=?', [req.params.id]);
    if (!role.length) return res.status(404).json({ message: 'Role not found' });
    const [access] = await pool.query(
      `SELECT rma.*, m.menu_name, m.view_path, m.level, m.parent_menu_id
       FROM role_menu_access rma JOIN menus m ON rma.menu_id = m.id
       WHERE rma.role_id = ? ORDER BY m.level, m.menu_order`,
      [req.params.id]
    );
    const [users] = await pool.query(
      `SELECT u.id, u.user_ref_no, u.firstname, u.lastname, u.username, u.email
       FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE ur.role_id = ?`,
      [req.params.id]
    );
    res.json({ ...role[0], access, users });
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { role_name, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO roles (role_name, description) VALUES (?,?)',
      [role_name, description]
    );
    const [rows] = await pool.query('SELECT * FROM roles WHERE id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { role_name, description } = req.body;
    await pool.query('UPDATE roles SET role_name=?, description=? WHERE id=?',
      [role_name, description, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM roles WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM roles WHERE id=?', [req.params.id]);
    res.json({ message: 'Role deleted' });
  } catch (err) { next(err); }
});

// PUT /api/roles/:id/access  — update menu access rights for role
router.put('/:id/access', canEdit, async (req, res, next) => {
  try {
    const { access } = req.body; // [{menu_id, can_view, can_create, can_edit, can_delete}]
    const roleId = req.params.id;
    await pool.query('DELETE FROM role_menu_access WHERE role_id=?', [roleId]);
    if (access && access.length) {
      const values = access.map(a => [roleId, a.menu_id, a.can_view||0, a.can_create||0, a.can_edit||0, a.can_delete||0]);
      await pool.query(
        'INSERT INTO role_menu_access (role_id,menu_id,can_view,can_create,can_edit,can_delete) VALUES ?',
        [values]
      );
    }
    res.json({ message: 'Access rights updated' });
  } catch (err) { next(err); }
});

// GET /api/roles/:id/users
router.get('/:id/users', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.user_ref_no, u.firstname, u.lastname, u.username, u.email, u.status
       FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE ur.role_id = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/roles/:id/users  — add user to role
router.post('/:id/users', canEdit, async (req, res, next) => {
  try {
    const { user_id } = req.body;
    await pool.query(
      'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?,?)',
      [user_id, req.params.id]
    );
    res.json({ message: 'User added to role' });
  } catch (err) { next(err); }
});

// DELETE /api/roles/:id/users/:userId
router.delete('/:id/users/:userId', canEdit, async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM user_roles WHERE role_id=? AND user_id=?',
      [req.params.id, req.params.userId]
    );
    res.json({ message: 'User removed from role' });
  } catch (err) { next(err); }
});

module.exports = router;
