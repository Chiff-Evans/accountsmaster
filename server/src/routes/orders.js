const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { pushTo } = require('../utils/pushNotify');
const { encodeId }    = require('../utils/hashids');

const canCreate = requirePermission('/orders', 'can_create');
const canEdit   = requirePermission('/orders', 'can_edit');
const canDelete = requirePermission('/orders', 'can_delete');
const { generateRefNo } = require('../helpers/refNumber');

router.use(authenticate);

/* Find the initial stage of the first active workflow */
async function getDefaultInitialStage() {
  const [rows] = await pool.query(
    `SELECT w.id AS workflow_id, ws.id AS stage_id, w.process_type_id
     FROM workflows w
     JOIN workflow_stages ws ON ws.workflow_id = w.id AND ws.is_initial = 1
     WHERE w.is_active = 1
     ORDER BY w.id ASC LIMIT 1`
  );
  return rows[0] || null;
}

/* ── List orders ── */
router.get('/', async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { workflow_stage_id, search } = req.query;

    let where = 'WHERE 1=1';
    const params = [];
    if (workflow_stage_id) { where += ' AND o.workflow_stage_id=?'; params.push(workflow_stage_id); }
    if (search) {
      where += ` AND (
        o.order_ref_no                                                   LIKE ? OR
        sh.shop_name                                                     LIKE ? OR
        CONCAT(COALESCE(u.firstname,''),' ',COALESCE(u.lastname,''))     LIKE ? OR
        CONCAT(COALESCE(c.firstname,''),' ',COALESCE(c.lastname,''))     LIKE ? OR
        CONCAT(COALESCE(dc.firstname,''),' ',COALESCE(dc.lastname,''))   LIKE ? OR
        ws.stage_name                                                    LIKE ? OR
        o.notes                                                          LIKE ? OR
        DATE_FORMAT(o.created_at, '%Y-%m-%d')                           LIKE ? OR
        CAST(o.total_amount AS CHAR)                                     LIKE ? OR
        i.name                                                           LIKE ?
      )`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s, s, s, s, s);
    }

    /* If the logged-in user is a Driver, restrict to their assigned orders only */
    const [[driverRole]] = await pool.query(
      `SELECT r.id FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE r.role_name = 'Drivers' AND ur.user_id = ?`,
      [req.user.id]
    );
    if (driverRole) {
      where += ' AND o.assigned_driver_id = ?';
      params.push(req.user.id);
    }

    const [rows] = await pool.query(
      `SELECT o.id, o.order_ref_no, o.shop_id, o.member_id, o.ordered_by, o.notes,
              o.total_amount, o.workflow_id, o.workflow_stage_id, o.created_at,
              o.assigned_driver_id,
              sh.shop_name,
              CONCAT(dc.firstname,' ',dc.lastname) AS member_name,
              dc.phone AS member_phone,
              COALESCE(
                CONCAT(u.firstname,' ',u.lastname),
                CONCAT(c.firstname,' ',c.lastname),
                CONCAT(dc.firstname,' ',dc.lastname)
              ) AS ordered_by_name,
              CONCAT(d.firstname,' ',d.lastname) AS driver_name,
              ws.stage_name, ws.stage_color,
              COUNT(oi.id) AS item_count
       FROM orders o
       LEFT JOIN shops sh             ON o.shop_id             = sh.id
       LEFT JOIN members dc       ON o.member_id       = dc.id
       LEFT JOIN users u              ON o.ordered_by          = u.id
       LEFT JOIN users d              ON o.assigned_driver_id  = d.id
       LEFT JOIN members c        ON sh.owner_id           = c.id AND o.ordered_by IS NULL
       LEFT JOIN workflow_stages ws   ON o.workflow_stage_id   = ws.id
       LEFT JOIN order_items oi       ON o.id                  = oi.order_id
       LEFT JOIN trips i              ON oi.item_id            = i.id
       ${where}
       GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(DISTINCT o.id) AS total FROM orders o
       LEFT JOIN shops sh           ON o.shop_id             = sh.id
       LEFT JOIN members dc     ON o.member_id       = dc.id
       LEFT JOIN users u            ON o.ordered_by          = u.id
       LEFT JOIN users d            ON o.assigned_driver_id  = d.id
       LEFT JOIN members c      ON sh.owner_id           = c.id AND o.ordered_by IS NULL
       LEFT JOIN workflow_stages ws ON o.workflow_stage_id   = ws.id
       LEFT JOIN order_items oi     ON o.id                  = oi.order_id
       LEFT JOIN trips i            ON oi.item_id            = i.id
       ${where}`,
      params
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

/* ── Single order ── */
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.*, sh.shop_name,
              CONCAT(dc.firstname,' ',dc.lastname) AS member_name,
              dc.phone AS member_phone, dc.email AS member_email,
              COALESCE(
                CONCAT(u.firstname,' ',u.lastname),
                CONCAT(c.firstname,' ',c.lastname),
                CONCAT(dc.firstname,' ',dc.lastname)
              ) AS ordered_by_name,
              ws.stage_name, ws.stage_color, ws.responsible_group
       FROM orders o
       LEFT JOIN shops sh           ON o.shop_id           = sh.id
       LEFT JOIN members dc     ON o.member_id     = dc.id
       LEFT JOIN users u            ON o.ordered_by        = u.id
       LEFT JOIN members c      ON sh.owner_id         = c.id AND o.ordered_by IS NULL
       LEFT JOIN workflow_stages ws ON o.workflow_stage_id = ws.id
       WHERE o.id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const [items] = await pool.query(
      `SELECT oi.*, i.name AS item_name, i.file_no AS item_code, un.unit_name,
              (oi.quantity * oi.unit_price) AS subtotal
       FROM order_items oi
       JOIN trips i    ON oi.item_id = i.id
       LEFT JOIN units un ON oi.unit_id = un.id
       WHERE oi.order_id=?`,
      [req.params.id]
    );
    res.json({ ...rows[0], items });
  } catch (err) { next(err); }
});

