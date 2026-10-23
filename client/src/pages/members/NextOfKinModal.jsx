import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Select, Tag, message } from 'antd';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

/* Pop-up grid of a member's next of kin, with its own add/edit form.
   Permissions follow the Members page (CrudTable reads the current route). */
export default function NextOfKinModal({ member, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [relationships, setRelationships] = useState([]); // parameter text_id 'relationships'

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    if (!member) return;
    setLoading(true);
    try {
      const r = await api.get(`/members/${member.id}/next-of-kin`);
      setData(r.data);
    } catch { message.error('Failed to load next of kin'); }
    finally { setLoading(false); }
  }, [member]);

  useEffect(() => { setData([]); load(); }, [load]);

  useEffect(() => {
    api.get('/parameters/values', { params: { text_id: 'relationships' } }).then(r => setRelationships(r.data));
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ relationship_id: relationships.find(r => r.is_default)?.id });
    setOpen(true);
  };

  const openEdit = r => {
    setEditing(r);
    form.setFieldsValue(r);
    setOpen(true);
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    const payload = {
      kin_name:        vals.kin_name,
      relationship_id: vals.relationship_id ?? null,
      id_number:       vals.id_number || null,
      phone:           vals.phone || null,
      email:           vals.email || null,
    };
    setSaving(true);
    try {
      if (editing) await api.put(`/members/${member.id}/next-of-kin/${editing.id}`, payload);
      else await api.post(`/members/${member.id}/next-of-kin`, payload);
      message.success('Saved');
      setOpen(false);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const columns = [
    { title: 'Ref No', dataIndex: 'kin_ref_no', key: 'ref', width: 110, render: v => v ? <Tag color="blue">{v}</Tag> : null },
    { title: 'Name', dataIndex: 'kin_name', key: 'name' },
    { title: 'Relationship', dataIndex: 'relationship_name', key: 'rel', render: v => v ? <Tag>{v}</Tag> : '—' },
    { title: 'ID Number', dataIndex: 'id_number', key: 'idno', mobileExpanded: true },
    { title: 'Phone No.', dataIndex: 'phone', key: 'phone', mobileAlign: 'right' },
    { title: 'Email', dataIndex: 'email', key: 'email', mobileExpanded: true },
  ];

  return (
    <>
      <Modal
        title={<div style={{ fontWeight: 600 }}>Next of Kin — {member?.member_name}</div>}
        open={!!member}
        onCancel={onClose}
        footer={null}
        width={860}
        centered
        destroyOnHidden
      >
        <CrudTable
          title="Next of Kin"
          columns={columns}
          dataSource={data}
          loading={loading}
          onAdd={openAdd}
          onEdit={openEdit}
          onDelete={async r => {
            try { await api.delete(`/members/${member.id}/next-of-kin/${r.id}`); message.success('Deleted'); load(); }
            catch { message.error('Cannot delete'); }
          }}
          onRefresh={load}
          hidePagination
          height={360}
          searchPlaceholder="Search next of kin..."
        />
      </Modal>

      <Modal
        title={editing ? 'Edit Next of Kin' : 'Add Next of Kin'}
        open={open}
        onOk={onSave}
        onCancel={() => setOpen(false)}
        confirmLoading={saving}
        width={520}
        centered
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingTop: 8, paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical">
          <LabelField label="Name" required>
            <Form.Item name="kin_name" rules={[{ required: true, message: 'Name is required' }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Relationship">
            <Form.Item name="relationship_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children" placeholder="Select Relationship">
                {relationships.map(r => <Select.Option key={r.id} value={r.id}>{r.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="ID Number">
            <Form.Item name="id_number" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Phone No.">
            <Form.Item name="phone" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Email">
            <Form.Item name="email" rules={[{ type: 'email', message: 'Enter a valid email' }]} style={{ marginBottom: 0 }}>
              <Input />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>
    </>
  );
}
