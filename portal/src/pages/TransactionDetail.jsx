import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tag, Spin, Result, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api';
import { money, fmtDate, typeTone } from '../utils/format';

// Positive = credit towards the next deposit, negative = arrears to clear.
const creditText = v => {
  const n = Number(v || 0);
  if (Math.abs(n) < 0.005) return money(0);
  return n > 0 ? `${money(n)} credit` : `${money(-n)} arrears`;
};

// Cover in the rate's own units, e.g. "1 week · KES 1,000.00".
const coverText = tx => {
  const rate = Number(tx.rate_amount);
  const units = rate > 0 ? Math.round(Number(tx.cover_value) / rate * 100) / 100 : null;
  if (units == null || !tx.rate_unit) return money(tx.cover_value);
  if (units === 0) return 'None — not enough for a full ' + tx.rate_unit;
  return `${units} ${tx.rate_unit}${units === 1 ? '' : 's'} · ${money(tx.cover_value)}`;
};

/* Full details of one of the member's own transactions. */
export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // 'not_found' | 'failed'

  useEffect(() => {
    setLoading(true); setError(null);
    api.get(`/transactions/${id}`)
      .then(r => setTx(r.data))
      .catch(err => setError(err.response?.status === 404 ? 'not_found' : 'failed'))
      .finally(() => setLoading(false));
  }, [id]);

  // History back when they came from inside the portal, else the list.
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/transactions'));

  const backButton = (
    <Button type="text" icon={<ArrowLeftOutlined />} onClick={goBack} style={{ padding: '4px 0', marginBottom: 8 }}>
      Back
    </Button>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  if (error) {
    return (
      <div className="page-content">
        {backButton}
        <Result
          status={error === 'not_found' ? '404' : 'error'}
          title={error === 'not_found' ? 'Transaction not found' : "Couldn't load this transaction"}
          subTitle={error === 'not_found' ? 'It may have been removed, or it isn’t on your account.' : 'Please try again shortly.'}
          extra={<Button type="primary" onClick={() => navigate('/transactions')}>View all transactions</Button>}
        />
      </div>
    );
  }

  const tone = typeTone(tx.transaction_type_name);
  const days = tx.from_date && tx.to_date ? dayjs(tx.to_date).diff(dayjs(tx.from_date), 'day') + 1 : null;
  const edited = tx.updated_on && dayjs(tx.updated_on).diff(dayjs(tx.created_on), 'second') > 5;

  const rows = [
    ['File No.',         tx.file_no],
    ['Type',             tx.transaction_type_name],
    ['Transaction Date', fmtDate(tx.transaction_date)],
    ['From Date',        tx.from_date ? fmtDate(tx.from_date) : null],
    ['To Date',          tx.to_date ? fmtDate(tx.to_date) : null],
    ['Period',           days ? `${days} day${days === 1 ? '' : 's'}` : null],
    // Contribution credit: what didn't make a whole day carries to the next deposit.
    ['Brought Forward',  tx.credit_brought_forward != null ? creditText(tx.credit_brought_forward) : null],
    ['Cover',            tx.cover_value != null ? coverText(tx) : null],
    ['Carried Forward',  tx.credit_carried_forward != null ? creditText(tx.credit_carried_forward) : null],
    ['Recorded On',      tx.created_on ? dayjs(tx.created_on).format('D MMM YYYY, HH:mm') : null],
    ['Last Updated',     edited ? dayjs(tx.updated_on).format('D MMM YYYY, HH:mm') : null],
  ].filter(([, v]) => v);

  return (
    <div className="page-content">
      {backButton}

      {/* Amount header */}
      <div style={{ ...styles.hero, borderColor: `${tone.color}33`, boxShadow: `0 2px 12px ${tone.color}1f` }}>
        <Tag color={tone.tag} style={{ margin: '0 0 8px' }}>{tx.transaction_type_name || 'Transaction'}</Tag>
        <div style={{ fontSize: 28, fontWeight: 800, color: tone.color, lineHeight: 1.1 }}>
          {tone.sign}{money(tx.amount)}
        </div>
        <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 6 }}>{fmtDate(tx.transaction_date)}</div>
      </div>

      {/* Details */}
      <Card size="small" title="Transaction Details" style={styles.card}>
        {rows.map(([label, value]) => (
          <div key={label} style={styles.row}>
            <span style={{ color: '#8c8c8c' }}>{label}</span>
            <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </Card>

      <Card size="small" title="Other Details" style={styles.card}>
        {tx.other_details
          ? <div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{tx.other_details}</div>
          : <Typography.Text type="secondary">None</Typography.Text>}
      </Card>

      {/* <Typography.Text type="secondary" style={{ display: 'block', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
        If anything here looks wrong, please contact the office and quote {tx.file_no || 'this transaction'}.
      </Typography.Text> */}
    </div>
  );
}

const styles = {
  hero: {
    background: '#fff', borderRadius: 14, padding: '18px 16px', marginBottom: 14,
    border: '1px solid', textAlign: 'center',
  },
  card: { borderRadius: 12, marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
  row: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 },
};
