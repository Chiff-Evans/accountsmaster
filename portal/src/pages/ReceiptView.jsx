import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function fmt2(v) { return Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }); }

export default function ReceiptView() {
  const { receipt_no }   = useParams();
  const [searchParams]   = useSearchParams();
  const token            = searchParams.get('token');
  const [d, setD]        = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) { setError('Invalid receipt link.'); return; }
    axios.get(`/api/receipts/public/${receipt_no}?token=${token}`)
      .then(r => setD(r.data))
      .catch(err => setError(
        err.response?.status === 403
          ? 'Invalid receipt link.'
          : 'Receipt not found or has not been saved yet.'
      ));
  }, [receipt_no, token]);

  if (error) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={{ textAlign: 'center', color: '#ff4d4f', padding: 40 }}>{error}</p>
      </div>
    </div>
  );

  if (!d) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading receipt…</p>
      </div>
    </div>
  );

  const { receipt, order, items, business } = d;
  const savedAt = receipt.created_at ? new Date(receipt.created_at).toLocaleString() : '—';

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.businessName}>{business.business_name || 'Business'}</div>
          {business.location      && <div style={styles.sub}>{business.location}</div>}
          {receipt.payment_details  && <div style={styles.sub}>{receipt.payment_details}</div>}
          {receipt.customer_care_no && <div style={styles.sub}>Customer Care: {receipt.customer_care_no}</div>}
          {business.email           && <div style={styles.sub}>{business.email}</div>}
        </div>

        <div style={styles.divider} />

        {/* Receipt meta */}
        <div style={styles.metaGrid}>
          <Row label="Receipt No." value={receipt.receipt_no} bold />
          <Row label="Date"        value={savedAt} />
          {(receipt.printed_by_name || receipt.created_by_name) && (
            <Row label="Printed By" value={receipt.printed_by_name || receipt.created_by_name} />
          )}
          <Row label="Order No."   value={order.order_ref_no} />
        </div>

        <div style={styles.divider} />

        {/* Customer */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Customer</div>
          <div style={styles.customerName}>{order.shop_name || order.member_name}</div>
          {(order.shop_phone || order.member_phone) && <div style={styles.sub2}>{order.shop_phone || order.member_phone}</div>}
          {(order.shop_email || order.member_email) && <div style={styles.sub2}>{order.shop_email || order.member_email}</div>}
          {receipt.tax_no   && <div style={styles.sub2}>Tax No: {receipt.tax_no}</div>}
        </div>

        <div style={styles.divider} />

        {/* Items */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, textAlign: 'left' }}>Item</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Unit Price</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.rowEven : {}}>
                <td style={styles.td}>{it.item_name}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  {Number(it.quantity).toLocaleString(undefined, { maximumFractionDigits: 3 })}
                  {it.unit_name ? ` ${it.unit_name}` : ''}
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>{fmt2(it.unit_price)}</td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>{fmt2(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.divider} />

        {/* Totals */}
        <div style={styles.totals}>
          <TotalRow label={`${items.length} item${items.length !== 1 ? 's' : ''}`} value="" light />
          <TotalRow label="TOTAL" value={`KES ${fmt2(order.total_amount)}`} big />
          {Number(receipt.discount) > 0 && <>
            <TotalRow label="Discount" value={`-KES ${fmt2(receipt.discount)}`} discount />
            <TotalRow label="NET TOTAL"
              value={`KES ${fmt2(Math.max(0, Number(order.total_amount) - Number(receipt.discount)))}`}
              netTotal />
          </>}
          <TotalRow label={receipt.payment_mode || 'Cash'} value={fmt2(receipt.paid_amount)} />
          <TotalRow label="Paid Amount" value={fmt2(receipt.paid_amount)} />
          {receipt.payment_reference && <TotalRow label="Reference" value={receipt.payment_reference} />}
          {Number(receipt.balance) > 0 && <TotalRow label="Balance" value={fmt2(receipt.balance)} accent />}
        </div>

        {/* Other conditions */}
        {receipt.other_conditions && (
          <>
            <div style={styles.divider} />
            <div
              style={styles.conditions}
              dangerouslySetInnerHTML={{ __html: receipt.other_conditions }}
            />
          </>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.verified}>✓ Verified Receipt</div>
          <div style={styles.footerSub}>{receipt.receipt_no}</div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}>
      <span style={{ color: '#666' }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: bold ? '#111' : '#333' }}>{value}</span>
    </div>
  );
}

function TotalRow({ label, value, big, light, accent, discount, netTotal }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: big ? '8px 0' : '4px 0',
      borderTop:    (big || netTotal) ? '2px solid #111' : 'none',
      borderBottom: big ? '2px solid #111' : 'none',
      margin: big ? '4px 0' : 0,
    }}>
      <span style={{ fontSize: big || netTotal ? 16 : 13, fontWeight: big || netTotal ? 800 : 400, color: light ? '#888' : discount ? '#fa8c16' : '#333' }}>{label}</span>
      <span style={{ fontSize: big || netTotal ? 18 : 13, fontWeight: big || netTotal ? 800 : 600, color: accent ? '#ff4d4f' : discount ? '#fa8c16' : big || netTotal ? '#111' : '#333' }}>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  card: {
    background: '#fff', borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    width: '100%', maxWidth: 480, overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    color: '#fff', textAlign: 'center', padding: '28px 24px 20px',
  },
  businessName: { fontSize: 22, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  sub:          { fontSize: 13, opacity: 0.88, marginTop: 2 },
  sub2:         { fontSize: 13, color: '#555', marginTop: 2 },
  divider:      { borderTop: '1px solid #f0f0f0', margin: '0 20px' },
  metaGrid:     { padding: '14px 24px' },
  section:      { padding: '12px 24px' },
  sectionLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#0891b2', letterSpacing: 0.8, marginBottom: 4 },
  customerName: { fontSize: 15, fontWeight: 700, color: '#111' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:           { padding: '8px 12px', background: '#f8faff', color: '#555', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' },
  td:           { padding: '9px 12px', color: '#333', verticalAlign: 'middle' },
  rowEven:      { background: '#fafcff' },
  totals:       { padding: '12px 24px' },
  conditions:   { padding: '12px 24px', fontSize: 12, color: '#555', lineHeight: 1.6 },
  footer: {
    background: '#f8faff', textAlign: 'center',
    padding: '16px 24px', borderTop: '1px solid #e8efff',
  },
  verified:  { fontSize: 13, fontWeight: 700, color: '#52c41a', marginBottom: 2 },
  footerSub: { fontSize: 11, color: '#aaa' },
};
