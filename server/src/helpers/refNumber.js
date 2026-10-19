const pool = require('../config/db');

async function generateRefNo(processTypeName) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT rn.*, pt.process_type_name
       FROM ref_numbering rn
       JOIN process_types pt ON rn.process_type_id = pt.id
       WHERE pt.process_type_name = ?
       FOR UPDATE`,
      [processTypeName]
    );

    if (!rows.length) {
      await conn.rollback();
      return null;
    }

    const cfg = rows[0];
    const serial = cfg.next_serial;
    const padded = String(serial).padStart(cfg.padding, '0');
    const now = new Date();
    const year  = cfg.use_year  ? `-${now.getFullYear()}` : '';
    const month = cfg.use_month ? `-${String(now.getMonth() + 1).padStart(2, '0')}` : '';
    // Only force a "-" separator before the serial when the prefix doesn't
    // already end in its own separator (e.g. "ADV/TRP/" shouldn't become "ADV/TRP/-0001").
    const sep = /[/-]$/.test(cfg.prefix) ? '' : '-';
    const refNo = `${cfg.prefix}${year}${month}${sep}${padded}`;

    await conn.query(
      'UPDATE ref_numbering SET next_serial = next_serial + 1 WHERE id = ?',
      [cfg.id]
    );

    await conn.commit();
    return refNo;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { generateRefNo };
