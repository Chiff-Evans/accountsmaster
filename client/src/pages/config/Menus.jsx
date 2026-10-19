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
import { Modal, Form, Input, Select, InputNumber, Switch, message, Tag, Tooltip } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

export default function Menus() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/menus'); setData(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = r => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const onSave = async () => {
    const values = await form.validateFields();
    try {
      if (editing) await api.put(`/menus/${editing.id}`, values);
      else await api.post('/menus', values);
      message.success('Saved');
      setModalOpen(false);
      load();
    } catch { message.error('Failed to save'); }
  };

  const onDelete = async r => {
    try { await api.delete(`/menus/${r.id}`); message.success('Deleted'); load(); }
    catch { message.error('Cannot delete — may have children or role assignments'); }
  };

  const topLevelMenus = data.filter(m => !m.parent_menu_id);
  const treeData = useMemo(() => buildTree(data, 'parent_menu_id'), [data]);

  const columns = [
    { title: 'Menu Name', dataIndex: 'menu_name', key: 'name', width: 200 },
    { title: 'View Path', dataIndex: 'view_path', key: 'view' },
    { title: 'Order', dataIndex: 'menu_order', key: 'order', width: 70 },
    { title: 'Icon', dataIndex: 'icon', key: 'icon', render: v => v ? <code>{v}</code> : null },
    { title: 'Visible', dataIndex: 'is_visible', key: 'vis', width: 70,
      render: v => v
        ? <Tooltip title="Visible"><EyeOutlined style={{ color: '#52c41a' }} /></Tooltip>
        : <Tooltip title="Hidden"><EyeInvisibleOutlined style={{ color: '#aaa' }} /></Tooltip> },
  ];

  return (
    <>
      <CrudTable
        title="Menu Management"
        columns={columns}
        dataSource={treeData}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={onDelete}
        onRefresh={load}
      />
      <Modal
        title={editing ? 'Edit Menu' : 'Add Menu'}
        open={modalOpen}
        onOk={onSave}
        onCancel={() => setModalOpen(false)}
        centered
      >
        <Form form={form} layout="vertical">
          <LabelField label="Menu Name" required>
            <Form.Item name="menu_name" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Parent Menu">
            <Form.Item name="parent_menu_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children" placeholder="None (Top Level)">
                {topLevelMenus.map(m => (
                  <Select.Option key={m.id} value={m.id}>{m.menu_name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Level">
            <Form.Item name="level" initialValue={1} style={{ marginBottom: 20 }}>
              <InputNumber min={1} max={3} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="View Path (Route)">
            <Form.Item name="view_path" style={{ marginBottom: 20 }}>
              <Input placeholder="/config/example" />
            </Form.Item>
          </LabelField>

          <LabelField label="Order">
            <Form.Item name="menu_order" initialValue={0} style={{ marginBottom: 20 }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Ant Design Icon Name">
            <Form.Item name="icon" style={{ marginBottom: 20 }}>
              <Input placeholder="DashboardOutlined" />
            </Form.Item>
          </LabelField>

          <LabelField label="Description">
            <Form.Item name="description" style={{ marginBottom: 20 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </LabelField>

          <Form.Item name="is_visible" label="Visible" valuePropName="checked" initialValue={true} style={{ marginBottom: 0 }}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
