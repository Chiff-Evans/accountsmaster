import { useState, useEffect } from 'react';
import { App, Card, Form, Input, Select, Button, Modal, Typography, Tag, Switch } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FieldWrapper from '../components/FieldWrapper';
import api from '../api';
import { hashPassword } from '../utils/crypto';

const STATUS_COLOR = { active: 'green', locked: 'orange', suspended: 'red', revoked: 'volcano' };

export default function Profile() {
  const { member, logout, refreshMe, pushStatus, subscribe, unsubscribe } = useAuth();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [profileForm] = Form.useForm();
  const [pwdForm]     = Form.useForm();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd,     setSavingPwd]     = useState(false);
  const [pwdOpen,       setPwdOpen]       = useState(false);

  const [industries, setIndustries]   = useState([]); // parameter_id 14
  const [countries, setCountries]     = useState([]); // parameter_id 15
  const [counties, setCounties]       = useState([]); // parameter_id 16
  const [subcounties, setSubcounties] = useState([]); // parameter_id 17

  const displayName = member?.member_name || `${member?.firstname ?? ''} ${member?.lastname ?? ''}`.trim();

  useEffect(() => {
    api.get('/parameters/values', { params: { parameter_id: 14 } }).then(r => setIndustries(r.data));
    api.get('/parameters/values', { params: { parameter_id: 15 } }).then(r => setCountries(r.data));
    api.get('/parameters/values', { params: { parameter_id: 16 } }).then(r => setCounties(r.data));
    api.get('/parameters/values', { params: { parameter_id: 17 } }).then(r => setSubcounties(r.data));
  }, []);

  const selectedCountyId = Form.useWatch('county_id', profileForm);
  const subcountiesForCounty = subcounties.filter(s => s.parent_value_id === selectedCountyId);

  useEffect(() => {
    if (member) profileForm.setFieldsValue({
      member_name: member.member_name, industry_id: member.industry_id,
      country_id:  member.country_id,  county_id:   member.county_id, subcounty_id: member.subcounty_id,
      gender:      member.gender,      phone:       member.phone,    email:        member.email,
    });
  }, [member]);

  const saveProfile = async () => {
    const vals = await profileForm.validateFields();
    setSavingProfile(true);
    try {
      await api.put('/profile', vals);
      await refreshMe();
      message.success('Profile updated');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update');
    } finally { setSavingProfile(false); }
  };

  const changePassword = async () => {
    const vals = await pwdForm.validateFields();
    if (vals.new_password !== vals.confirm_password)
      return message.error('New passwords do not match');
    setSavingPwd(true);
    try {
      await api.post('/auth/change-password', {
        current_password: await hashPassword(vals.current_password),
        new_password:     await hashPassword(vals.new_password),
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
      title: 'Log out?', content: 'You will be signed out of the portal.',
      okText: 'Log Out', okType: 'danger',
      onOk: () => { logout(); navigate('/login'); },
    });
  };

  return (
    <div className="page-content">
      <Typography.Title level={5} style={{ margin: '0 0 16px' }}>My Profile</Typography.Title>

      {/* Identity banner — two lines: avatar+name on row 1, badges on row 2 */}
      <Card style={styles.banner} styles={{ body: { padding: '14px 18px' } }}>
        {/* Row 1: avatar + name + username */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <div style={styles.avatar}>{displayName?.[0]}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', lineHeight: 1.3 }}>
              {displayName}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              @{member?.username}
            </div>
          </div>
        </div>
        {/* Row 2: badges */}
        <div style={{ display: 'flex', gap: 6 }}>
          <Tag color="white" style={{ color: '#1677ff', fontWeight: 600, margin: 0 }}>{member?.member_ref_no}</Tag>
          <Tag color={STATUS_COLOR[member?.status] || 'green'} style={{ margin: 0 }}>{member?.status}</Tag>
        </div>
      </Card>

      {/* Edit profile */}
      <Card size="small" title={<><UserOutlined /> Personal Details</>} style={styles.card}>
        <Form form={profileForm} layout="vertical" style={{ marginTop: 8 }}>

          <FieldWrapper label="Member Name" required>
            <Form.Item name="member_name" rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
              <Input variant="borderless" style={{ padding: '2px 0' }} />
            </Form.Item>
          </FieldWrapper>

          <FieldWrapper label="Industry">
            <Form.Item name="industry_id" style={{ marginBottom: 0 }}>
              <Select variant="borderless" allowClear showSearch optionFilterProp="children" style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
                {industries.map(i => <Select.Option key={i.id} value={i.id}>{i.paramater_value}</Select.Option>)}
              </Select>
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

          <FieldWrapper label="Gender">
            <Form.Item name="gender" style={{ marginBottom: 0 }}>
              <Select variant="borderless" allowClear style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </FieldWrapper>

          <FieldWrapper label="Phone">
            <Form.Item name="phone" style={{ marginBottom: 0 }}>
              <Input variant="borderless" style={{ padding: '2px 0' }} />
            </Form.Item>
          </FieldWrapper>

          <FieldWrapper label="Email">
            <Form.Item name="email" rules={[{ type: 'email' }]} style={{ marginBottom: 0 }}>
              <Input variant="borderless" style={{ padding: '2px 0' }} />
            </Form.Item>
          </FieldWrapper>

          <Button type="primary" loading={savingProfile} onClick={saveProfile} block style={{ borderRadius: 8 }}>
            Save Changes
          </Button>
        </Form>
      </Card>

      {/* Security */}
      <Card size="small" title={<><LockOutlined /> Security</>} style={styles.card}>
        <Button block onClick={() => setPwdOpen(true)} style={{ borderRadius: 8 }}>Change Password</Button>
      </Card>

      {/* Notifications */}
      {'Notification' in window && (
        <Card size="small" title={<><BellOutlined /> Notifications</>} style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Order updates</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                {pushStatus === 'active'   && 'Push notifications are enabled'}
                {pushStatus === 'denied'   && 'Blocked — allow in browser settings'}
                {pushStatus === 'subscribing' && 'Enabling…'}
                {pushStatus === 'error'    && 'Failed — tap to retry'}
                {(pushStatus === 'idle' || pushStatus === 'unsupported') && 'Get notified when your order moves'}
              </div>
            </div>
            <Switch
              checked={pushStatus === 'active'}
              loading={pushStatus === 'subscribing'}
              disabled={pushStatus === 'denied' || pushStatus === 'unsupported'}
              onChange={on => {
                if (on) subscribe().then(() => message.success('Notifications enabled'));
                else    unsubscribe().then(() => message.info('Notifications disabled'));
              }}
            />
          </div>
        </Card>
      )}

      {/* Logout */}
      <Card size="small" style={styles.card}>
        <Button block danger icon={<LogoutOutlined />} onClick={handleLogout} style={{ borderRadius: 8 }}>
          Log Out
        </Button>
      </Card>

      {/* Change password modal */}
      <Modal
        title="Change Password" open={pwdOpen}
        onOk={changePassword} onCancel={() => setPwdOpen(false)}
        confirmLoading={savingPwd} centered
      >
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
  banner: {
    borderRadius: 14, marginBottom: 16,
    background: 'linear-gradient(135deg, #14418f 0%, #0f7a6e 50%, #22c55e 100%)',
    border: 'none',
  },
  avatar: {
    width: 52, height: 52, borderRadius: 14,
    background: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10,
  },
  card: { borderRadius: 12, marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
};
