import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, InputNumber, DatePicker, Switch, Tag, message } from 'antd';
import dayjs from 'dayjs';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

const fmtAmount = v => v != null ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

export default function Targets() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/targets');
      setData(r.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ is_active: false });
    setOpen(true);
  };

  const openEdit = r => {
    setEditing(r);
    form.setFieldsValue({
      target_amount: r.target_amount != null ? Number(r.target_amount) : null,
      target_date: r.target_date ? dayjs(r.target_date) : null,
      is_active: !!r.is_active,
    });
    setOpen(true);
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    const payload = {
      target_amount: vals.target_amount,
      target_date: vals.target_date.format('YYYY-MM-DD'),
      is_active: !!vals.is_active,
    };
    setSaving(true);
    try {
      if (editing) await api.put(`/targets/${editing.id}`, payload);
      else await api.post('/targets', payload);
      message.success('Saved');
      setOpen(false);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const columns = [
    { title: 'Target Date', dataIndex: 'target_date', key: 'date', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    { title: 'Target Amount', dataIndex: 'target_amount', key: 'amount', align: 'right', mobileAlign: 'right', render: fmtAmount },
    { title: 'Active', dataIndex: 'is_active', key: 'active', mobileExpanded: true,
      render: v => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag> },
    { title: 'Date Created', dataIndex: 'created_on', key: 'created_on', mobileExpanded: true,
      render: v => v ? dayjs(v).format('D MMM YYYY, HH:mm') : '—' },
    { title: 'Created By', key: 'created_by', mobileExpanded: true,
      render: (_, r) => r.created_by_name || r.created_by_username || '—' },
  ];

  return (
    <>
      <CrudTable
        title="Targets"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={async r => {
          try { await api.delete(`/targets/${r.id}`); message.success('Deleted'); load(); }
          catch { message.error('Cannot delete'); }
        }}
        onRefresh={load}
        searchPlaceholder="Search targets..."
      />

      <Modal
        title={editing ? 'Edit Target' : 'Add Target'}
        open={open}
        onOk={onSave}
        onCancel={() => setOpen(false)}
        confirmLoading={saving}
        width={480}
        centered
      >
        <Form form={form} layout="vertical">

          <LabelField label="Target Amount" required>
            <Form.Item
              name="target_amount"
              rules={[
                { required: true, message: 'Target amount is required' },
                { type: 'number', min: 0.01, message: 'Target amount must be greater than zero' },
              ]}
              style={{ marginBottom: 20 }}
            >
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>
          <LabelField label="Target Date" required>
            <Form.Item name="target_date" rules={[{ required: true, message: 'Target date is required' }]} style={{ marginBottom: 20 }}>
              <DatePicker style={{ width: '100%' }} format="D MMM YYYY" />
            </Form.Item>
          </LabelField>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
            tooltip="Only one target can be active. Activating this one deactivates the others."
            style={{ marginBottom: 0 }}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
