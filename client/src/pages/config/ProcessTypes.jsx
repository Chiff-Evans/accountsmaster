import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

export default function ProcessTypes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/process-types'); setData(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onSave = async () => {
    const vals = await form.validateFields();
    try {
      if (editing) await api.put(`/process-types/${editing.id}`, vals);
      else await api.post('/process-types', vals);
      message.success('Saved'); setOpen(false); load();
    } catch { message.error('Failed'); }
  };

  const columns = [
    { title: 'Process Type Name', dataIndex: 'process_type_name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'desc' },
    { title: 'Data Table', dataIndex: 'data_table', key: 'table', render: v => <code>{v}</code> },
  ];

  return (
    <>
      <CrudTable
        title="Process Types"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={() => { setEditing(null); form.resetFields(); setOpen(true); }}
        onEdit={r => { setEditing(r); form.setFieldsValue(r); setOpen(true); }}
        onDelete={async r => {
          try { await api.delete(`/process-types/${r.id}`); message.success('Deleted'); load(); }
          catch { message.error('Cannot delete'); }
        }}
        onRefresh={load}
      />
      <Modal title={editing ? 'Edit Process Type' : 'Add Process Type'} open={open} onOk={onSave} onCancel={() => setOpen(false)} centered>
        <Form form={form} layout="vertical">
          <LabelField label="Process Type Name" required>
            <Form.Item name="process_type_name" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Description">
            <Form.Item name="description" style={{ marginBottom: 20 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </LabelField>

          <LabelField label="Data Table">
            <Form.Item name="data_table" style={{ marginBottom: 0 }}>
              <Input placeholder="e.g. users, members, transactions" />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>
    </>
  );
}
