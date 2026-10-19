import { useState, useEffect } from 'react';
import { App, Card, Form, Input, InputNumber, Select, Button, Modal, Typography, Tag } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useBrandAmbassadorAuth } from '../../contexts/BrandAmbassadorAuthContext';
import FieldWrapper from '../../components/FieldWrapper';
import brandAmbassadorApi from '../../brandAmbassadorApi';
import { hashPassword } from '../../utils/crypto';

const STATUS_COLOR = { active: 'green', inactive: 'default', locked: 'orange', suspended: 'red', revoked: 'volcano' };

export default function BrandAmbassadorProfile() {
  const { brandAmbassador, logout, refreshMe } = useBrandAmbassadorAuth();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [profileForm] = Form.useForm();
  const [pwdForm]     = Form.useForm();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd]         = useState(false);
  const [pwdOpen, setPwdOpen]             = useState(false);

  const [countries, setCountries]     = useState([]);
  const [counties, setCounties]       = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [areas, setAreas]             = useState([]);
  const [minViews, setMinViews]       = useState(0);

  useEffect(() => {
    brandAmbassadorApi.get('/parameters/values', { params: { parameter_id: 15 } }).then(r => setCountries(r.data));
    brandAmbassadorApi.get('/parameters/values', { params: { parameter_id: 16 } }).then(r => setCounties(r.data));
    brandAmbassadorApi.get('/parameters/values', { params: { parameter_id: 17 } }).then(r => setSubcounties(r.data));
    brandAmbassadorApi.get('/parameters/values', { params: { parameter_id: 18 } }).then(r => setAreas(r.data));
    brandAmbassadorApi.get('/config').then(r => setMinViews(Number(r.data.min_avg_status_views || 0)));
  }, []);

  const selectedCountyId = Form.useWatch('county_id', profileForm);
  const subcountiesForCounty = subcounties.filter(s => s.parent_value_id === selectedCountyId);

  useEffect(() => {
    if (brandAmbassador) profileForm.setFieldsValue({
      full_name: brandAmbassador.full_name, phone: brandAmbassador.phone,
      country_id: brandAmbassador.country_id, county_id: brandAmbassador.county_id, subcounty_id: brandAmbassador.subcounty_id,
      avg_status_views: brandAmbassador.avg_status_views, bio: brandAmbassador.bio,
      areas_to_advertise: brandAmbassador.areas_to_advertise || [],
    });
  }, [brandAmbassador]);

  const saveProfile = async () => {
    const vals = await profileForm.validateFields();
    setSavingProfile(true);
    try {
      await brandAmbassadorApi.put('/profile', vals);
      await refreshMe();
      message.success('Profile updated');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update');
    } finally { setSavingProfile(false); }
  };

  const changePassword = async () => {
    const vals = await pwdForm.validateFields();
    if (vals.new_password !== vals.confirm_password) return message.error('New passwords do not match');
    setSavingPwd(true);
    try {
      await brandAmbassadorApi.post('/auth/change-password', {
        current_password: await hashPassword(vals.current_password),
        new_password: await hashPassword(vals.new_password),
      });
      message.success('Password changed');
      pwdForm.resetFields();
      setPwdOpen(false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed');
    } finally { setSavingPwd(false); }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Log out?', content: 'You will be signed out of the brand ambassador portal.',
      okText: 'Log Out', okType: 'danger',
      onOk: () => { logout(); navigate('/brand-ambassador/login'); },
    });
  };

  return (
    <div className="page-content">
      <Typography.Title level={5} style={{ margin: '0 0 16px' }}>My Brand Ambassador Profile</Typography.Title>

      <Card style={styles.banner} styles={{ body: { padding: '14px 18px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <div style={styles.avatar}>{brandAmbassador?.full_name?.[0]}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', lineHeight: 1.3 }}>{brandAmbassador?.full_name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>@{brandAmbassador?.username}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Tag color="white" style={{ color: '#1677ff', fontWeight: 600, margin: 0 }}>{brandAmbassador?.brand_ambassador_ref_no}</Tag>
          <Tag color={STATUS_COLOR[brandAmbassador?.status] || 'green'} style={{ margin: 0 }}>{brandAmbassador?.status}</Tag>
        </div>
      </Card>

      <Card size="small" title={<><UserOutlined /> Personal Details</>} style={styles.card}>
        <Form form={profileForm} layout="vertical" style={{ marginTop: 8 }}>
          <FieldWrapper label="Full Name" required>
            <Form.Item name="full_name" rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
              <Input variant="borderless" style={{ padding: '2px 0' }} />
            </Form.Item>
          </FieldWrapper>

          <FieldWrapper label="Phone">
            <Form.Item name="phone" style={{ marginBottom: 0 }}>
              <Input variant="borderless" style={{ padding: '2px 0' }} />
            </Form.Item>
          </FieldWrapper>

          <FieldWrapper label="Country">
            <Form.Item name="country_id" style={{ marginBottom: 0 }}>
              <Select variant="borderless" allowClear showSearch optionFilterProp="children" style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
                {countries.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </FieldWrapper>

          <FieldWrapper label="County">
            <Form.Item name="county_id" style={{ marginBottom: 0 }}>
              <Select
                variant="borderless" allowClear showSearch optionFilterProp="children"
                style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}
                onChange={() => profileForm.setFieldValue('subcounty_id', undefined)}
              >
                {counties.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </FieldWrapper>

          <FieldWrapper label="Sub-County">
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

          <FieldWrapper label="Average Status Views" required>
            <Form.Item
              name="avg_status_views"
              rules={[
                { required: true, message: 'Required' },
                { type: 'number', min: minViews, message: `Must be at least ${minViews.toLocaleString()}` },
              ]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber variant="borderless" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </FieldWrapper>

          <FieldWrapper label="Area(s) to Advertise">
            <Form.Item name="areas_to_advertise" style={{ marginBottom: 0 }}>
              <Select mode="multiple" variant="borderless" allowClear showSearch optionFilterProp="children" style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
                {areas.map(a => <Select.Option key={a.id} value={a.id}>{a.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </FieldWrapper>

          <FieldWrapper label="Bio">
            <Form.Item name="bio" style={{ marginBottom: 0 }}>
              <Input.TextArea variant="borderless" rows={3} style={{ padding: '2px 0' }} />
            </Form.Item>
          </FieldWrapper>

          <Button type="primary" loading={savingProfile} onClick={saveProfile} block style={{ borderRadius: 8, marginTop: 12 }}>
            Save Changes
          </Button>
        </Form>
      </Card>

      <Card size="small" title={<><LockOutlined /> Security</>} style={styles.card}>
        <Button block onClick={() => setPwdOpen(true)} style={{ borderRadius: 8 }}>Change Password</Button>
      </Card>

      <Card size="small" style={styles.card}>
        <Button block danger icon={<LogoutOutlined />} onClick={handleLogout} style={{ borderRadius: 8 }}>
          Log Out
        </Button>
      </Card>

      <Modal title="Change Password" open={pwdOpen} onOk={changePassword} onCancel={() => setPwdOpen(false)} confirmLoading={savingPwd} centered>
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 16 }}>
          <FieldWrapper label="Current Password" required>
            <Form.Item name="current_password" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
              <Input.Password variant="borderless" autoComplete="current-password" style={{ padding: '2px 0' }} />
            </Form.Item>
          </FieldWrapper>
          <FieldWrapper label="New Password" required>
            <Form.Item name="new_password" rules={[{ required: true, min: 6, message: 'Min 6 characters' }]} style={{ marginBottom: 0 }}>
              <Input.Password variant="borderless" autoComplete="new-password" style={{ padding: '2px 0' }} />
            </Form.Item>
          </FieldWrapper>
          <FieldWrapper label="Confirm New Password" required>
            <Form.Item name="confirm_password" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
              <Input.Password variant="borderless" autoComplete="new-password" style={{ padding: '2px 0' }} />
            </Form.Item>
          </FieldWrapper>
        </Form>
      </Modal>
    </div>
  );
}

const styles = {
  banner: { borderRadius: 14, marginBottom: 16, background: 'linear-gradient(135deg, #14418f 0%, #0f7a6e 50%, #22c55e 100%)', border: 'none' },
  avatar: { width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' },
  card: { borderRadius: 12, marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
};
