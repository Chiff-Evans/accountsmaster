import { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Checkbox, Tabs } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined, SoundOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBrandAmbassadorAuth } from '../../contexts/BrandAmbassadorAuthContext';
import FieldWrapper from '../../components/FieldWrapper';
import api from '../../api';
import brandAmbassadorApi from '../../brandAmbassadorApi';
import { hashPassword } from '../../utils/crypto';

function AdvertiserLoginForm() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async vals => {
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        username:    vals.username,
        password:    await hashPassword(vals.password),
        remember_me: !!vals.remember_me,
      });
      login(data.token, data.advertiser);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form layout="vertical" onFinish={onFinish} initialValues={{ remember_me: true }}>
        <FieldWrapper label="Username" required>
          <Form.Item name="username" rules={[{ required: true, message: 'Enter username' }]} style={{ marginBottom: 0 }}>
            <Input
              prefix={<UserOutlined style={{ color: '#bbb', marginRight: 4 }} />}
              variant="borderless" placeholder="Your username"
              autoComplete="username" style={{ padding: '2px 0' }}
            />
          </Form.Item>
        </FieldWrapper>

        <FieldWrapper label="Password" required>
          <Form.Item name="password" rules={[{ required: true, message: 'Enter password' }]} style={{ marginBottom: 0 }}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bbb', marginRight: 4 }} />}
              variant="borderless" placeholder="Your password"
              autoComplete="current-password" style={{ padding: '2px 0' }}
            />
          </Form.Item>
        </FieldWrapper>

        <Form.Item name="remember_me" valuePropName="checked" style={{ marginBottom: 16 }}>
          <Checkbox>
            <span style={{ fontSize: 13, color: '#555' }}>Keep me logged in for 30 days</span>
          </Checkbox>
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ height: 44, borderRadius: 8 }}>
          Log In
        </Button>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Typography.Text type="secondary">Don't have an account? </Typography.Text>
        <Link to="/register" style={{ fontWeight: 600, color: '#4c8dff' }}>Register as an Advertiser</Link>
      </div>
    </>
  );
}

function BrandAmbassadorLoginForm() {
  const { login } = useBrandAmbassadorAuth();
  const navigate   = useNavigate();
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async vals => {
    setError(''); setLoading(true);
    try {
      const { data } = await brandAmbassadorApi.post('/auth/login', {
        username:    vals.username,
        password:    await hashPassword(vals.password),
        remember_me: !!vals.remember_me,
      });
      login(data.token, data.brand_ambassador);
      navigate('/brand-ambassador/campaigns', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form layout="vertical" onFinish={onFinish} initialValues={{ remember_me: true }}>
        <FieldWrapper label="Username" required>
          <Form.Item name="username" rules={[{ required: true, message: 'Enter username' }]} style={{ marginBottom: 0 }}>
            <Input
              prefix={<UserOutlined style={{ color: '#bbb', marginRight: 4 }} />}
              variant="borderless" placeholder="Your username"
              autoComplete="username" style={{ padding: '2px 0' }}
            />
          </Form.Item>
        </FieldWrapper>

        <FieldWrapper label="Password" required>
          <Form.Item name="password" rules={[{ required: true, message: 'Enter password' }]} style={{ marginBottom: 0 }}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bbb', marginRight: 4 }} />}
              variant="borderless" placeholder="Your password"
              autoComplete="current-password" style={{ padding: '2px 0' }}
            />
          </Form.Item>
        </FieldWrapper>

        <Form.Item name="remember_me" valuePropName="checked" style={{ marginBottom: 16 }}>
          <Checkbox>
            <span style={{ fontSize: 13, color: '#555' }}>Keep me logged in for 30 days</span>
          </Checkbox>
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ height: 44, borderRadius: 8 }}>
          Log In
        </Button>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Typography.Text type="secondary">Don't have an account? </Typography.Text>
        <Link to="/brand-ambassador/register" style={{ fontWeight: 600, color: '#4c8dff' }}>Register as an Ambassador</Link>
      </div>
    </>
  );
}

export default function Login() {
  const navigate = useNavigate();
  // Brand ambassadors are the app's primary day-to-day users (daily proof
  // submissions), so the login page defaults to that tab regardless of
  // entry route — business staff just switch tabs manually.
  const [tab, setTab] = useState('brand_ambassador');

  const handleTabChange = key => {
    setTab(key);
    navigate(key === 'brand_ambassador' ? '/brand-ambassador/login' : '/login', { replace: true });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>BB</div>
        <Typography.Title level={3} style={{ textAlign: 'center', margin: '0 0 4px', color: '#22c55e' }}>
          Accounts Master
        </Typography.Title>

        <Tabs
          centered
          activeKey={tab}
          onChange={handleTabChange}
          items={[
            {
              key: 'brand_ambassador',
              label: <span><SoundOutlined /> Ambassador</span>,
              children: <BrandAmbassadorLoginForm />,
            },
            {
              key: 'advertiser',
              label: <span><BankOutlined /> Advertiser</span>,
              children: <AdvertiserLoginForm />,
            },
          ]}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: 'linear-gradient(135deg, #14418f 0%, #0f7a6e 50%, #22c55e 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  card: {
    background: '#fff', borderRadius: 16, padding: '32px 28px',
    width: '100%', maxWidth: 400,
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  },
  logo: {
    width: 56, height: 56, borderRadius: 14, margin: '0 auto 20px',
    background: 'linear-gradient(135deg, #14418f, #22c55e)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 20, fontWeight: 800,
  },
};
