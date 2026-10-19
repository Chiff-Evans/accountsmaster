import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Tag, message } from 'antd';
import dayjs from 'dayjs';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

export default function Salaries() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [campaignBrandAmbassadors, setCampaignBrandAmbassadors] = useState([]); // brand ambassadors assigned to the selected campaign
  const [currencies, setCurrencies] = useState([]); // parameter_id 8
  const [paymentModes, setPaymentModes] = useState([]); // parameter_id 22

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileNo, setFileNo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const selectedCampaignId = Form.useWatch('campaign_id', form);
  const selectedBrandAmbassadorId = Form.useWatch('brand_ambassador_id', form);

  // Campaign picked (or changed) → load the brand ambassadors actually
  // assigned to it, since a salary can only be paid to someone who ran that
  // campaign.
  useEffect(() => {
    if (!selectedCampaignId) { setCampaignBrandAmbassadors([]); return; }
    let ignore = false;
    api.get(`/campaigns/${selectedCampaignId}/brand-ambassadors`).then(r => {
      if (!ignore) setCampaignBrandAmbassadors(r.data);
    });
    return () => { ignore = true; };
  }, [selectedCampaignId]);

  // Once both Campaign and Brand Ambassador are picked, prefill the amount
  // from their remaining balance (estimated earnings share - already paid)
  // — only when adding, so editing an existing salary never clobbers it.
  useEffect(() => {
    if (editing || !selectedCampaignId || !selectedBrandAmbassadorId) return;
    let ignore = false;
    api.get('/salaries/balance', { params: { campaign_id: selectedCampaignId, brand_ambassador_id: selectedBrandAmbassadorId } })
      .then(r => {
        if (ignore) return;
        if (r.data.balance > 0) form.setFieldsValue({ amount: Math.round(r.data.balance * 100) / 100 });
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, [editing, selectedCampaignId, selectedBrandAmbassadorId, form]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/salaries', { params: { page, limit, search } });
      setData(r.data.data); setTotal(r.data.total);
    } finally { setLoading(false); }
  }, [page, limit, search]);

  useEffect(() => {
    load();
    api.get('/campaigns', { params: { limit: 500 } }).then(r => setCampaigns(r.data.data ?? r.data));
    api.get('/parameters/values', { params: { parameter_id: 8 } }).then(r => setCurrencies(r.data));
    api.get('/parameters/values', { params: { parameter_id: 22 } }).then(r => setPaymentModes(r.data));
  }, [load]);

  const openAdd = async () => {
    setEditing(null);
    setCampaignBrandAmbassadors([]);
    form.resetFields();
    form.setFieldsValue({ payment_date: dayjs() });
    const defaultCurrency = currencies.find(c => c.is_default);
    const defaultMode = paymentModes.find(m => m.is_default);
    if (defaultCurrency) form.setFieldsValue({ currency_id: defaultCurrency.id });
    if (defaultMode) form.setFieldsValue({ payment_mode_id: defaultMode.id });
    setOpen(true);
    try {
      const r = await api.get('/salaries/next-no');
      setFileNo(r.data.file_no);
    } catch { setFileNo(null); }
  };

  const openEdit = async r => {
    setEditing(r);
    setFileNo(r.file_no);
    // Load this campaign's assigned brand ambassadors so the current one
    // still resolves to a valid, visible option in the Select.
    try {
      const res = await api.get(`/campaigns/${r.campaign_id}/brand-ambassadors`);
      setCampaignBrandAmbassadors(res.data);
    } catch { setCampaignBrandAmbassadors([]); }
    form.setFieldsValue({
      campaign_id: r.campaign_id,
      brand_ambassador_id: r.brand_ambassador_id,
      currency_id: r.currency_id,
      payment_mode_id: r.payment_mode_id,
      amount: r.amount,
      reference: r.reference,
      payment_date: r.payment_date ? dayjs(r.payment_date) : null,
      comments: r.comments,
    });
    setOpen(true);
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    const payload = {
      ...vals,
      payment_date: vals.payment_date ? vals.payment_date.format('YYYY-MM-DD') : null,
    };
    setSaving(true);
    try {
      if (editing) await api.put(`/salaries/${editing.id}`, payload);
      else await api.post('/salaries', payload);
      message.success('Saved');
      setOpen(false);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const columns = [
    { title: 'File No', dataIndex: 'file_no', key: 'file_no', render: v => v ? <Tag color="blue">{v}</Tag> : null },
    { title: 'Campaign', dataIndex: 'campaign_title', key: 'campaign', mobileHeaderSize: 13, mobileExpanded: true },
    { title: 'Brand Ambassador', key: 'brand_ambassador', render: (_, r) => (
      <div>
        <div>{r.brand_ambassador_name}</div>
        {/* {r.brand_ambassador_ref_no && <Tag style={{ marginTop: 2 }}>{r.brand_ambassador_ref_no}</Tag>} */}
      </div>
    ) },
    { title: 'Mode', dataIndex: 'payment_mode_name', key: 'mode', mobileExpanded: true, render: v => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: v => v != null ? Number(v).toLocaleString() : '—' },
    { title: 'Date', dataIndex: 'payment_date', key: 'date', mobileExpanded: true, render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
  ];

  return (
    <>
      <CrudTable
        title="Salaries"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={async r => {
          try { await api.delete(`/salaries/${r.id}`); message.success('Deleted'); load(); }
          catch { message.error('Cannot delete'); }
        }}
        onSearch={v => { setSearch(v); setPage(1); }}
        onRefresh={load}
        pagination={{ current: page, total, pageSize: limit, onChange: (p, ps) => { setPage(p); setLimit(ps); }, showTotal: t => `${t} salary payments` }}
        searchPlaceholder="Search by file no, campaign, brand ambassador or reference..."
      />

      <Modal
        title="Salary Payment Form"
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
              <Select
                showSearch
                optionFilterProp="children"
                onChange={() => form.setFieldValue('brand_ambassador_id', undefined)}
              >
                {campaigns.map(c => <Select.Option key={c.id} value={c.id}>{c.campaign_title}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Brand Ambassador" required>
            <Form.Item name="brand_ambassador_id" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Select
                showSearch optionFilterProp="children"
                disabled={!selectedCampaignId}
                placeholder={selectedCampaignId ? 'Select brand ambassador' : 'Select a campaign first'}
              >
                {campaignBrandAmbassadors.map(a => (
                  <Select.Option key={a.brand_ambassador_id} value={a.brand_ambassador_id}>
                    {a.full_name}{a.brand_ambassador_ref_no ? ` (${a.brand_ambassador_ref_no})` : ''}
                  </Select.Option>
                ))}
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

          <LabelField label="Mode of Payment">
            <Form.Item name="payment_mode_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children">
                {paymentModes.map(m => <Select.Option key={m.id} value={m.id}>{m.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Amount" required>
            <Form.Item name="amount" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Transaction Ref.">
            <Form.Item name="reference" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Payment Date">
            <Form.Item name="payment_date" style={{ marginBottom: 20 }}>
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
