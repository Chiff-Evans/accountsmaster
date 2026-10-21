import { useEffect, useState } from 'react';
import { Row, Col, Button, Spin, Typography, Empty, Progress, Alert } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, RightOutlined, AimOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TransactionCard from '../components/TransactionCard';
import api from '../api';
import { money, fmtDate } from '../utils/format';

export default function Dashboard() {
  const { member } = useAuth();
  const navigate    = useNavigate();
  const [statement, setStatement] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/statement'), api.get('/transactions', { params: { limit: 5 } })])
      .then(([s, t]) => { setStatement(s.data); setRecent(t.data.data); })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
  if (failed) return <div className="page-content"><Alert type="error" showIcon message="Couldn't load your account. Please try again shortly." /></div>;

  const target = statement?.target;
  const overpaid = statement?.overpayment > 0;

  return (
    <div className="page-content">
      {/* Greeting */}
      <div style={styles.greeting}>
        <div style={styles.greetingName}>Hello, {member?.member_name} 👋</div>
        <div style={styles.greetingSub}>
          {member?.position_name ? `${member.position_name} · ` : ''}{member?.member_ref_no || 'Member'}
        </div>
      </div>

      {/* Standing against the active target */}
      <div style={styles.targetCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <AimOutlined style={{ color: '#13c2c2', fontSize: 16 }} />
          <Typography.Text strong>My Target</Typography.Text>
          {target && <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>by {fmtDate(target.target_date)}</Typography.Text>}
        </div>

        {target ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800 }}>{money(statement.net)}</span>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>of {money(target.target_amount)}</span>
            </div>
            <Progress
              percent={statement.percent}
              showInfo={false}
              strokeColor={overpaid || statement.percent >= 100 ? '#16a34a' : '#13c2c2'}
              style={{ margin: '0 0 8px' }}
            />
            {overpaid ? (
              <div style={{ ...styles.pill, background: '#f0fdf4', color: '#16a34a' }}>
                Target met · Overpay: {money(statement.overpayment)}
              </div>
            ) : statement.balance > 0 ? (
              <div style={{ ...styles.pill, background: '#fff7ed', color: '#c2410c' }}>
                Outstanding Balance: {money(statement.balance)}
              </div>
            ) : (
              <div style={{ ...styles.pill, background: '#f0fdf4', color: '#16a34a' }}>Target met</div>
            )}
          </>
        ) : (
          <Typography.Text type="secondary">No target has been set yet. Your contributions are shown below.</Typography.Text>
        )}
      </div>

      {/* Totals */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Deposits',    value: statement.deposits,    icon: <ArrowDownOutlined />, color: '#16a34a' },
          { label: 'Total Withdrawals', value: statement.withdrawals, icon: <ArrowUpOutlined />,   color: '#ea580c' },
        ].map(s => (
          <Col span={12} key={s.label}>
            <div onClick={() => navigate('/transactions')} style={{ ...styles.stat, border: `1px solid ${s.color}28`, boxShadow: `0 2px 10px ${s.color}18` }}>
              <div style={{ height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
              <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ color: s.color, fontSize: 18 }}>{s.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#141414', textAlign: 'center' }}>{money(s.value)}</span>
                <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 500 }}>{s.label}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Recent transactions */}
      <div style={styles.sectionHeader}>
        <Typography.Text strong>Recent Transactions</Typography.Text>
        {recent.length > 0 && (
          <Button type="link" size="small" onClick={() => navigate('/transactions')} style={{ padding: 0 }}>
            View all <RightOutlined />
          </Button>
        )}
      </div>

      {recent.length === 0
        ? <Empty description="No transactions yet" style={{ margin: '20px 0' }} />
        : recent.map(t => <TransactionCard key={t.id} tx={t} />)}
    </div>
  );
}

const styles = {
  greeting: {
    background: 'linear-gradient(135deg, #14418f 0%, #0f7a6e 50%, #22c55e 100%)',
    borderRadius: 14, padding: '20px 18px', marginBottom: 16, color: '#fff',
  },
  greetingName: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  greetingSub:  { fontSize: 13, opacity: 0.85 },
  targetCard: {
    background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 16,
    border: '1px solid #13c2c228', boxShadow: '0 2px 10px #13c2c218',
  },
  pill: { borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 600, textAlign: 'center' },
  stat: { borderRadius: 14, cursor: 'pointer', background: '#fff', overflow: 'hidden' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
};
