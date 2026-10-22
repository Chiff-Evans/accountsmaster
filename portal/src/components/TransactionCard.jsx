import { Card, Tag } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { money, fmtDate, typeTone } from '../utils/format';

/* One of the member's transactions, as a compact card (Home + Transactions).
   Tapping it opens the full details page. `tx.id` is the hashed id the
   portal API hands out (never the raw database id), so the URL is too. */
export default function TransactionCard({ tx }) {
  const navigate = useNavigate();
  const tone = typeTone(tx.transaction_type_name);
  const period = tx.from_date || tx.to_date
    ? `${fmtDate(tx.from_date)} – ${fmtDate(tx.to_date)}`
    : null;

  return (
    <Card
      size="small"
      hoverable
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/transactions/${tx.id}`)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/transactions/${tx.id}`); } }}
      style={styles.card}
      styles={{ body: { padding: '12px 14px' } }}
    >
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: tone.color, whiteSpace: 'nowrap' }}>
            {tone.sign}{money(tx.amount)}
          </div>
          <RightOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />
        </div>
      </div>
    </Card>
  );
}

const styles = {
  card: { borderRadius: 10, marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', cursor: 'pointer' },
};
