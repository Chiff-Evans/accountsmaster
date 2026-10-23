import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LabelField from '../../components/common/LabelField';
import InstallButton from '../../components/common/InstallButton';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ username, password }) => {
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #14418f 0%, #0f7a6e 50%, #22c55e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <Card
        style={{ width: '100%', maxWidth: 400, borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        variant="borderless"
      >
        <Space direction="vertical" style={{ width: '100%', textAlign: 'center', marginBottom: 28 }}>
          <Typography.Title level={3} style={{ margin: 0, color: '#22c55e', letterSpacing: 0.5 }}>Accounts Master</Typography.Title>
          <Typography.Text type="secondary">Information Management System</Typography.Text>
        </Space>

        {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} showIcon />}

        <Form layout="vertical" onFinish={onFinish}>
          <LabelField label="Username or Email" required>
            <Form.Item name="username" rules={[{ required: true, message: 'Enter username' }]} style={{ marginBottom: 20 }}>
              <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} size="large" />
            </Form.Item>
          </LabelField>

          <LabelField label="Password" required>
            <Form.Item name="password" rules={[{ required: true, message: 'Enter password' }]} style={{ marginBottom: 24 }}>
              <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} size="large" />
            </Form.Item>
          </LabelField>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {/* Only shows for people who haven't installed the app */}
        <div style={{ marginTop: 4, marginBottom: 8 }}>
          <InstallButton block />
        </div>

        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        </Typography.Text>
      </Card>
    </div>
  );
}
