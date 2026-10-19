import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Alert, Typography } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import FieldWrapper from '../../components/FieldWrapper';
import ImageUploadField from '../../components/common/ImageUploadField';
import EmailVerification from '../../components/common/EmailVerification';
import brandAmbassadorApi from '../../brandAmbassadorApi';
import { hashPassword } from '../../utils/crypto';

export default function BrandAmbassadorRegister() {
  const navigate = useNavigate();
  const [form]   = Form.useForm();
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [countries, setCountries]     = useState([]); // parameter_id 15
  const [counties, setCounties]       = useState([]); // parameter_id 16
  const [subcounties, setSubcounties] = useState([]); // parameter_id 17

  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [minViews, setMinViews] = useState(0);

  // Load each parameter's values and, if staff have marked one as default,
  // prefill it — the same behaviour the MIS forms give staff.
  const loadWithDefault = (parameterId, setList, fieldName) => {
    brandAmbassadorApi.get('/parameters/values', { params: { parameter_id: parameterId } }).then(r => {
      setList(r.data);
      const def = r.data.find(v => v.is_default);
      if (def) form.setFieldValue(fieldName, def.id);
    });
  };

  useEffect(() => {
    loadWithDefault(15, setCountries, 'country_id');
    loadWithDefault(16, setCounties, 'county_id');
    loadWithDefault(17, setSubcounties, 'subcounty_id');
    brandAmbassadorApi.get('/config').then(r => setMinViews(Number(r.data.min_avg_status_views || 0)));
  }, []);

  const selectedCountyId = Form.useWatch('county_id', form);
  const subcountiesForCounty = subcounties.filter(s => s.parent_value_id === selectedCountyId);

  const email = Form.useWatch('email', form);
  const [verifiedEmail, setVerifiedEmail] = useState(null);
  const emailVerified = !!email && verifiedEmail === email;

  const onFinish = async vals => {
    if (vals.password !== vals.confirm_password)
      return setError('Passwords do not match');
    if (!proofFile)
      return setError('Proof of Average Status Views is required');
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { confirm_password, areas_to_advertise, password, ...rest } = vals;
      const formData = new FormData();
      Object.entries(rest).forEach(([k, v]) => formData.append(k, v ?? ''));
      formData.append('areas_to_advertise', JSON.stringify(areas_to_advertise || []));
      formData.append('password', await hashPassword(password));
      formData.append('status_proof', proofFile);

      const { data } = await brandAmbassadorApi.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(data.message || 'Registration submitted. Awaiting approval.');
      form.resetFields();
      setProofFile(null); setProofPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>BB</div>
        <Typography.Title level={3} style={{ textAlign: 'center', margin: '0 0 4px', color: '#22c55e' }}>
          Become a Brand Ambassador
        </Typography.Title>
        <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 4 }}>
          Earn by advertising businesses on your Status
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
              <strong>Ambassador</strong> — The person who is paid a fee to post about a brand on their own status.
            </>
          }
        />

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        {success && <Alert message={success} type="success" showIcon style={{ marginBottom: 16 }} />}

        {!success && (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <div style={styles.grid}>
              <FieldWrapper label="Full Name" required style={{ marginBottom: 0 }}>
                <Form.Item name="full_name" rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
                  <Input variant="borderless" placeholder="Your full name" style={{ padding: '2px 0' }} />
                </Form.Item>
              </FieldWrapper>

              <FieldWrapper label="Phone" style={{ marginBottom: 0 }}>
                <Form.Item name="phone" style={{ marginBottom: 0 }}>
                  <Input variant="borderless" placeholder="e.g. 0712345678" style={{ padding: '2px 0' }} />
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

              <FieldWrapper label="Average Status Views" required style={{ marginBottom: 0 }}>
                <Form.Item
                  name="avg_status_views"
                  rules={[
                    { required: true, message: 'Required' },
                    { type: 'number', min: minViews, message: `Must be at least ${minViews.toLocaleString()}` },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber variant="borderless" min={0} style={{ width: '100%' }} placeholder={minViews > 0 ? `Min. ${minViews.toLocaleString()}` : ' 500'} />
                </Form.Item>
              </FieldWrapper>
            </div>
            {minViews > 0 && (
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: -8, marginBottom: 16 }}>
                We currently only accept brand ambassadors averaging at least {minViews.toLocaleString()} status views.
              </Typography.Text>
            )}

            <FieldWrapper label="Bio">
              <Form.Item name="bio" style={{ marginBottom: 0 }}>
                <Input.TextArea variant="borderless" rows={2} placeholder="Tell us about your audience" style={{ padding: '2px 0' }} />
              </Form.Item>
            </FieldWrapper>

            <FieldWrapper label="Proof of Average Status Views" required>
              <ImageUploadField
                value={proofPreview}
                onChange={file => { setProofFile(file); setProofPreview(URL.createObjectURL(file)); }}
                onRemove={proofFile ? () => { setProofFile(null); setProofPreview(null); } : null}
                size={140}
              />
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 6 }}>
                A screenshot of your status view count — required to verify your reach.
              </Typography.Text>
            </FieldWrapper>

            <div style={styles.grid}>
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
                <EmailVerification api={brandAmbassadorApi} email={email} verified={emailVerified} onVerified={setVerifiedEmail} />
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

            <Alert type="info" showIcon message="Your registration will be reviewed before you can log in." style={{ marginBottom: 16 }} />

            <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ height: 44, borderRadius: 8 }}>
              Submit Registration
            </Button>
          </Form>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Typography.Text type="secondary">Already have an account? </Typography.Text>
          <Link to="/brand-ambassador/login" style={{ fontWeight: 600, color: '#4c8dff' }}>Log In</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Typography.Text type="secondary">Are you a business? </Typography.Text>
          <Link to="/register" style={{ fontWeight: 600, color: '#4c8dff' }}>Register as an Advertiser</Link>
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
  card: { background: '#fff', borderRadius: 16, padding: '32px 28px', width: '100%', maxWidth: 700, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' },
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
