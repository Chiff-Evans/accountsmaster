import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, InputNumber, DatePicker, Select, Switch, Tag, message } from 'antd';
import dayjs from 'dayjs';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

const fmtAmount = v => v != null ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
const fmtDate = v => v ? dayjs(v).format('D MMM YYYY') : '—';

export default function ContributionRates() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeUnits, setTimeUnits] = useState([]); // parameter text_id 'time-units'
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/contribution-rates');
      setData(r.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get('/parameters/values', { params: { text_id: 'time-units' } }).then(r => setTimeUnits(r.data));
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      time_unit_id: timeUnits.find(t => t.is_default)?.id,
      start_date: dayjs(),
      is_active: false,
    });
    setOpen(true);
  };

  const openEdit = r => {
    setEditing(r);
    form.setFieldsValue({
      time_unit_id: r.time_unit_id,
      amount: r.amount != null ? Number(r.amount) : null,
      start_date: r.start_date ? dayjs(r.start_date) : null,
      end_date: r.end_date ? dayjs(r.end_date) : null,
      is_active: !!r.is_active,
    });
    setOpen(true);
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    const payload = {
      time_unit_id: vals.time_unit_id,
      amount: vals.amount,
      start_date: vals.start_date.format('YYYY-MM-DD'),
      end_date: vals.end_date ? vals.end_date.format('YYYY-MM-DD') : null,
      is_active: !!vals.is_active,
    };
    setSaving(true);
    try {
      if (editing) await api.put(`/contribution-rates/${editing.id}`, payload);
      else await api.post('/contribution-rates', payload);
      message.success('Saved');
      setOpen(false);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const columns = [
    { title: 'Time Unit', dataIndex: 'time_unit_name', key: 'unit', render: v => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right', mobileAlign: 'right', render: fmtAmount },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start', render: fmtDate },
    { title: 'End Date', dataIndex: 'end_date', key: 'end', render: v => v ? fmtDate(v) : 'Open-ended' },
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
        title="Contribution Rates"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={async r => {
          try { await api.delete(`/contribution-rates/${r.id}`); message.success('Deleted'); load(); }
          catch { message.error('Cannot delete'); }
        }}
        onRefresh={load}
        searchPlaceholder="Search contribution rates..."
      />

      <Modal
        title={editing ? 'Edit Contribution Rate' : 'Add Contribution Rate'}
        open={open}
        onOk={onSave}
        onCancel={() => setOpen(false)}
        confirmLoading={saving}
        width={480}
        centered
      >
        <Form form={form} layout="vertical">
          <LabelField label="Time Unit" required>
            <Form.Item name="time_unit_id" rules={[{ required: true, message: 'Time unit is required' }]} style={{ marginBottom: 20 }}>
              <Select showSearch optionFilterProp="children" placeholder="Select Time Unit">
                {timeUnits.map(t => <Select.Option key={t.id} value={t.id}>{t.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Amount" required>
            <Form.Item
              name="amount"
              rules={[
                { required: true, message: 'Amount is required' },
                { type: 'number', min: 0.01, message: 'Amount must be greater than zero' },
              ]}
              style={{ marginBottom: 20 }}
            >
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Start Date" required>
            <Form.Item name="start_date" rules={[{ required: true, message: 'Start date is required' }]} style={{ marginBottom: 20 }}>
              <DatePicker style={{ width: '100%' }} format="D MMM YYYY" />
            </Form.Item>
          </LabelField>

          <LabelField label="End Date">
            <Form.Item
              name="end_date"
              dependencies={['start_date']}
              extra="Leave blank if the rate has no end date"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue('start_date');
                    if (!value || !start || !value.isBefore(start, 'day')) return Promise.resolve();
                    return Promise.reject(new Error('End date cannot be before start date'));
                  },
                }),
              ]}
              style={{ marginBottom: 20 }}
            >
              <DatePicker style={{ width: '100%' }} format="D MMM YYYY" />
            </Form.Item>
          </LabelField>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
            tooltip="Only one contribution rate can be active. Activating this one deactivates the others."
            style={{ marginBottom: 0 }}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
