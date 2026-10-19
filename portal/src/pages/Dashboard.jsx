import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Button, Spin, Typography, Empty } from 'antd';
import {
  SoundOutlined, PlusOutlined,
  RightOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function Dashboard() {
  const { member } = useAuth();
  const navigate    = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loyaltyActive, setLoyaltyActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const displayName = member?.member_name || `${member?.firstname ?? ''} ${member?.lastname ?? ''}`.trim();

  useEffect(() => {
    Promise.all([api.get('/campaigns'), api.get('/loyalty-status')])
      .then(([c, l]) => { setCampaigns(c.data); setLoyaltyActive(!!l.data?.is_active); })
      .finally(() => setLoading(false));
  }, []);

  const recentCampaigns = campaigns.slice(0, 3);
  const activeCampaigns = campaigns.filter(c => !['Completed', 'Rejected', 'Cancelled'].includes(c.stage_name)).length;

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <div className="page-content">
      {/* Greeting */}
      <div style={styles.greeting}>
        <div>
          <div style={styles.greetingName}>Hello, {displayName} 👋</div>
          <div style={styles.greetingSub}>Welcome again!</div>
        </div>
      </div>

      {/* Quick stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Campaigns', value: campaigns.length, icon: <SoundOutlined />, color: '#1677ff' },
          { label: 'Active',    value: activeCampaigns,   icon: <SoundOutlined />, color: '#52c41a' },
        ].map(s => (
          <Col span={12} key={s.label}>
            <div
              onClick={() => navigate('/campaigns')}
              style={{
                borderRadius: 14, cursor: 'pointer',
                background: '#fff',
                border: `1px solid ${s.color}28`,
                boxShadow: `0 2px 10px ${s.color}18`,
                overflow: 'hidden',
              }}
            >
              {/* Coloured top bar */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
              <div style={{
                padding: '14px 8px 12px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8,
              }}>
                {/* Icon badge */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `linear-gradient(135deg, ${s.color}22, ${s.color}10)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: s.color, fontSize: 18 }}>{s.icon}</span>
                </div>
                {/* Value */}
                <span style={{ fontSize: 24, fontWeight: 800, color: '#141414', lineHeight: 1 }}>
                  {s.value}
                </span>
                {/* Label */}
                <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 500 }}>{s.label}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Loyalty points card */}
      {loyaltyActive && member?.loyalty_points > 0 && (
        <div style={styles.loyaltyCard}>
          <div style={styles.loyaltyLeft}>
            <TrophyOutlined style={{ fontSize: 28, color: '#faad14' }} />
            <div>
              <div style={styles.loyaltyLabel}>Your Loyalty Points</div>
              <div style={styles.loyaltyPoints}>{(member.loyalty_points || 0).toLocaleString()} pts</div>
            </div>
          </div>
          <div style={styles.loyaltyBadge}>★ Active</div>
        </div>
      )}

      {/* Quick actions */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Button type="primary" block icon={<PlusOutlined />} size="large"
          style={{ borderRadius: 10, height: 48 }} onClick={() => navigate('/campaigns')}>
          New Campaign
        </Button>
      </Row>

      {/* Recent campaigns */}
      <div style={styles.sectionHeader}>
        <Typography.Text strong>Recent Campaigns</Typography.Text>
        <Button type="link" size="small" onClick={() => navigate('/campaigns')} style={{ padding: 0 }}>
          View all <RightOutlined />
        </Button>
      </div>

      {recentCampaigns.length === 0 ? (
        <Empty description="No campaigns yet" style={{ margin: '20px 0' }}>
          <Button type="primary" onClick={() => navigate('/campaigns')}>Create Your First Campaign</Button>
        </Empty>
      ) : (
        recentCampaigns.map(c => (
          <Card
            key={c.id}
            size="small"
            style={styles.campaignCard}
            styles={{ body: { padding: '12px 14px' } }}
            onClick={() => navigate('/campaigns')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{c.campaign_title}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{c.campaign_type_name || '—'}</div>
              </div>
              <Tag color={c.stage_color || 'default'}>{c.stage_name || 'Draft'}</Tag>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

const styles = {
  greeting: {
    background: 'linear-gradient(135deg, #14418f 0%, #0f7a6e 50%, #22c55e 100%)',
    borderRadius: 14, padding: '20px 18px', marginBottom: 20, color: '#fff',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  greetingName: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  greetingSub:  { fontSize: 13, opacity: 0.85 },
  loyaltyCard: {
    background: 'linear-gradient(135deg, #fffbe6 0%, #fff7cc 100%)',
    border: '1px solid #ffe58f',
    borderRadius: 14, padding: '16px 18px', marginBottom: 16,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 2px 8px rgba(250,173,20,0.15)',
  },
  loyaltyLeft:   { display: 'flex', alignItems: 'center', gap: 14 },
  loyaltyLabel:  { fontSize: 12, color: '#ad6800', fontWeight: 500, marginBottom: 2 },
  loyaltyPoints: { fontSize: 22, fontWeight: 800, color: '#d46b08', lineHeight: 1 },
  loyaltyBadge:  {
    background: '#faad14', color: '#fff', borderRadius: 20,
    padding: '3px 12px', fontSize: 12, fontWeight: 700,
  },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  campaignCard: {
    borderRadius: 10, marginBottom: 10, cursor: 'pointer',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
  },
};
