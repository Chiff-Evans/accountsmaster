import { useState, useEffect, useMemo } from 'react';

function buildTree(items, parentKey) {
  const map = Object.fromEntries(items.map(i => [i.id, { ...i }]));
  const roots = [];
  items.forEach(i => {
    if (i[parentKey]) {
      const p = map[i[parentKey]];
      if (p) { if (!p.children) p.children = []; p.children.push(map[i.id]); }
    } else { roots.push(map[i.id]); }
  });
  return roots;
}
import {
  Modal, Form, Input, message, Tabs, Table, Checkbox, Button,
  Typography, Tag, Badge, Tooltip,
} from 'antd';
import {
  UserAddOutlined, DeleteOutlined, TeamOutlined,
  AppstoreOutlined, EyeOutlined, PlusOutlined, EditOutlined,
} from '@ant-design/icons';
import CrudTable from '../../components/common/CrudTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [allMenus, setAllMenus] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [accessModal, setAccessModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [roleDetail, setRoleDetail] = useState(null);
  const [form] = Form.useForm();
  const [accessMap, setAccessMap] = useState({});

  const loadRoles = async () => {
    setLoading(true);
    try {
      const [r, m, u] = await Promise.all([
        api.get('/roles'), api.get('/menus'), api.get('/users?limit=200'),
      ]);
      setRoles(r.data); setAllMenus(m.data); setAllUsers(u.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadRoles(); }, []);

  const openAccess = async role => {
    setCurrentRole(role);
    const r = await api.get(`/roles/${role.id}`);
    setRoleDetail(r.data);
    const map = {};
    r.data.access.forEach(a => {
      map[a.menu_id] = { can_view: a.can_view, can_create: a.can_create, can_edit: a.can_edit, can_delete: a.can_delete };
    });
    setAccessMap(map);
    setAccessModal(true);
  };

  const saveAccess = async () => {
    const access = Object.entries(accessMap).map(([menu_id, perms]) => ({ menu_id: parseInt(menu_id), ...perms }));
    await api.put(`/roles/${currentRole.id}/access`, { access });
    message.success('Access rights saved');
    setAccessModal(false);
  };

  const togglePerm = (menuId, perm) => {
    setAccessMap(prev => ({
      ...prev,
      [menuId]: { ...(prev[menuId] || {}), [perm]: prev[menuId]?.[perm] ? 0 : 1 },
    }));
  };

  const onSave = async () => {
    const values = await form.validateFields();
    try {
      if (editing) await api.put(`/roles/${editing.id}`, values);
      else await api.post('/roles', values);
      message.success('Saved'); setModalOpen(false); loadRoles();
    } catch { message.error('Failed'); }
  };

  const onDelete = async r => {
    try { await api.delete(`/roles/${r.id}`); message.success('Deleted'); loadRoles(); }
    catch { message.error('Cannot delete'); }
  };

  const columns = [
    { title: 'Role Name', dataIndex: 'role_name', key: 'name', render: (v, r) => <a onClick={() => openAccess(r)}>{v}</a> },
    { title: 'Description', dataIndex: 'description', key: 'desc' },
    { title: 'Actions', key: 'act', render: (_, r) => (
      <Button size="small" onClick={() => openAccess(r)}>Manage Access</Button>
    )},
  ];

  const PERMS = [
    { key: 'can_view',   label: 'View',   icon: <EyeOutlined />,    color: '#1677ff' },
    { key: 'can_create', label: 'Create', icon: <PlusOutlined />,   color: '#52c41a' },
    { key: 'can_edit',   label: 'Edit',   icon: <EditOutlined />,   color: '#faad14' },
    { key: 'can_delete', label: 'Delete', icon: <DeleteOutlined />, color: '#ff4d4f' },
  ];

  const menuTree = useMemo(() => buildTree(allMenus, 'parent_menu_id'), [allMenus]);

  const menuAccessCols = [
    { title: 'Menu', dataIndex: 'menu_name', key: 'name' },
    ...PERMS.map(({ key: p, label, icon, color }) => ({
      title: (
        <Tooltip title={label}>
          <span style={{ color }}>{icon}</span>
        </Tooltip>
      ),
      key: p, width: 60, align: 'center',
      render: (_, r) => (
        <Checkbox
          checked={!!accessMap[r.id]?.[p]}
          onChange={() => togglePerm(r.id, p)}
        />
      ),
    })),
  ];

  return (
    <>
      <CrudTable
        title="Roles & Groups"
        columns={columns.slice(0, 2)}
        dataSource={roles}
        loading={loading}
        onAdd={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}
        onEdit={r => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}
        onDelete={onDelete}
        onRefresh={loadRoles}
      />

      <Modal title={editing ? 'Edit Role' : 'Add Role'} open={modalOpen} onOk={onSave} onCancel={() => setModalOpen(false)} centered>
        <Form form={form} layout="vertical">
          <LabelField label="Role Name" required>
            <Form.Item name="role_name" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Description">
            <Form.Item name="description" style={{ marginBottom: 0 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>

      <Modal
        title={
          <span>
            Access Rights —{' '}
            <Tag color="blue" style={{ fontSize: 13, marginLeft: 4 }}>{currentRole?.role_name}</Tag>
          </span>
        }
        open={accessModal}
        onOk={saveAccess}
        onCancel={() => setAccessModal(false)}
        width={720}
        okText="Save Access"
        centered
        styles={{ body: { padding: '0 0 8px' } }}
      >
        {roleDetail && (
          <Tabs
            defaultActiveKey="menus"
            items={[
              {
                key: 'menus',
                label: <span><AppstoreOutlined style={{ marginRight: 6 }} />Menu Access</span>,
                children: (
                  <div style={{ maxHeight: 'calc(100vh - 360px)', overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                    <Table
                      size="small"
                      rowKey="id"
                      columns={menuAccessCols}
                      dataSource={menuTree}
                      pagination={false}
                      rowClassName={(_, i) => i % 2 !== 0 ? 'ant-table-row-striped' : ''}
                    />
                  </div>
                ),
              },
              {
                key: 'users',
                label: (
                  <span>
                    <TeamOutlined style={{ marginRight: 6 }} />
                    Users
                  </span>
                ),
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Assigned users */}
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ background: '#fafafa', padding: '8px 14px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TeamOutlined style={{ color: '#1677ff' }} />
                        <Typography.Text strong>Assigned Users</Typography.Text>
                        <Badge count={roleDetail.users?.length || 0} style={{ backgroundColor: '#1677ff' }} showZero />
                      </div>
                      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                        <ResponsiveTable
                          size="small"
                          rowKey="id"
                          dataSource={roleDetail.users}
                          pagination={false}
                          locale={{ emptyText: 'No users assigned to this role' }}
                          columns={[
                            { title: 'Ref', dataIndex: 'user_ref_no', width: 90,
                              render: v => v ? <Tag color="blue">{v}</Tag> : null },
                            { title: 'Name', render: (_, r) => `${r.firstname} ${r.lastname}` },
                            { title: 'Username', dataIndex: 'username' },
                            {
                              title: '', width: 70, align: 'center',
                              render: (_, r) => (
                                <Tooltip title="Remove from role">
                                  <Button
                                    type="link" size="small" danger
                                    icon={<DeleteOutlined />}
                                    onClick={async () => {
                                      await api.delete(`/roles/${currentRole.id}/users/${r.id}`);
                                      const updated = await api.get(`/roles/${currentRole.id}`);
                                      setRoleDetail(updated.data);
                                    }}
                                  />
                                </Tooltip>
                              ),
                            },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Available users */}
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ background: '#fafafa', padding: '8px 14px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserAddOutlined style={{ color: '#52c41a' }} />
                        <Typography.Text strong>Add Users to Role</Typography.Text>
                      </div>
                      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        <ResponsiveTable
                          size="small"
                          rowKey="id"
                          dataSource={allUsers.filter(u => !roleDetail.users.find(ru => ru.id === u.id))}
                          pagination={false}
                          locale={{ emptyText: 'All users already assigned' }}
                          columns={[
                            { title: 'Name', render: (_, r) => `${r.firstname} ${r.lastname}` },
                            { title: 'Username', dataIndex: 'username' },
                            {
                              title: '', width: 80, align: 'center',
                              render: (_, r) => (
                                <Button
                                  type="primary" ghost size="small"
                                  icon={<UserAddOutlined />}
                                  onClick={async () => {
                                    await api.post(`/roles/${currentRole.id}/users`, { user_id: r.id });
                                    const updated = await api.get(`/roles/${currentRole.id}`);
                                    setRoleDetail(updated.data);
                                  }}
                                >
                                  Add
                                </Button>
                              ),
                            },
                          ]}
                        />
                      </div>
                    </div>

                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </>
  );
}
