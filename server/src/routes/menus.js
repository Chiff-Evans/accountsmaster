const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

const canCreate = requirePermission('/config/menus', 'can_create');
const canEdit   = requirePermission('/config/menus', 'can_edit');
const canDelete = requirePermission('/config/menus', 'can_delete');

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, p.menu_name AS parent_name
       FROM menus m LEFT JOIN menus p ON m.parent_menu_id = p.id
       ORDER BY m.level, m.menu_order`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/tree', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM menus ORDER BY level, menu_order'
    );
    res.json(buildTree(rows, null));
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menus WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Menu not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/', canCreate, async (req, res, next) => {
  try {
    const { menu_name, parent_menu_id, level, view_path, menu_order, icon, description, is_visible } = req.body;
    const [result] = await pool.query(
      'INSERT INTO menus (menu_name,parent_menu_id,level,view_path,menu_order,icon,description,is_visible) VALUES (?,?,?,?,?,?,?,?)',
      [menu_name, parent_menu_id || null, level || 1, view_path, menu_order || 0, icon, description, is_visible !== undefined ? is_visible : 1]
    );
    const [rows] = await pool.query('SELECT * FROM menus WHERE id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { menu_name, parent_menu_id, level, view_path, menu_order, icon, description, is_visible } = req.body;
    await pool.query(
      'UPDATE menus SET menu_name=?,parent_menu_id=?,level=?,view_path=?,menu_order=?,icon=?,description=?,is_visible=? WHERE id=?',
      [menu_name, parent_menu_id || null, level, view_path, menu_order, icon, description, is_visible, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM menus WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM menus WHERE id=?', [req.params.id]);
    res.json({ message: 'Menu deleted' });
  } catch (err) { next(err); }
});

function buildTree(menus, parentId) {
  return menus
    .filter(m => m.parent_menu_id === parentId)
    .map(m => ({ ...m, children: buildTree(menus, m.id) }));
}

module.exports = router;
