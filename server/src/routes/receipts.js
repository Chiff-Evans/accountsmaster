const router  = require('express').Router();
const pool    = require('../config/db');
const crypto  = require('crypto');
const { authenticate } = require('../middleware/auth');
const { generateRefNo } = require('../helpers/refNumber');

function signReceiptNo(receiptNo) {
  const secret = process.env.RECEIPT_SECRET || 'sm-receipt-2026';
  return crypto.createHmac('sha256', secret).update(String(receiptNo)).digest('hex').slice(0, 24);
}

/* ── Public: no auth required — receipt verification by receipt_no ── */
router.get('/public/:receipt_no', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token || token !== signReceiptNo(req.params.receipt_no)) {
      return res.status(403).json({ message: 'Invalid receipt link' });
    }

    const [[receipt]] = await pool.query(
      `SELECT r.*,
              CONCAT(up.firstname,' ',up.lastname) AS printed_by_name,
              CONCAT(uc.firstname,' ',uc.lastname) AS created_by_name
       FROM order_receipts r
       LEFT JOIN users up ON r.printed_by  = up.id
       LEFT JOIN users uc ON r.created_by  = uc.id
       WHERE r.receipt_no = ?`,
      [req.params.receipt_no]
    );
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });

    const [[order]] = await pool.query(
      `SELECT o.id, o.order_ref_no, o.total_amount, o.created_at,
              sh.shop_name, sh.phone AS shop_phone, sh.email AS shop_email,
              CONCAT(dc.firstname,' ',dc.lastname) AS advertiser_name,
              dc.phone AS advertiser_phone, dc.email AS advertiser_email
       FROM orders o
       LEFT JOIN shops sh       ON o.shop_id       = sh.id
       LEFT JOIN advertisers dc ON o.advertiser_id = dc.id
       WHERE o.id = ?`,
      [receipt.order_id]
    );

    const [items] = await pool.query(
      `SELECT oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) AS subtotal,
              i.name AS item_name, un.unit_name
       FROM order_items oi
       JOIN trips i       ON oi.item_id = i.id
       LEFT JOIN units un ON oi.unit_id = un.id
       WHERE oi.order_id = ?`,
      [receipt.order_id]
    );

    const [[business]] = await pool.query('SELECT * FROM business ORDER BY id LIMIT 1');

    res.json({ receipt, order, items, business: business || {} });
  } catch (err) { next(err); }
});

router.use(authenticate);

/* Full receipt data for an order — merges order, business, and stored receipt */
router.get('/order/:order_id', async (req, res, next) => {
  try {
    const { order_id } = req.params;

    const [[order]] = await pool.query(
      `SELECT o.id, o.order_ref_no, o.total_amount, o.created_at, o.shop_id, o.advertiser_id,
              sh.shop_name, sh.phone AS shop_phone,
              sh.email AS shop_email,
              sh.geolocation AS shop_address,
              CONCAT(dc.firstname,' ',dc.lastname) AS advertiser_name,
              dc.phone AS advertiser_phone, dc.email AS advertiser_email,
              CONCAT(u.firstname,' ',u.lastname) AS ordered_by_name,
              ws.stage_name
       FROM orders o
       LEFT JOIN shops sh           ON o.shop_id           = sh.id
       LEFT JOIN advertisers dc     ON o.advertiser_id     = dc.id
       LEFT JOIN users u            ON o.ordered_by        = u.id
       LEFT JOIN workflow_stages ws ON o.workflow_stage_id = ws.id
       WHERE o.id = ?`,
      [order_id]
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const [items] = await pool.query(
      `SELECT oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) AS subtotal,
              i.name AS item_name, un.unit_name
       FROM order_items oi
       JOIN trips i       ON oi.item_id = i.id
       LEFT JOIN units un ON oi.unit_id = un.id
       WHERE oi.order_id = ?`,
      [order_id]
    );

    const [[business]] = await pool.query('SELECT * FROM business ORDER BY id LIMIT 1');

    const [[receipt]] = await pool.query(
      `SELECT r.*,
              CONCAT(up.firstname,' ',up.lastname) AS printed_by_name,
              CONCAT(uc.firstname,' ',uc.lastname) AS created_by_name
       FROM order_receipts r
       LEFT JOIN users up ON r.printed_by = up.id
       LEFT JOIN users uc ON r.created_by = uc.id
       WHERE r.order_id = ?`,
      [order_id]
    );

    const receiptWithToken = receipt
      ? { ...receipt, receipt_token: signReceiptNo(receipt.receipt_no) }
      : null;
    res.json({ order, items, business: business || {}, receipt: receiptWithToken });
  } catch (err) { next(err); }
});

/* Preview next receipt number without saving */
router.get('/next-no', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rn.prefix, rn.next_serial, rn.padding, rn.use_year, rn.use_month
       FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       WHERE pt.process_type_name = 'order_receipt'
       LIMIT 1`
    );
    if (!rows.length) return res.json({ receipt_no: null });
    const cfg = rows[0];
    const padded = String(cfg.next_serial).padStart(cfg.padding, '0');
    const now    = new Date();
    const year   = cfg.use_year  ? `-${now.getFullYear()}` : '';
    const month  = cfg.use_month ? `-${String(now.getMonth() + 1).padStart(2, '0')}` : '';
    res.json({ receipt_no: `${cfg.prefix}${year}${month}-${padded}` });
  } catch (err) { next(err); }
});

/* Save (create or update) a receipt */
router.post('/order/:order_id', async (req, res, next) => {
  try {
    const { order_id } = req.params;
    const { payment_details, customer_care_no, tax_no, payment_mode,
            paid_amount, payment_reference, balance, discount, other_conditions } = req.body;

    const [[existing]] = await pool.query(
      'SELECT id FROM order_receipts WHERE order_id = ?', [order_id]
    );

    if (existing) {
      await pool.query(
        `UPDATE order_receipts SET
           payment_details=?, customer_care_no=?, tax_no=?,
           payment_mode=?, paid_amount=?, payment_reference=?, balance=?,
           discount=?, other_conditions=?, updated_by=?, updated_at=NOW()
         WHERE order_id=?`,
        [payment_details || null, customer_care_no || null, tax_no || null,
         payment_mode || 'Cash', paid_amount || null, payment_reference || null,
         balance || null, discount || 0, other_conditions || null, req.user.id, order_id]
      );
    } else {
      const receipt_no = await generateRefNo('order_receipt');
      await pool.query(
        `INSERT INTO order_receipts
           (receipt_no, order_id, payment_details, customer_care_no, tax_no,
            payment_mode, paid_amount, payment_reference, balance, discount, other_conditions, created_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [receipt_no, order_id, payment_details || null, customer_care_no || null,
         tax_no || null, payment_mode || 'Cash', paid_amount || null,
         payment_reference || null, balance || null, discount || 0,
         other_conditions || null, req.user.id]
      );
    }

    const [[saved]] = await pool.query(
      'SELECT * FROM order_receipts WHERE order_id = ?', [order_id]
    );
    res.json({ ...saved, receipt_token: signReceiptNo(saved.receipt_no) });
  } catch (err) { next(err); }
});

/* Record a print event */
router.post('/order/:order_id/print', async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE order_receipts SET printed_at=NOW(), printed_by=? WHERE order_id=?`,
      [req.user.id, req.params.order_id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
