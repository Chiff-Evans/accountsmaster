import { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FieldWrapper from '../../components/FieldWrapper';
import api from '../../api';
import { CONFIG } from '../../config';
import { hashPassword } from '../../utils/crypto';
import { initials } from '../../utils/initials';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
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
      login(data.token, data.member);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>{initials(CONFIG.appName)}</div>
        <Typography.Title level={3} style={{ textAlign: 'center', margin: '0 0 4px', color: '#22c55e' }}>
          {CONFIG.appName}
        </Typography.Title>
        <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          Member Portal
        </Typography.Text>

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
          <Typography.Text type="secondary">Not registered yet? </Typography.Text>
          <Link to="/register" style={{ fontWeight: 600, color: '#4c8dff' }}>Register as a Member</Link>
        </div>
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
