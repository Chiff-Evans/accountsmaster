import { useState } from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Typography, Modal, Form, Input, message } from 'antd';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined,
  LogoutOutlined, KeyOutlined, MenuOutlined, CameraOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import LabelField from '../common/LabelField';
import ImageUploadField from '../common/ImageUploadField';
import NotificationBell from '../common/NotificationBell';
import api from '../../api';
import { hashPassword } from '../../utils/crypto';

const { Header } = Layout;

export default function AppHeader({ collapsed, onToggle, onMobileToggle }) {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [pwdOpen, setPwdOpen]       = useState(false);
  const [photoOpen, setPhotoOpen]   = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [preview, setPreview]       = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pwdForm] = Form.useForm();

  const menuItems = [
    { key: 'upload-photo', icon: <CameraOutlined />, label: 'Upload Photo' },
    { key: 'change-pwd',   icon: <KeyOutlined />,    label: 'Change Password' },
    { type: 'divider' },
    { key: 'logout',       icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  const handleMenuClick = async ({ key }) => {
    if (key === 'logout') { await logout(); navigate('/login'); }
    if (key === 'change-pwd') { pwdForm.resetFields(); setPwdOpen(true); }
    if (key === 'upload-photo') {
      setSelectedFile(null);
      setPreview(user?.profile_image || null);
      setPhotoOpen(true);
    }
  };

  const handleChangePwd = async () => {
    const vals = await pwdForm.validateFields();
    if (vals.new_password !== vals.confirm_password)
      return message.error('New passwords do not match');
    setPwdLoading(true);
    try {
      await api.post('/users/me/change-password', {
        current_password: await hashPassword(vals.current_password),
        new_password:     await hashPassword(vals.new_password),
      });
      message.success('Password changed successfully');
      setPwdOpen(false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwdLoading(false); }
  };

  const handleUpload = async () => {
    if (!selectedFile) return message.error('Please select an image first');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      const { data } = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ profile_image: data.profile_image });
      message.success('Profile photo updated');
      setPhotoOpen(false);
    } catch { message.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const avatarProps = user?.profile_image
    ? { src: user.profile_image }
    : { icon: <UserOutlined />, style: { backgroundColor: '#1677ff' } };

  const isDark = isMobile;

  return (
    <Header style={{
      padding: '0 16px',
      background: isDark ? '#001529' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.08)',
      position: 'fixed',
      top: 0,
      right: 0,
      left: isMobile ? 0 : (collapsed ? 80 : 220),
      zIndex: 99,
      transition: 'left 0.2s',
    }}>
      <Space size={8}>
        <Button
          type="text"
          icon={isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
          onClick={isMobile ? onMobileToggle : onToggle}
          style={{ fontSize: 16, color: isDark ? '#fff' : undefined }}
        />
        {isMobile && (
          <Typography.Text strong style={{ fontSize: 15, letterSpacing: 1, color: '#fff' }}>SM</Typography.Text>
        )}
      </Space>

      <Space size={20}>
        <NotificationBell dark={isDark} />
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', marginRight: 8 }}>
            <Typography.Text strong style={{ fontSize: isMobile ? 13 : 14, color: isDark ? '#fff' : undefined }}>
              {user?.firstname} {user?.lastname}
            </Typography.Text>
            <Avatar size={36} {...avatarProps} />
          </Space>
        </Dropdown>
      </Space>

      {/* Change Password */}
      <Modal
        title={<><KeyOutlined style={{ marginRight: 8, color: '#1677ff' }} />Change Password</>}
        open={pwdOpen}
        onOk={handleChangePwd}
        onCancel={() => setPwdOpen(false)}
        confirmLoading={pwdLoading}
        okText="Update Password"
        centered
        width={420}
      >
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 8 }}>
          <LabelField label="Current Password" required>
            <Form.Item name="current_password" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input.Password />
            </Form.Item>
          </LabelField>
          <LabelField label="New Password" required>
            <Form.Item name="new_password" rules={[{ required: true }, { min: 8, message: 'Minimum 8 characters' }]} style={{ marginBottom: 20 }}>
              <Input.Password />
            </Form.Item>
          </LabelField>
          <LabelField label="Confirm New Password" required>
            <Form.Item name="confirm_password" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
              <Input.Password />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>

      {/* Upload Photo */}
      <Modal
        title={<><CameraOutlined style={{ marginRight: 8, color: '#1677ff' }} />Profile Photo</>}
        open={photoOpen}
        onOk={handleUpload}
        okText="Upload"
        onCancel={() => setPhotoOpen(false)}
        confirmLoading={uploading}
        centered
        width={360}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 0' }}>
          <ImageUploadField
            value={preview}
            onChange={file => { setSelectedFile(file); setPreview(URL.createObjectURL(file)); }}
            onRemove={selectedFile ? () => { setSelectedFile(null); setPreview(user?.profile_image || null); } : null}
            shape="circle" size={100} maxSizeMB={2}
            hint="JPG, PNG or GIF · Max 2MB"
          />
        </div>
      </Modal>
    </Header>
  );
}