/* ── Available transitions for an order ── */
router.get('/:id/transitions', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id AS transition_id, t.action_label,
              cs.id AS from_stage_id, cs.stage_name AS from_stage_name, cs.stage_color AS from_stage_color,
              ts.id AS to_stage_id,   ts.stage_name AS to_stage_name,   ts.stage_color AS to_stage_color
       FROM orders o
       JOIN workflow_stages cs    ON o.workflow_stage_id = cs.id
       JOIN workflow_transitions t ON t.from_stage_id = cs.id AND t.workflow_id = o.workflow_id
       JOIN workflow_stages ts    ON t.to_stage_id = ts.id
       WHERE o.id = ?
       ORDER BY t.id`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

/* ── Create order ── */
router.post('/', canCreate, async (req, res, next) => {
  try {
    const { shop_id, notes, items } = req.body;
    // An order is either for a shop or for an individual member — never both.
    const member_id = shop_id ? null : (req.body.member_id || null);
    if (!shop_id && !member_id) {
      return res.status(400).json({ message: 'Select a shop or an individual member' });
    }
    const order_ref_no = await generateRefNo('order_placement');

    const initStage = await getDefaultInitialStage();

    const [result] = await pool.query(
      'INSERT INTO orders (order_ref_no, shop_id, member_id, ordered_by, notes, workflow_id, workflow_stage_id) VALUES (?,?,?,?,?,?,?)',
      [order_ref_no, shop_id || null, member_id, req.user.id, notes,
       initStage?.workflow_id || null, initStage?.stage_id || null]
    );
    const orderId = result.insertId;

    if (items && items.length) {
      const values = items.map(it => [orderId, it.item_id, it.quantity, it.unit_id || null, it.unit_price || 0]);
      await pool.query('INSERT INTO order_items (order_id,item_id,quantity,unit_id,unit_price) VALUES ?', [values]);
      const [[totRow]] = await pool.query('SELECT SUM(quantity*unit_price) AS tot FROM order_items WHERE order_id=?', [orderId]);
      await pool.query('UPDATE orders SET total_amount=? WHERE id=?', [totRow.tot || 0, orderId]);
    }

    if (initStage) {
      await pool.query(
        `INSERT INTO workflow_history
           (workflow_id, process_type_id, entity_type, entity_id, entity_ref,
            to_stage_id, to_status, moved_by, notes)
         VALUES (?, ?, 'order', ?, ?, ?, ?, ?, ?)`,
        [initStage.workflow_id, initStage.process_type_id || null,
         orderId, order_ref_no, initStage.stage_id,
         null, req.user.id, 'Order created']
      );
    }

    const [rows] = await pool.query(
      `SELECT o.*, ws.stage_name, ws.stage_color FROM orders o
       LEFT JOIN workflow_stages ws ON o.workflow_stage_id = ws.id WHERE o.id=?`,
      [orderId]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

/* ── Update order ── */
router.put('/:id', canEdit, async (req, res, next) => {
  try {
    const { shop_id, notes, items } = req.body;
    // An order is either for a shop or for an individual member — never both.
    const member_id = shop_id ? null : (req.body.member_id || null);
    if (!shop_id && !member_id) {
      return res.status(400).json({ message: 'Select a shop or an individual member' });
    }
    await pool.query('UPDATE orders SET shop_id=?, member_id=?, notes=? WHERE id=?',
      [shop_id || null, member_id, notes, req.params.id]);
    if (items !== undefined) {
      await pool.query('DELETE FROM order_items WHERE order_id=?', [req.params.id]);
      if (items.length) {
        const values = items.map(it => [req.params.id, it.item_id, it.quantity, it.unit_id || null, it.unit_price || 0]);
        await pool.query('INSERT INTO order_items (order_id,item_id,quantity,unit_id,unit_price) VALUES ?', [values]);
        const [[totRow]] = await pool.query('SELECT SUM(quantity*unit_price) AS tot FROM order_items WHERE order_id=?', [req.params.id]);
        await pool.query('UPDATE orders SET total_amount=? WHERE id=?', [totRow.tot || 0, req.params.id]);
      }
    }
    const [rows] = await pool.query(
      `SELECT o.*, ws.stage_name, ws.stage_color FROM orders o
       LEFT JOIN workflow_stages ws ON o.workflow_stage_id = ws.id WHERE o.id=?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});

