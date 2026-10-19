import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Tag, message } from 'antd';
import dayjs from 'dayjs';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

export default function Expenditure() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [types, setTypes] = useState([]);      // parameter_values for "Types of Expenditures" (id 9)
  const [currencies, setCurrencies] = useState([]); // parameter_values for "Currencies" (id 8)

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileNo, setFileNo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/expenditure', { params: { page, limit, search } });
      setData(r.data.data); setTotal(r.data.total);
    } finally { setLoading(false); }
  }, [page, limit, search]);

  useEffect(() => {
    load();
    api.get('/campaigns', { params: { limit: 500 } }).then(r => setCampaigns(r.data.data ?? r.data));
    api.get('/parameters/values', { params: { parameter_id: 9 } }).then(r => setTypes(r.data));
    api.get('/parameters/values', { params: { parameter_id: 8 } }).then(r => setCurrencies(r.data));
  }, [load]);

  const openAdd = async () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ expenditure_date: dayjs() });
    // Prefill whichever Type/Currency staff have explicitly marked as default.
    const defaultType     = types.find(t => t.is_default);
    const defaultCurrency = currencies.find(c => c.is_default);
    if (defaultType)     form.setFieldsValue({ expenditure_type_id: defaultType.id });
    if (defaultCurrency) form.setFieldsValue({ currency_id: defaultCurrency.id });
    setOpen(true);
    try {
      const r = await api.get('/expenditure/next-no');
      setFileNo(r.data.file_no);
    } catch { setFileNo(null); }
  };

  const openEdit = r => {
    setEditing(r);
    setFileNo(r.file_no);
    form.setFieldsValue({
      campaign_id: r.campaign_id,
      expenditure_type_id: r.expenditure_type_id,
      currency_id: r.currency_id,
      amount: r.amount,
      reference: r.reference,
      expenditure_date: r.expenditure_date ? dayjs(r.expenditure_date) : null,
      comments: r.comments,
    });
    setOpen(true);
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    const payload = {
      ...vals,
      expenditure_date: vals.expenditure_date ? vals.expenditure_date.format('YYYY-MM-DD') : null,
    };
    setSaving(true);
    try {
      if (editing) await api.put(`/expenditure/${editing.id}`, payload);
      else await api.post('/expenditure', payload);
      message.success('Saved');
      setOpen(false);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const columns = [
    { title: 'File No', dataIndex: 'file_no', key: 'file_no', render: v => v ? <Tag color="blue">{v}</Tag> : null },
    { title: 'Campaign', dataIndex: 'campaign_title', key: 'campaign', mobileHeaderSize: 13 },
    { title: 'Expenditure Type', dataIndex: 'expenditure_type_name', key: 'type', render: v => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: v => v != null ? Number(v).toLocaleString() : '—' },
    { title: 'Date', dataIndex: 'expenditure_date', key: 'date', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
  ];

  return (
    <>
      <CrudTable
        title="Expenditure"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={async r => {
          try { await api.delete(`/expenditure/${r.id}`); message.success('Deleted'); load(); }
          catch { message.error('Cannot delete'); }
        }}
        onSearch={v => { setSearch(v); setPage(1); }}
        onRefresh={load}
        pagination={{ current: page, total, pageSize: limit, onChange: (p, ps) => { setPage(p); setLimit(ps); }, showTotal: t => `${t} records` }}
        searchPlaceholder="Search by file no, campaign or reference..."
      />

      <Modal
        title="Expenditure Form"
        open={open}
        onOk={onSave}
        onCancel={() => setOpen(false)}
        confirmLoading={saving}
        width={560}
        centered
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingTop: 8, paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical">
          <LabelField label="File No">
            <Input readOnly value={fileNo || '—'} style={{ color: '#1677ff', fontWeight: 600, marginBottom: 20 }} />
          </LabelField>

          <LabelField label="Campaign" required>
            <Form.Item name="campaign_id" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Select showSearch optionFilterProp="children">
                {campaigns.map(c => <Select.Option key={c.id} value={c.id}>{c.campaign_title}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Expenditure" required>
            <Form.Item name="expenditure_type_id" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Select showSearch optionFilterProp="children">
                {types.map(t => <Select.Option key={t.id} value={t.id}>{t.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Currency">
            <Form.Item name="currency_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children">
                {currencies.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Amount" required>
            <Form.Item name="amount" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Transaction Reference">
            <Form.Item name="reference" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Expenditure Date">
            <Form.Item name="expenditure_date" style={{ marginBottom: 20 }}>
              <DatePicker style={{ width: '100%' }} format="D MMM YYYY" />
            </Form.Item>
          </LabelField>

          <LabelField label="Comments">
            <Form.Item name="comments" style={{ marginBottom: 0 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>
    </>
  );
}
