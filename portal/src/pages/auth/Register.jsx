import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Alert, Typography } from 'antd';
import { Link } from 'react-router-dom';
import FieldWrapper from '../../components/FieldWrapper';
import EmailVerification from '../../components/common/EmailVerification';
import api from '../../api';
import { CONFIG } from '../../config';
import { hashPassword } from '../../utils/crypto';
import { initials } from '../../utils/initials';

export default function Register() {
  const [form]    = Form.useForm();
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [genders, setGenders]   = useState([]); // parameter text_id 'genders'

  useEffect(() => {
    api.get('/parameters/values', { params: { text_id: 'genders' } }).then(r => {
      setGenders(r.data);
      const def = r.data.find(v => v.is_default);
      if (def) form.setFieldValue('gender_id', def.id);
    });
  }, []);

  const email = Form.useWatch('email', form);
  const [verifiedEmail, setVerifiedEmail] = useState(null);
  const emailVerified = !!email && verifiedEmail === email;

  const onFinish = async vals => {
    if (vals.password !== vals.confirm_password)
      return setError('Passwords do not match');
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { confirm_password, ...payload } = vals;
      payload.password = await hashPassword(payload.password);
      const { data } = await api.post('/auth/register', payload);
      setSuccess(data.message || 'Registration submitted. Awaiting approval.');
      form.resetFields();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>{initials(CONFIG.appName)}</div>
        <Typography.Title level={3} style={{ textAlign: 'center', margin: '0 0 4px', color: '#22c55e' }}>
          Register as a Member
        </Typography.Title>
        <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
          {CONFIG.appName} — Member Portal
        </Typography.Text>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        {success && <Alert message={success} type="success" showIcon style={{ marginBottom: 16 }} />}

        {!success && (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <div style={styles.grid}>
              <FieldWrapper label="Full Name" required style={{ marginBottom: 0 }}>
                <Form.Item name="member_name" rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
                  <Input variant="borderless" placeholder="Your full name" style={{ padding: '2px 0' }} />
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="ID Number" style={{ marginBottom: 0 }}>
                <Form.Item name="id_number" style={{ marginBottom: 0 }}>
                  <Input variant="borderless" placeholder="National ID / passport" style={{ padding: '2px 0' }} />
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="Phone No." style={{ marginBottom: 0 }}>
                <Form.Item name="phone" style={{ marginBottom: 0 }}>
                  <Input variant="borderless" placeholder="e.g. 0712345678" style={{ padding: '2px 0' }} />
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="Gender" style={{ marginBottom: 0 }}>
                <Form.Item name="gender_id" style={{ marginBottom: 0 }}>
                  <Select variant="borderless" placeholder="Select gender" allowClear style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
                    {genders.map(g => <Select.Option key={g.id} value={g.id}>{g.paramater_value}</Select.Option>)}
                  </Select>
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="Email" required style={{ marginBottom: 0 }}>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Enter a valid email' },
                    { validator: () => emailVerified ? Promise.resolve() : Promise.reject(new Error('Please verify your email address')) },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    variant="borderless"
                    placeholder="e.g. you@email.com"
                    style={{ padding: '2px 0' }}
                    onChange={e => {
                      if (!form.isFieldTouched('username') || !form.getFieldValue('username')) {
                        form.setFieldValue('username', e.target.value.split('@')[0]);
                      }
                    }}
                  />
                </Form.Item>
                <EmailVerification api={api} email={email} verified={emailVerified} onVerified={setVerifiedEmail} />
              </FieldWrapper>

              <FieldWrapper label="Username" required style={{ marginBottom: 0 }}>
                <Form.Item name="username" rules={[{ required: true, message: 'Username is required' }]} style={{ marginBottom: 0 }}>
                  <Input variant="borderless" placeholder="Choose a username" autoComplete="off" style={{ padding: '2px 0' }} />
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="Password" required style={{ marginBottom: 0 }}>
                <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Min 6 characters' }]} style={{ marginBottom: 0 }}>
                  <Input.Password variant="borderless" placeholder="Min 6 characters" autoComplete="new-password" style={{ padding: '2px 0' }} />
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="Confirm Password" required style={{ marginBottom: 0 }}>
                <Form.Item name="confirm_password" rules={[{ required: true, message: 'Confirm your password' }]} style={{ marginBottom: 0 }}>
                  <Input.Password variant="borderless" placeholder="Repeat password" autoComplete="new-password" style={{ padding: '2px 0' }} />
                </Form.Item>
              </FieldWrapper>
            </div>

            <Alert
              type="info"
              showIcon
              message="Your registration will be reviewed before you can log in."
              style={{ marginBottom: 16 }}
            />

            <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ height: 44, borderRadius: 8 }}>
              Submit Registration
            </Button>
          </Form>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Typography.Text type="secondary">Already have an account? </Typography.Text>
          <Link to="/login" style={{ fontWeight: 600, color: '#4c8dff' }}>Log In</Link>
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
    width: '100%', maxWidth: 700,
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  },
  logo: {
    width: 56, height: 56, borderRadius: 14, margin: '0 auto 20px',
    background: 'linear-gradient(135deg, #14418f, #22c55e)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 20, fontWeight: 800,
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 16, marginBottom: 16,
  },
};
