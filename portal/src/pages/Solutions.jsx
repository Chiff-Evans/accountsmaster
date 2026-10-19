import { useEffect, useState } from 'react';
import { Typography, Button, Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';
import {
  RocketOutlined, TeamOutlined, LineChartOutlined, WhatsAppOutlined,
  ShopOutlined, UserOutlined,
} from '@ant-design/icons';
import api from '../api';

const STEPS = [
  {
    icon: <ShopOutlined />,
    title: 'Advertisers Register and Submit a Campaign',
    body: 'Tell us about your brand and what you want advertised — a product launch, an event or anything worth talking about ataffordable rates.',
  },
  {
    icon: <TeamOutlined />,
    title: 'We Match and Assign Campaigns to Ambassadors.',
    body: 'Real people with real social audiences get assigned to campaigns and post brands on their own status, daily. They submit view counts with proof of posting screenshots and we verify reach before paying them for their work.',
  },
  {
    icon: <LineChartOutlined />,
    title: 'Payments',
    body: 'Advertisers pay before the campaign starts. Ambassadors get paid after the campaign ends and we verify reach. We handle all payments and payouts.',
  },
];

export default function Solutions() {
  const [businessName, setBusinessName] = useState('Accounts Master');

  useEffect(() => {
    api.get('/business-info')
      .then(({ data }) => { if (data?.business_name) setBusinessName(data.business_name); })
      .catch(() => {});
  }, []);

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <Typography.Title level={2} style={{ color: '#fff', textAlign: 'center', margin: '0 0 8px' }}>
          Advertise Where Conversations Already Happen
        </Typography.Title>
        <Typography.Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, textAlign: 'center', display: 'block', maxWidth: 560 }}>
          {businessName} connects businesses and brands with everyday people willing to advertise
          them on their own Status — turning personal reach into paid-for promotion.
        </Typography.Text>
        <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register">
            <Button type="primary" size="large" icon={<RocketOutlined />} style={{ height: 46, borderRadius: 10, fontWeight: 600 }}>
              Register as an Advertiser
            </Button>
          </Link>
          <Link to="/brand-ambassador/register">
            <Button size="large" icon={<WhatsAppOutlined />} style={{ height: 46, borderRadius: 10, fontWeight: 600 }}>
              Become an Ambassador
            </Button>
          </Link>
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {/* Who's who */}
        <Row gutter={[20, 20]} style={{ marginBottom: 40 }}>
          <Col xs={24} md={12}>
            <Card style={styles.roleCard} styles={{ body: { padding: 24 } }}>
              <Typography.Title level={4} style={{ margin: '12px 0 6px', textAlign: 'center' }}>Advertiser</Typography.Title>
              <Typography.Text type="secondary">
                A business, brand, or individual who wants their product, service, or message put in front
                of real people. You submit campaigns, we quote a fee, and we handle getting it posted.
              </Typography.Text>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={styles.roleCard} styles={{ body: { padding: 24 } }}>
              <Typography.Title level={4} style={{ margin: '12px 0 6px', textAlign: 'center' }}>Brand Ambassador</Typography.Title>
              <Typography.Text type="secondary">
                Someone with an active status audience who gets paid to post about a brand
                on an advertiser's behalf — turning their daily status updates into rewards.
              </Typography.Text>
            </Card>
          </Col>
        </Row>

        {/* How it works */}
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 28 }}>How It Works</Typography.Title>
        <Row gutter={[20, 20]} style={{ marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <Col xs={24} md={8} key={i}>
              <Card style={{ ...styles.roleCard, height: '100%' }} styles={{ body: { padding: 24, textAlign: 'center' } }}>
                <div style={{ ...styles.roleIcon, margin: '0 auto 14px', background: '#f0f4ff', color: '#14418f' }}>{s.icon}</div>
                <Typography.Title level={5} style={{ margin: '0 0 8px' }}>{s.title}</Typography.Title>
                <Typography.Text type="secondary">{s.body}</Typography.Text>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <Typography.Text type="secondary">Already have an account? </Typography.Text>
          <Link to="/login" style={{ fontWeight: 600, color: '#4c8dff' }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f4f6fb' },
  hero: {
    background: 'linear-gradient(135deg, #14418f 0%, #0f7a6e 55%, #22c55e 100%)',
    padding: '56px 16px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  logo: {
    width: 56, height: 56, borderRadius: 14, marginBottom: 20,
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 20, fontWeight: 800,
  },
  body: { maxWidth: 900, margin: '0 auto', padding: '40px 16px 56px' },
  roleCard: { borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  roleIcon: {
    width: 44, height: 44, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
  },
};
