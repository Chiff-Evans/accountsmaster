import { useState, useEffect, useCallback } from 'react';
import {
  Modal, Form, Input, Select, Tag, Button, Dropdown,
  message, Typography, Popover, Checkbox,
} from 'antd';
import {
  LockOutlined, UnlockOutlined, StopOutlined,
  MoreOutlined, KeyOutlined, TableOutlined,
} from '@ant-design/icons';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';
import { hashPassword } from '../../utils/crypto';

const STATUS_COLOR = { active: 'green', locked: 'orange', suspended: 'red', revoked: 'default' };

export default function Users() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [hiddenCols, setHiddenCols] = useState(new Set(['email','roles']));
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/users', { params: { page, limit, search } });
      setData(r.data.data); setTotal(r.data.total);
    } finally { setLoading(false); }
  }, [page, limit, search]);

  useEffect(() => {
    load();
    api.get('/roles').then(r => setRoles(r.data));
  }, [load]);

  const onSave = async () => {
    const vals = await form.validateFields();
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, vals);
      } else {
        const payload = { ...vals };
        if (payload.password) payload.password = await hashPassword(payload.password);
        await api.post('/users', payload);
      }
      message.success('Saved'); setOpen(false); load();
    } catch (err) { message.error(err.response?.data?.message || 'Failed'); }
  };

  const doAction = async (userId, action) => {
    try { await api.post(`/users/${userId}/action`, { action }); message.success(`User ${action}`); load(); }
    catch { message.error('Action failed'); }
  };

  const resetPwd = async () => {
    const vals = await pwdForm.validateFields();
    try {
      await api.post(`/users/${editing.id}/reset-password`, { new_password: await hashPassword(vals.new_password) });
      message.success('Password reset'); setPwdModal(false);
    } catch { message.error('Failed'); }
  };

  const getActionMenu = record => ({
    items: [
      record.status === 'active'
        ? { key: 'locked', label: 'Lock Account', icon: <LockOutlined /> }
        : { key: 'active', label: 'Activate', icon: <UnlockOutlined /> },
      { key: 'suspended', label: 'Suspend', icon: <StopOutlined />, danger: true },
      { key: 'revoked', label: 'Revoke', icon: <StopOutlined />, danger: true },
      { type: 'divider' },
      { key: 'reset', label: 'Reset Password', icon: <KeyOutlined /> },
    ],
    onClick: ({ key }) => {
      if (key === 'reset') { setEditing(record); pwdForm.resetFields(); setPwdModal(true); }
      else doAction(record.id, key);
    },
  });

  const allColumns = [
    { title: 'Ref No',     dataIndex: 'user_ref_no', key: 'ref', width: 100,
      render: v => v ? <Tag color="blue">{v}</Tag> : null },
    { title: 'Name',       key: 'name', render: (_, r) => `${r.firstname} ${r.lastname}` },
    { title: 'Status',     dataIndex: 'status',     key: 'status', mobileAlign: 'center',
      render: v => <Tag color={STATUS_COLOR[v]}>{v}</Tag> },
    { title: 'Username',   dataIndex: 'username',   key: 'user',  mobileExpanded: true, render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'Email',      dataIndex: 'email',      key: 'email', mobileExpanded: true, render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'Phone',      dataIndex: 'phone',      key: 'phone', mobileExpanded: true, render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'Roles',      dataIndex: 'roles',      key: 'roles', mobileExpanded: true,
      render: v => v?.split(',').map((r, i) => <Tag key={i}>{r.trim()}</Tag>) },
    { title: 'Last Login', dataIndex: 'last_login', key: 'll',    mobileExpanded: true,
      render: v => v ? <Tag>{new Date(v).toLocaleString()}</Tag> : null },
    { title: '', key: 'more', width: 50, render: (_, r) => (
      <Dropdown menu={getActionMenu(r)} trigger={['click']}>
        <Button type="text" icon={<MoreOutlined />} />
      </Dropdown>
    )},
  ];
  const columns = allColumns.filter(c => !hiddenCols.has(c.key));

  const colToggle = (
    <Popover
      title="Show / hide columns"
      trigger="click"
      content={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 150 }}>
          {allColumns.filter(c => c.title).map(c => (
            <Checkbox
              key={c.key}
              checked={!hiddenCols.has(c.key)}
              onChange={e => setHiddenCols(prev => {
                const next = new Set(prev);
                e.target.checked ? next.delete(c.key) : next.add(c.key);
                return next;
              })}
            >{c.title}</Checkbox>
          ))}
        </div>
      }
    >
      <Button icon={<TableOutlined />} />
    </Popover>
  );

  return (
    <>
      <CrudTable
        title="User Management"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={() => { setEditing(null); form.resetFields(); setOpen(true); }}
        onEdit={r => { setEditing(r); form.setFieldsValue({ ...r, role_ids: r.roles?.split(',').map(x => x.trim()) }); setOpen(true); }}
        onDelete={async r => { try { await api.delete(`/users/${r.id}`); message.success('Deleted'); load(); } catch { message.error('Cannot delete'); } }}
        onSearch={v => { setSearch(v); setPage(1); }}
        onRefresh={load}
        pagination={{ current: page, total, pageSize: limit, onChange: (p, ps) => { setPage(p); setLimit(ps); }, showTotal: t => `${t} users` }}
        extra={colToggle}
        searchPlaceholder="Search by name, username, email..."
      />

      <Modal title={editing ? 'Edit User' : 'Add User'} open={open} onOk={onSave} onCancel={() => setOpen(false)} width={560} centered>
        <Form form={form} layout="vertical">
          <LabelField label="First Name" required>
            <Form.Item name="firstname" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Last Name" required>
            <Form.Item name="lastname" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Gender">
            <Form.Item name="gender" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children">
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Phone">
            <Form.Item name="phone" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Email">
            <Form.Item name="email" rules={[{ type: 'email' }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Username" required>
            <Form.Item name="username" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          {!editing && (
            <LabelField label="Password" required>
              <Form.Item name="password" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
                <Input.Password />
              </Form.Item>
            </LabelField>
          )}

          <LabelField label="Roles">
            <Form.Item name="role_ids" style={{ marginBottom: 0 }}>
              <Select mode="multiple" allowClear showSearch optionFilterProp="children">
                {roles.map(r => <Select.Option key={r.id} value={r.id}>{r.role_name}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>

      <Modal title="Reset Password" open={pwdModal} onOk={resetPwd} onCancel={() => setPwdModal(false)} centered>
        <Typography.Text>Resetting password for: <strong>{editing?.username}</strong></Typography.Text>
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 20 }}>
          <LabelField label="New Password" required>
            <Form.Item name="new_password" rules={[{ required: true, min: 6 }]} style={{ marginBottom: 0 }}>
              <Input.Password />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>
    </>
  );
}