/* ── Transition order to next stage ── */
router.post('/:id/transition', canEdit, async (req, res, next) => {
  try {
    const { transition_id, notes, assigned_driver_id } = req.body;

    const [[order]] = await pool.query(
      `SELECT o.id, o.order_ref_no, o.workflow_id, o.workflow_stage_id,
              ws.responsible_group, ws.stage_name AS current_stage_name,
              w.process_type_id
       FROM orders o
       JOIN workflow_stages ws ON o.workflow_stage_id = ws.id
       JOIN workflows w        ON o.workflow_id       = w.id
       WHERE o.id = ?`,
      [req.params.id]
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    /* Role check: only the responsible group can move from this stage */
    if (order.responsible_group) {
      const [[roleRow]] = await pool.query(
        'SELECT id FROM roles WHERE role_name = ?', [order.responsible_group]
      );
      if (!roleRow || !(req.user.roles || []).includes(roleRow.id)) {
        return res.status(403).json({
          message: `Only users with role "${order.responsible_group}" can move orders from "${order.current_stage_name}"`,
        });
      }
    }

    /* Validate transition belongs to this workflow and current stage */
    const [[transition]] = await pool.query(
      `SELECT t.*, ts.stage_name AS to_stage_name
       FROM workflow_transitions t
       JOIN workflow_stages ts ON t.to_stage_id = ts.id
       WHERE t.id = ? AND t.workflow_id = ? AND t.from_stage_id = ?`,
      [transition_id, order.workflow_id, order.workflow_stage_id]
    );
    if (!transition) return res.status(400).json({ message: 'Invalid transition for current stage' });

    await pool.query(
      `UPDATE orders SET workflow_stage_id = ?
         ${assigned_driver_id ? ', assigned_driver_id = ?' : ''}
       WHERE id = ?`,
      assigned_driver_id
        ? [transition.to_stage_id, assigned_driver_id, req.params.id]
        : [transition.to_stage_id, req.params.id]
    );

    await pool.query(
      `INSERT INTO workflow_history
         (workflow_id, process_type_id, entity_type, entity_id, entity_ref,
          from_stage_id, to_stage_id, from_status, to_status, moved_by, notes)
       VALUES (?, ?, 'order', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order.workflow_id, order.process_type_id || null,
       order.id, order.order_ref_no,
       order.workflow_stage_id, transition.to_stage_id,
       order.current_stage_name, transition.to_stage_name,
       req.user.id, notes || null]
    );

    /* ── Award loyalty points if this stage qualifies ── */
    try {
      const [[lc]] = await pool.query('SELECT * FROM loyalty_config WHERE id=1 LIMIT 1');
      if (lc?.is_active && lc.qualifying_stage_id == transition.to_stage_id) {
        const [[ord]] = await pool.query(
          `SELECT o.total_amount, COALESCE(o.member_id, sh.owner_id) AS member_id
           FROM orders o LEFT JOIN shops sh ON sh.id = o.shop_id
           WHERE o.id = ?`,
          [req.params.id]
        );
        if (ord?.member_id && Number(ord.total_amount) >= Number(lc.min_sale_amount)) {
          const pts = Math.floor(Number(ord.total_amount) / Number(lc.amount_per_point));
          if (pts > 0) {
            const [ins] = await pool.query(
              `INSERT IGNORE INTO loyalty_points (member_id, order_id, points, order_total)
               VALUES (?, ?, ?, ?)`,
              [ord.member_id, req.params.id, pts, ord.total_amount]
            );
            if (ins.affectedRows) {
              await pool.query(
                'UPDATE members SET loyalty_points = loyalty_points + ? WHERE id = ?',
                [pts, ord.member_id]
              );
            }
          }
        }
      }
    } catch (loyaltyErr) {
      console.error('Loyalty points error:', loyaltyErr.message);
    }

    /* ── Push notification to the order's member (direct, or via shop ownership) ── */
    try {
      const [[orderMember]] = await pool.query(
        `SELECT COALESCE(o.member_id, sh.owner_id) AS member_id
         FROM orders o LEFT JOIN shops sh ON sh.id = o.shop_id
         WHERE o.id = ?`,
        [req.params.id]
      );
      if (orderMember?.member_id) {
        await pushTo('member', orderMember.member_id, {
          title: 'Order Update',
          body:  `${order.order_ref_no} has moved to "${transition.to_stage_name}"`,
          url:   `/orders/${encodeId(req.params.id)}`,
          tag:   `order-${req.params.id}`,
        });
      }
    } catch (pushErr) {
      console.error('Push notification error:', pushErr.message);
    }

    res.json({ message: 'Stage updated', stage_name: transition.to_stage_name });
  } catch (err) { next(err); }
});

/* ── Delete order ── */
router.delete('/:id', canDelete, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM orders WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
