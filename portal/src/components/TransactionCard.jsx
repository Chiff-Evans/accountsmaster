import { Card, Tag } from 'antd';
import { money, fmtDate, typeTone } from '../utils/format';

/* One of the member's transactions, as a compact card (Home + Transactions). */
export default function TransactionCard({ tx }) {
  const tone = typeTone(tx.transaction_type_name);
  const period = tx.from_date || tx.to_date
    ? `${fmtDate(tx.from_date)} – ${fmtDate(tx.to_date)}`
    : null;

  return (
    <Card size="small" style={styles.card} styles={{ body: { padding: '12px 14px' } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <Tag color={tone.tag} style={{ margin: 0 }}>{tx.transaction_type_name || 'Transaction'}</Tag>
            {tx.file_no && <span style={{ fontSize: 11, color: '#8c8c8c' }}>{tx.file_no}</span>}
          </div>
          <div style={{ fontSize: 12, color: '#595959' }}>{fmtDate(tx.transaction_date)}</div>
          {period && <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>For {period}</div>}
          {tx.other_details && <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{tx.other_details}</div>}
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, color: tone.color, whiteSpace: 'nowrap' }}>
          {tone.sign}{money(tx.amount)}
        </div>
      </div>
    </Card>
  );
}

const styles = {
  card: { borderRadius: 10, marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
};
