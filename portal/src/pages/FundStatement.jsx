import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tag, Spin, Result, Typography, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { money, fmtDate, typeTone } from '../utils/format';
import api from '../api';

/* Statement behind a Group Fund figure — /fund/interest or /fund/deductions.
   Shows the transactions of the account(s) marked as the interest /
   deductions account. Only reachable while staff share that figure. */
export default function FundStatement() {
  const { kind } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null); // 'hidden' | 'failed'

  useEffect(() => {
    setData(null); setError(null);
    api.get(`/fund-statement/${kind}`)
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.status === 403 || err.response?.status === 404 ? 'hidden' : 'failed'));
  }, [kind]);

  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/dashboard'));
  const backButton = (
    <Button type="text" icon={<ArrowLeftOutlined />} onClick={goBack} style={{ padding: '4px 0', marginBottom: 8 }}>
      Back
    </Button>
  );

  if (error) {
    return (
      <div className="page-content">
        {backButton}
        <Result
          status={error === 'hidden' ? 'info' : 'error'}
          title={error === 'hidden' ? 'Statement not available' : "Couldn't load this statement"}
          subTitle={error === 'hidden' ? 'This statement is not currently shared with members.' : 'Please try again shortly.'}
          extra={<Button type="primary" onClick={() => navigate('/dashboard')}>Back to Home</Button>}
        />
      </div>
    );
  }
  if (!data) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  // The headline matches the Group Fund figure: deposits for interest,
  // withdrawals for deductions.
  const isInterest = kind === 'interest';
  const headline = isInterest ? data.totals.deposits : data.totals.withdrawals;

  return (
    <div className="page-content">
      {backButton}
      <Typography.Title level={5} style={{ margin: '0 0 12px' }}>{data.title} Statement</Typography.Title>

      <div style={{ ...styles.hero, borderColor: isInterest ? '#16a34a33' : '#c2410c33' }}>
        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{isInterest ? 'Total interest earned' : 'Total deductions / taxes'}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: isInterest ? '#16a34a' : '#c2410c' }}>{money(headline)}</div>
        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{data.totals.count} transaction{data.totals.count === 1 ? '' : 's'}</div>
      </div>

      {data.rows.length === 0 && <Empty description="No transactions yet" style={{ margin: '30px 0' }} />}

      {data.rows.map((t, i) => {
        const tone = typeTone(t.transaction_type_name);
        const period = t.from_date || t.to_date ? `${fmtDate(t.from_date)} – ${fmtDate(t.to_date)}` : null;
        return (
          <Card key={`${t.file_no}-${i}`} size="small" style={styles.card} styles={{ body: { padding: '12px 14px' } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <Tag color={tone.tag} style={{ margin: 0 }}>{t.transaction_type_name || 'Transaction'}</Tag>
                  {t.file_no && <span style={{ fontSize: 11, color: '#8c8c8c' }}>{t.file_no}</span>}
                </div>
                <div style={{ fontSize: 12, color: '#595959' }}>{fmtDate(t.transaction_date)}</div>
                {period && <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>For {period}</div>}
                {t.other_details && <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4, whiteSpace: 'pre-wrap' }}>{t.other_details}</div>}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: tone.color, whiteSpace: 'nowrap' }}>
                {tone.sign}{money(t.amount)}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

const styles = {
  hero: { background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 14, border: '1px solid', textAlign: 'center' },
  card: { borderRadius: 10, marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
};
