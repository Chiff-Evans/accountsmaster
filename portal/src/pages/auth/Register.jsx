import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Alert, Typography } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import FieldWrapper from '../../components/FieldWrapper';
import EmailVerification from '../../components/common/EmailVerification';
import api from '../../api';
import { hashPassword } from '../../utils/crypto';

export default function Register() {
  const navigate  = useNavigate();
  const [form]    = Form.useForm();
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const [memberTypes, setMemberTypes] = useState([]); // parameter_id 12
  const [industries, setIndustries]   = useState([]); // parameter_id 14
  const [countries, setCountries]     = useState([]); // parameter_id 15
  const [counties, setCounties]       = useState([]); // parameter_id 16
  const [subcounties, setSubcounties] = useState([]); // parameter_id 17

  // Load each parameter's values and, if staff have marked one as default,
  // prefill it — the same behaviour the MIS forms give staff.
  const loadWithDefault = (parameterId, setList, fieldName) => {
    api.get('/parameters/values', { params: { parameter_id: parameterId } }).then(r => {
      setList(r.data);
      const def = r.data.find(v => v.is_default);
      if (def) form.setFieldValue(fieldName, def.id);
    });
  };

  useEffect(() => {
    loadWithDefault(12, setMemberTypes, 'member_type_id');
    loadWithDefault(14, setIndustries, 'industry_id');
    loadWithDefault(15, setCountries, 'country_id');
    loadWithDefault(16, setCounties, 'county_id');
    loadWithDefault(17, setSubcounties, 'subcounty_id');
  }, []);

  const selectedCountyId = Form.useWatch('county_id', form);
  const subcountiesForCounty = subcounties.filter(s => s.parent_value_id === selectedCountyId);

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
        <div style={styles.logo}>BB</div>
        <Typography.Title level={3} style={{ textAlign: 'center', margin: '0 0 4px', color: '#22c55e' }}>
          Register as a Member
        </Typography.Title>
        <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 4 }}>
          Accounts Master — Advertise on Status
        </Typography.Text>
        <Typography.Text style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
          <Link to="/solutions" style={{ fontSize: 12, color: '#4c8dff' }}>How does this work?</Link>
        </Typography.Text>

        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message=""
          description={
            <>
              <strong>Member</strong> — A business or individual that require advertisement services.
            </>
          }
        />

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        {success && <Alert message={success} type="success" showIcon style={{ marginBottom: 16 }} />}

        {!success && (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <FieldWrapper label="Member Name" required>
              <Form.Item name="member_name" rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
                <Input variant="borderless" placeholder="Company or your name" style={{ padding: '2px 0' }} />
              </Form.Item>
            </FieldWrapper>

            <div style={styles.grid}>
              <FieldWrapper label="Company or Individual" style={{ marginBottom: 0 }}>
                <Form.Item name="member_type_id" style={{ marginBottom: 0 }}>
                  <Select variant="borderless" placeholder="Select type" allowClear style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
                    {memberTypes.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
                  </Select>
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="Industry" style={{ marginBottom: 0 }}>
                <Form.Item name="industry_id" style={{ marginBottom: 0 }}>
                  <Select variant="borderless" placeholder="Select industry" allowClear showSearch optionFilterProp="children" style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
                    {industries.map(i => <Select.Option key={i.id} value={i.id}>{i.paramater_value}</Select.Option>)}
                  </Select>
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="Country" style={{ marginBottom: 0 }}>
                <Form.Item name="country_id" style={{ marginBottom: 0 }}>
                  <Select variant="borderless" placeholder="Select country" allowClear showSearch optionFilterProp="children" style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
                    {countries.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
                  </Select>
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="County" style={{ marginBottom: 0 }}>
                <Form.Item name="county_id" style={{ marginBottom: 0 }}>
                  <Select
                    variant="borderless" placeholder="Select county" allowClear showSearch optionFilterProp="children"
                    style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}
                    onChange={() => form.setFieldValue('subcounty_id', undefined)}
                  >
                    {counties.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
                  </Select>
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="Sub-County" style={{ marginBottom: 0 }}>
                <Form.Item name="subcounty_id" style={{ marginBottom: 0 }}>
                  <Select
                    variant="borderless" allowClear showSearch optionFilterProp="children"
                    style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}
                    disabled={!selectedCountyId}
                    placeholder={selectedCountyId ? 'Select sub-county' : 'Select a county first'}
                  >
                    {subcountiesForCounty.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
                  </Select>
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="Phone" style={{ marginBottom: 0 }}>
                <Form.Item name="phone" style={{ marginBottom: 0 }}>
                  <Input variant="borderless" placeholder="e.g. 0712345678" style={{ padding: '2px 0' }} />
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
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Typography.Text type="secondary">Do you want to become an ambassador? </Typography.Text>
          <Link to="/brand-ambassador/register" style={{ fontWeight: 600, color: '#4c8dff' }}>Register as an Ambassador</Link>
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
