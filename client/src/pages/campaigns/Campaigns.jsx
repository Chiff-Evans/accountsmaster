import { useState, useEffect, useCallback } from 'react';
import {
  Modal, Form, Input, InputNumber, Select, Tag, Button,
  message, Typography, Spin, DatePicker, Table, Empty, Tabs, Popover, Checkbox, Alert, Space,
} from 'antd';
import {
  SwapOutlined, UnorderedListOutlined, DollarOutlined, TableOutlined,
  DollarCircleOutlined, DeleteOutlined, CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import MultiFileUploadField from '../../components/common/MultiFileUploadField';
import HistoryPanel from '../../components/common/HistoryPanel';
import api from '../../api';

function StageTag({ name, color }) {
  if (!name) return <Typography.Text type="secondary">—</Typography.Text>;
  return <Tag color={color || undefined}>{name}</Tag>;
}

function parseIds(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
}

const money = v => v != null ? `KES ${Number(v).toLocaleString()}` : '—';
const dateFmt = v => v ? dayjs(v).format('D MMM YYYY') : '—';
const fileUrl = u => (u?.startsWith('http') ? u : `${api.defaults.baseURL.replace(/\/api$/, '')}${u}`);

/* Live client-side preview only — the server recomputes and stores the
   authoritative end_date on save (never trusts a client-sent value).
   Inclusive of the start date itself: "5 Days" from a Monday ends Friday. */
function previewEndDate(startDate, durationValue, unitName) {
  const n = Number(durationValue);
  if (!startDate || !n) return null;
  const unit = (unitName || '').toLowerCase();
  if (unit === 'years')  return dayjs(startDate).add(n, 'year').subtract(1, 'day');
  if (unit === 'months') return dayjs(startDate).add(n, 'month').subtract(1, 'day');
  if (unit === 'weeks')  return dayjs(startDate).add(n * 7 - 1, 'day');
  if (unit === 'hours')  return dayjs(startDate).add(Math.max(0, Math.ceil(n / 24) - 1), 'day');
  return dayjs(startDate).add(n - 1, 'day'); // days (default)
}

const ACTIVITY_HEIGHT = '45vh';
function ActivityPane({ children }) {
  return (
    <div style={{ height: ACTIVITY_HEIGHT, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}

export default function Campaigns() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [advertisers, setAdvertisers] = useState([]);
  const [brandAmbassadorsList, setBrandAmbassadorsList] = useState([]);
  const [campaignTypes, setCampaignTypes] = useState([]); // parameter_id 19
  const [durationUnits, setDurationUnits] = useState([]); // parameter_id 20
  const [audiences, setAudiences] = useState([]);          // parameter_id 21
  const [countries, setCountries] = useState([]);           // parameter_id 15
  const [counties, setCounties] = useState([]);             // parameter_id 16
  const [subcounties, setSubcounties] = useState([]);       // parameter_id 17
  const [currencies, setCurrencies] = useState([]);         // parameter_id 8
  const [paymentModes, setPaymentModes] = useState([]);     // parameter_id 22

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileNo, setFileNo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [posterFiles, setPosterFiles] = useState([]);
  const [existingPosters, setExistingPosters] = useState([]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [form] = Form.useForm();
  const [hiddenCols, setHiddenCols] = useState(new Set(['duration', 'created', 'paid_amount', 'balance']));
  const [stages, setStages] = useState([]);
  const [stageFilter, setStageFilter] = useState(null);

  const [processing, setProcessing] = useState(null);
  const [transitionList, setTransitionList] = useState([]);
  const [transLoading, setTransLoading] = useState(false);
  const [transAction, setTransAction] = useState(null);
  const [transNotes, setTransNotes] = useState('');
  const [moving, setMoving] = useState(false);

  // Activity — brand ambassadors assigned / payments / expenditure recorded against a campaign
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [activityTab, setActivityTab] = useState('brand_ambassadors');
  const [activityLoading, setActivityLoading] = useState(false);
  const [campaignBrandAmbassadors, setCampaignBrandAmbassadors] = useState([]);
  const [campaignPayments, setCampaignPayments] = useState([]);
  const [campaignSalaries, setCampaignSalaries] = useState([]);
  const [campaignExpenditure, setCampaignExpenditure] = useState([]);
  const [pendingBrandAmbassadorIds, setPendingBrandAmbassadorIds] = useState([]);
  const [assigningBrandAmbassadors, setAssigningBrandAmbassadors] = useState(false);

  // Record Payment modal
  const [payingCampaign, setPayingCampaign] = useState(null);
  const [payFileNo, setPayFileNo] = useState(null);
  const [paySaving, setPaySaving] = useState(false);
  const [payForm] = Form.useForm();

  // Pay Salary modal — for one brand ambassador on the currently-viewed campaign
  const [payingBrandAmbassador, setPayingBrandAmbassador] = useState(null);
  const [salaryFileNo, setSalaryFileNo] = useState(null);
  const [salarySaving, setSalarySaving] = useState(false);
  const [salaryForm] = Form.useForm();

  // Proof deadline modal — per-assignment override of the last date a brand
  // ambassador may submit posting proof for the currently-viewed campaign
  const [deadlineFor, setDeadlineFor] = useState(null);
  const [deadlineValue, setDeadlineValue] = useState(null);
  const [deadlineSaving, setDeadlineSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/campaigns', { params: { page, limit, search, stage_id: stageFilter || undefined } });
      setData(r.data.data); setTotal(r.data.total);
    } finally { setLoading(false); }
  }, [page, limit, search, stageFilter]);

  useEffect(() => { api.get('/campaigns/stages').then(r => setStages(r.data)); }, []);

  useEffect(() => {
    load();
    api.get('/advertisers', { params: { limit: 500 } }).then(r => setAdvertisers(r.data.data ?? r.data));
    api.get('/brand-ambassadors', { params: { limit: 500 } }).then(r => setBrandAmbassadorsList(r.data.data ?? r.data));
    api.get('/parameters/values', { params: { parameter_id: 19 } }).then(r => setCampaignTypes(r.data));
    api.get('/parameters/values', { params: { parameter_id: 20 } }).then(r => setDurationUnits(r.data));
    api.get('/parameters/values', { params: { parameter_id: 21 } }).then(r => setAudiences(r.data));
    api.get('/parameters/values', { params: { parameter_id: 15 } }).then(r => setCountries(r.data));
    api.get('/parameters/values', { params: { parameter_id: 16 } }).then(r => setCounties(r.data));
    api.get('/parameters/values', { params: { parameter_id: 17 } }).then(r => setSubcounties(r.data));
    api.get('/parameters/values', { params: { parameter_id: 8 } }).then(r => setCurrencies(r.data));
    api.get('/parameters/values', { params: { parameter_id: 22 } }).then(r => setPaymentModes(r.data));
  }, [load]);

  const openAdd = async () => {
    setEditing(null);
    setPosterFiles([]); setExistingPosters([]);
    setAttachmentFiles([]); setExistingAttachments([]);
    form.resetFields();
    // Prefill whichever value staff have explicitly marked as default per parameter.
    form.setFieldsValue({
      campaign_type_id:    campaignTypes.find(c => c.is_default)?.id,
      duration_unit_id:    durationUnits.find(u => u.is_default)?.id,
      target_country_id:      countries.find(c => c.is_default)?.id,
      target_county_id:        counties.find(c => c.is_default)?.id,
      target_subcounty_id:  subcounties.find(c => c.is_default)?.id,
    });
    setOpen(true);
    try {
      const r = await api.get('/campaigns/next-no');
      setFileNo(r.data.file_no);
    } catch { setFileNo(null); }
    // Prefill with the current global rate — still just a normal editable
    // field from here; staff can change or clear it per campaign.
    try {
      const r = await api.get('/brand-ambassador-config');
      if (r.data?.brand_ambassador_pay_percentage != null) {
        form.setFieldValue('brand_ambassador_pay_percentage', r.data.brand_ambassador_pay_percentage);
      }
    } catch { /* ignore — field stays blank */ }
  };

  const openEdit = r => {
    setEditing(r);
    setPosterFiles([]); setExistingPosters(parseIds(r.posters));
    setAttachmentFiles([]); setExistingAttachments(parseIds(r.attachments));
    setFileNo(r.file_no);
    form.setFieldsValue({
      advertiser_id: r.advertiser_id,
      campaign_title: r.campaign_title,
      campaign_type_id: r.campaign_type_id,
      description: r.description,
      website_link: r.website_link,
      whatsapp_number: r.whatsapp_number,
      promo_code: r.promo_code,
      duration_value: r.duration_value,
      duration_unit_id: r.duration_unit_id,
      start_date: r.start_date ? dayjs(r.start_date) : undefined,
      target_audience: parseIds(r.target_audience),
      target_country_id: r.target_country_id,
      target_county_id: r.target_county_id,
      target_subcounty_id: r.target_subcounty_id,
      budget: r.budget,
      discount: r.discount,
      brand_ambassador_pay_percentage: r.brand_ambassador_pay_percentage,
      comments: r.comments,
    });
    setOpen(true);
  };

  const openActivity = async campaign => {
    setViewingCampaign(campaign);
    setActivityTab('brand_ambassadors');
    setPendingBrandAmbassadorIds([]);
    setActivityLoading(true);
    try {
      const [a, p, s, e] = await Promise.all([
        api.get(`/campaigns/${campaign.id}/brand-ambassadors`),
        api.get('/payments', { params: { campaign_id: campaign.id, limit: 500 } }),
        api.get('/salaries', { params: { campaign_id: campaign.id, limit: 500 } }),
        api.get('/expenditure', { params: { campaign_id: campaign.id, limit: 500 } }),
      ]);
      setCampaignBrandAmbassadors(a.data);
      setCampaignPayments(p.data.data);
      setCampaignSalaries(s.data.data);
      setCampaignExpenditure(e.data.data);
    } finally { setActivityLoading(false); }
  };

  const assignBrandAmbassadors = async () => {
    if (!pendingBrandAmbassadorIds.length) return message.warning('Select at least one brand ambassador');
    setAssigningBrandAmbassadors(true);
    try {
      const { data } = await api.post(`/campaigns/${viewingCampaign.id}/brand-ambassadors`, { brand_ambassador_ids: pendingBrandAmbassadorIds });
      setCampaignBrandAmbassadors(data);
      setPendingBrandAmbassadorIds([]);
      message.success('Brand Ambassador(s) assigned');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to assign brand ambassador(s)');
    } finally { setAssigningBrandAmbassadors(false); }
  };

  const unassignBrandAmbassador = async brandAmbassadorId => {
    try {
      await api.delete(`/campaigns/${viewingCampaign.id}/brand-ambassadors/${brandAmbassadorId}`);
      setCampaignBrandAmbassadors(prev => prev.filter(a => a.brand_ambassador_id !== brandAmbassadorId));
      message.success('Brand Ambassador removed');
    } catch { message.error('Failed to remove brand ambassador'); }
  };

  const confirmUnassignBrandAmbassador = record => {
    Modal.confirm({
      title: 'Remove this brand ambassador from the campaign?',
      content: `${record.full_name}${record.brand_ambassador_ref_no ? ` (${record.brand_ambassador_ref_no})` : ''} will no longer be assigned to this campaign.`,
      okText: 'Remove',
      okType: 'danger',
      centered: true,
      onOk: () => unassignBrandAmbassador(record.brand_ambassador_id),
    });
  };

  const openDeadline = record => {
    setDeadlineFor(record);
    const source = record.proof_deadline || viewingCampaign?.end_date;
    setDeadlineValue(source ? dayjs(source) : null);
  };

  const saveDeadline = async () => {
    setDeadlineSaving(true);
    try {
      const proof_deadline = deadlineValue ? deadlineValue.format('YYYY-MM-DD') : null;
      await api.put(`/campaigns/${viewingCampaign.id}/brand-ambassadors/${deadlineFor.brand_ambassador_id}/deadline`, { proof_deadline });
      setCampaignBrandAmbassadors(prev => prev.map(a =>
        a.brand_ambassador_id === deadlineFor.brand_ambassador_id ? { ...a, proof_deadline } : a
      ));
      message.success('Proof deadline updated');
      setDeadlineFor(null);
    } catch { message.error('Failed to update proof deadline'); }
    finally { setDeadlineSaving(false); }
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries({
        advertiser_id: vals.advertiser_id, campaign_title: vals.campaign_title,
        campaign_type_id: vals.campaign_type_id ?? '', description: vals.description || '',
        website_link: vals.website_link || '', whatsapp_number: vals.whatsapp_number || '',
        promo_code: vals.promo_code || '', duration_value: vals.duration_value ?? '',
        duration_unit_id: vals.duration_unit_id ?? '', start_date: vals.start_date ? vals.start_date.format('YYYY-MM-DD') : '',
        target_country_id: vals.target_country_id ?? '',
        target_county_id: vals.target_county_id ?? '', target_subcounty_id: vals.target_subcounty_id ?? '',
        budget: vals.budget ?? '', discount: vals.discount ?? '',
        brand_ambassador_pay_percentage: vals.brand_ambassador_pay_percentage ?? '', comments: vals.comments || '',
      }).forEach(([k, v]) => formData.append(k, v));
      formData.append('target_audience', JSON.stringify(vals.target_audience || []));
      formData.append('existing_posters', JSON.stringify(existingPosters));
      formData.append('existing_attachments', JSON.stringify(existingAttachments));
      posterFiles.forEach(f => formData.append('posters', f));
      attachmentFiles.forEach(f => formData.append('attachments', f));

      if (editing) await api.put(`/campaigns/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/campaigns', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      message.success('Saved');
      setOpen(false);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const openProcess = async record => {
    setProcessing(record);
    setTransAction(null);
    setTransNotes('');
    setTransitionList([]);
    setTransLoading(true);
    try {
      const { data: rows } = await api.get(`/campaigns/${record.id}/transitions`);
      setTransitionList(rows);
    } catch { message.error('Failed to load transitions'); }
    finally { setTransLoading(false); }
  };

  const doTransition = async () => {
    if (!transAction) return message.warning('Select an action');
    setMoving(true);
    try {
      await api.post(`/campaigns/${processing.id}/transition`, { transition_id: transAction, notes: transNotes || null });
      message.success('Campaign stage updated');
      setProcessing(null);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Transition failed');
    } finally { setMoving(false); }
  };

  const openPay = async record => {
    setPayingCampaign(record);
    payForm.resetFields();
    const defaultCurrency = currencies.find(c => c.is_default);
    const defaultMode = paymentModes.find(m => m.is_default);
    payForm.setFieldsValue({ payment_date: dayjs(), currency_id: defaultCurrency?.id, payment_mode_id: defaultMode?.id });
    try {
      const r = await api.get('/payments/campaign-balance/' + record.id);
      if (r.data.balance > 0) payForm.setFieldsValue({ amount: r.data.balance });
    } catch { /* no budget set — leave amount blank */ }
    try {
      const r = await api.get('/payments/next-no');
      setPayFileNo(r.data.file_no);
    } catch { setPayFileNo(null); }
  };

  const submitPay = async () => {
    const vals = await payForm.validateFields();
    setPaySaving(true);
    try {
      await api.post('/payments', {
        campaign_id: payingCampaign.id,
        advertiser_id: payingCampaign.advertiser_id,
        ...vals,
        payment_date: vals.payment_date ? vals.payment_date.format('YYYY-MM-DD') : null,
      });
      message.success('Payment recorded');
      setPayingCampaign(null);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to record payment');
    } finally { setPaySaving(false); }
  };

  const openPaySalary = async brandAmbassador => {
    setPayingBrandAmbassador(brandAmbassador);
    salaryForm.resetFields();
    const defaultCurrency = currencies.find(c => c.is_default);
    const defaultMode = paymentModes.find(m => m.is_default);
    salaryForm.setFieldsValue({ payment_date: dayjs(), currency_id: defaultCurrency?.id, payment_mode_id: defaultMode?.id });
    try {
      const r = await api.get('/salaries/balance', { params: { campaign_id: viewingCampaign.id, brand_ambassador_id: brandAmbassador.brand_ambassador_id } });
      if (r.data.balance > 0) salaryForm.setFieldsValue({ amount: Math.round(r.data.balance * 100) / 100 });
    } catch { /* leave amount blank */ }
    try {
      const r = await api.get('/salaries/next-no');
      setSalaryFileNo(r.data.file_no);
    } catch { setSalaryFileNo(null); }
  };

  const submitPaySalary = async () => {
    const vals = await salaryForm.validateFields();
    setSalarySaving(true);
    try {
      await api.post('/salaries', {
        campaign_id: viewingCampaign.id,
        brand_ambassador_id: payingBrandAmbassador.brand_ambassador_id,
        ...vals,
        payment_date: vals.payment_date ? vals.payment_date.format('YYYY-MM-DD') : null,
      });
      message.success('Salary payment recorded');
      setPayingBrandAmbassador(null);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to record salary payment');
    } finally { setSalarySaving(false); }
  };

  const allColumns = [
    { title: 'File No', dataIndex: 'file_no', key: 'file_no', render: v => v ? <Tag color="blue">{v}</Tag> : '—' },
    { title: 'Campaign', dataIndex: 'campaign_title', key: 'title', mobileHeaderSize: 13 },
    { title: 'Advertiser', key: 'advertiser', render: (_, r) => r.advertiser_display_name || '—' },
    { title: 'Type', dataIndex: 'campaign_type_name', key: 'type', mobileExpanded: true, render: v => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Duration', key: 'duration', mobileExpanded: true,
      render: (_, r) => r.duration_value ? `${r.duration_value} ${r.duration_unit_name || ''}` : '—' },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date', mobileExpanded: true, render: dateFmt },
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date', mobileExpanded: true, render: dateFmt },
    { title: 'Budget', dataIndex: 'budget', key: 'budget', mobileExpanded: true, render: v => v != null ? Number(v).toLocaleString() : '—' },
    { title: 'Paid Amount', dataIndex: 'paid_amount', key: 'paid_amount', mobileExpanded: true,
      render: v => <span style={{ color: '#389e0d', fontWeight: 600 }}>{money(v)}</span> },
    { title: 'Balance', dataIndex: 'balance', key: 'balance', mobileExpanded: true,
      render: v => <span style={{ color: '#cf1322', fontWeight: 600 }}>{money(v)}</span> },
    { title: 'Stage', dataIndex: 'stage_name', key: 'stage', mobileExpanded: true, render: (v, r) => <StageTag name={v} color={r.stage_color} /> },
    { title: 'Created On', dataIndex: 'created_on', key: 'created', mobileExpanded: true, render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
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

  const toolbarExtra = (
    <Space>
      <Select
        allowClear
        placeholder="All stages"
        style={{ width: 160 }}
        value={stageFilter || undefined}
        onChange={v => { setStageFilter(v || null); setPage(1); }}
        options={stages.map(s => ({
          value: s.id,
          label: (
            <Space size={6}>
              <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: s.stage_color || '#ccc', flexShrink: 0 }} />
              {s.stage_name}
            </Space>
          ),
        }))}
      />
      {colToggle}
    </Space>
  );

  const selectedTransition = transitionList.find(t => t.transition_id === transAction);
  const selectedTargetCountyId = Form.useWatch('target_county_id', form);
  const subcountiesForTargetCounty = subcounties.filter(s => s.parent_value_id === selectedTargetCountyId);
  const watchedStartDate = Form.useWatch('start_date', form);
  const watchedDurationValue = Form.useWatch('duration_value', form);
  const watchedDurationUnitId = Form.useWatch('duration_unit_id', form);
  const computedEndDate = previewEndDate(watchedStartDate, watchedDurationValue, durationUnits.find(u => u.id === watchedDurationUnitId)?.paramater_value);

  return (
    <>
      <CrudTable
        title="Campaigns"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={async r => {
          try { await api.delete(`/campaigns/${r.id}`); message.success('Deleted'); load(); }
          catch { message.error('Cannot delete'); }
        }}
        onSearch={v => { setSearch(v); setPage(1); }}
        onRefresh={load}
        pagination={{ current: page, total, pageSize: limit, onChange: (p, ps) => { setPage(p); setLimit(ps); }, showTotal: t => `${t} campaigns` }}
        searchPlaceholder="Search by title or file no..."
        extra={toolbarExtra}
        extraActions={record => (
          <>
            <Button type="link" size="small" icon={<DollarOutlined />} onClick={() => openPay(record)} title="Record Payment" />
            <Button type="link" size="small" icon={<UnorderedListOutlined />} onClick={() => openActivity(record)} title="View Activity" />
            <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => openProcess(record)} title="Process" />
          </>
        )}
      />

      <Modal
        title={editing ? 'Edit Campaign' : 'Add Campaign'}
        open={open} onOk={onSave} onCancel={() => setOpen(false)} confirmLoading={saving} centered width={680}
        styles={{ body: { maxHeight: '72vh', overflowY: 'auto', paddingTop: 8, paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical">
          <LabelField label="File No">
            <Input readOnly value={fileNo || '—'} style={{ color: '#1677ff', fontWeight: 600, marginBottom: 20 }} />
          </LabelField>

          <LabelField label="Advertiser" required>
            <Form.Item name="advertiser_id" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Select showSearch optionFilterProp="children">
                {advertisers.map(c => <Select.Option key={c.id} value={c.id}>{c.advertiser_name || `${c.firstname} ${c.lastname}`}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Campaign Title" required>
            <Form.Item name="campaign_title" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Campaign Type">
            <Form.Item name="campaign_type_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children">
                {campaignTypes.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Description">
            <Form.Item name="description" style={{ marginBottom: 20 }}>
              <Input.TextArea rows={3} />
            </Form.Item>
          </LabelField>

          <LabelField label="Website Link" hidden>
            <Form.Item name="website_link" style={{ marginBottom: 20 }}>
              <Input placeholder="https://…" />
            </Form.Item>
          </LabelField>

          <LabelField label="WhatsApp Number">
            <Form.Item name="whatsapp_number" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Promo Code">
            <Form.Item name="promo_code" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <LabelField label="Duration">
                <Form.Item name="duration_value" style={{ marginBottom: 20 }}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </LabelField>
            </div>
            <div style={{ flex: 1 }}>
              <LabelField label="Duration Unit">
                <Form.Item name="duration_unit_id" style={{ marginBottom: 20 }}>
                  <Select allowClear showSearch optionFilterProp="children">
                    {durationUnits.map(u => <Select.Option key={u.id} value={u.id}>{u.paramater_value}</Select.Option>)}
                  </Select>
                </Form.Item>
              </LabelField>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <LabelField label="Start Date">
                <Form.Item name="start_date" style={{ marginBottom: 20 }}>
                  <DatePicker style={{ width: '100%' }} format="D MMM YYYY" />
                </Form.Item>
              </LabelField>
            </div>
            <div style={{ flex: 1 }}>
              <LabelField label="End Date" tooltip="Calculated automatically from Start Date + Duration">
                <Input
                  readOnly
                  value={computedEndDate ? computedEndDate.format('D MMM YYYY') : '—'}
                  style={{ marginBottom: 20, color: '#1677ff', fontWeight: 600 }}
                />
              </LabelField>
            </div>
          </div>

          <LabelField label="Target Audience">
            <Form.Item name="target_audience" style={{ marginBottom: 20 }}>
              <Select mode="multiple" allowClear showSearch optionFilterProp="children">
                {audiences.map(a => <Select.Option key={a.id} value={a.id}>{a.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Target Country">
            <Form.Item name="target_country_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children">
                {countries.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Target County">
            <Form.Item name="target_county_id" style={{ marginBottom: 20 }}>
              <Select
                allowClear showSearch optionFilterProp="children"
                onChange={() => form.setFieldValue('target_subcounty_id', undefined)}
              >
                {counties.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Target Sub-County">
            <Form.Item name="target_subcounty_id" style={{ marginBottom: 20 }}>
              <Select
                allowClear showSearch optionFilterProp="children"
                disabled={!selectedTargetCountyId}
                placeholder={selectedTargetCountyId ? 'Select sub-county' : 'Select a county first'}
              >
                {subcountiesForTargetCounty.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Budget">
            <Form.Item name="budget" style={{ marginBottom: 20 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Discount">
            <Form.Item name="discount" style={{ marginBottom: 20 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Brand Ambassador Pay Percentage">
            <Form.Item
              name="brand_ambassador_pay_percentage"
              style={{ marginBottom: 20 }}
              extra="Leave blank to use the global default (Config → Brand Ambassador Settings)."
            >
              <InputNumber min={0} max={100} step={0.5} addonAfter="%" style={{ width: '100%' }} placeholder="Global default" />
            </Form.Item>
          </LabelField>

          <LabelField label="Comments">
            <Form.Item name="comments" style={{ marginBottom: 20 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </LabelField>

          <LabelField label="Posters">
            <MultiFileUploadField
              existingItems={existingPosters.map(u => ({ url: fileUrl(u), name: u.split('/').pop() }))}
              onRemoveExisting={i => setExistingPosters(prev => prev.filter((_, idx) => idx !== i))}
              files={posterFiles}
              onAddFiles={fs => setPosterFiles(prev => [...prev, ...fs])}
              onRemoveFile={i => setPosterFiles(prev => prev.filter((_, idx) => idx !== i))}
              accept="image/*" imageGrid maxSizeMB={10} maxCount={10}
              hint="JPG, PNG or WEBP · up to 10 images, 10MB each"
            />
          </LabelField>

          <LabelField label="Other Attachments">
            <MultiFileUploadField
              existingItems={existingAttachments.map(u => ({ url: fileUrl(u), name: u.split('/').pop() }))}
              onRemoveExisting={i => setExistingAttachments(prev => prev.filter((_, idx) => idx !== i))}
              files={attachmentFiles}
              onAddFiles={fs => setAttachmentFiles(prev => [...prev, ...fs])}
              onRemoveFile={i => setAttachmentFiles(prev => prev.filter((_, idx) => idx !== i))}
              maxSizeMB={10} maxCount={10}
              hint="Images, PDF, Word, Excel, PowerPoint, CSV, TXT or ZIP · up to 10 files, 10MB each"
            />
          </LabelField>
        </Form>
      </Modal>

      {/* Process — move a campaign through its approval workflow */}
      <Modal
        title={<div style={{ textAlign: 'center', fontWeight: 600, fontSize: 15 }}>{processing?.campaign_title}</div>}
        open={!!processing}
        onCancel={() => setProcessing(null)}
        onOk={doTransition}
        okText="Move Stage"
        okButtonProps={{ disabled: !transAction, loading: moving }}
        centered
        width={420}
      >
        {transLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            <LabelField label="Current Stage">
              <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 11px', background: '#fafafa', minHeight: 32, display: 'flex', alignItems: 'center' }}>
                <StageTag name={processing?.stage_name} color={processing?.stage_color} />
              </div>
            </LabelField>
            <LabelField label="Action" required>
              {transitionList.length === 0 ? (
                <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 11px', color: '#999', fontSize: 13 }}>
                  No transitions available from this stage
                </div>
              ) : (
                <Select
                  placeholder="Select action…"
                  value={transAction}
                  onChange={v => setTransAction(v)}
                  showSearch
                  optionFilterProp="label"
                  style={{ width: '100%' }}
                  options={transitionList.map(t => ({ value: t.transition_id, label: t.action_label?.trim() }))}
                />
              )}
            </LabelField>

            {selectedTransition && (
              <LabelField label="Next Stage">
                <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 11px', background: '#fafafa', minHeight: 32, display: 'flex', alignItems: 'center' }}>
                  <StageTag name={selectedTransition.to_stage_name} color={selectedTransition.to_stage_color} />
                </div>
              </LabelField>
            )}

            <LabelField label="Comment">
              <Input.TextArea
                rows={3}
                placeholder="Optional remarks…"
                value={transNotes}
                onChange={e => setTransNotes(e.target.value)}
                style={{ width: '100%' }}
              />
            </LabelField>
          </div>
        )}
      </Modal>

      {/* Record Payment — for the selected campaign */}
      <Modal
        title="Payment Form"
        open={!!payingCampaign}
        onOk={submitPay}
        onCancel={() => setPayingCampaign(null)}
        confirmLoading={paySaving}
        width={520}
        centered
      >
        <Form form={payForm} layout="vertical">
          <LabelField label="File No">
            <Input readOnly value={payFileNo || '—'} style={{ color: '#1677ff', fontWeight: 600, marginBottom: 20 }} />
          </LabelField>

          <LabelField label="Campaign">
            <div style={{
              border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 11px',
              background: '#fafafa', minHeight: 32, display: 'flex', alignItems: 'center',
              marginBottom: 20, fontSize: 13,
            }}>
              {payingCampaign?.advertiser_display_name} — {payingCampaign?.campaign_title}
            </div>
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

      {/* Pay Salary — for one brand ambassador on a completed campaign */}
      <Modal
        title="Salary Payment Form"
        open={!!payingBrandAmbassador}
        onOk={submitPaySalary}
        onCancel={() => setPayingBrandAmbassador(null)}
        confirmLoading={salarySaving}
        width={520}
        centered
      >
        <Form form={salaryForm} layout="vertical">
          <LabelField label="File No">
            <Input readOnly value={salaryFileNo || '—'} style={{ color: '#1677ff', fontWeight: 600, marginBottom: 20 }} />
          </LabelField>

          <LabelField label="Campaign">
            <div style={{
              border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 11px',
              background: '#fafafa', minHeight: 32, display: 'flex', alignItems: 'center',
              marginBottom: 20, fontSize: 13,
            }}>
              {viewingCampaign?.campaign_title}
            </div>
          </LabelField>

          <LabelField label="Brand Ambassador">
            <div style={{
              border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 11px',
              background: '#fafafa', minHeight: 32, display: 'flex', alignItems: 'center',
              marginBottom: 20, fontSize: 13,
            }}>
              {payingBrandAmbassador?.full_name}{payingBrandAmbassador?.brand_ambassador_ref_no ? ` (${payingBrandAmbassador.brand_ambassador_ref_no})` : ''}
            </div>
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

      {/* Proof Deadline — per-assignment override of the last date a brand
          ambassador may submit posting proof for the campaign */}
      <Modal
        title="Set Proof Deadline"
        open={!!deadlineFor}
        onOk={saveDeadline}
        onCancel={() => setDeadlineFor(null)}
        confirmLoading={deadlineSaving}
        width={420}
        centered
      >
        <LabelField label="Brand Ambassador">
          <div style={{
            border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 11px',
            background: '#fafafa', minHeight: 32, display: 'flex', alignItems: 'center',
            marginBottom: 20, fontSize: 13,
          }}>
            {deadlineFor?.full_name}{deadlineFor?.brand_ambassador_ref_no ? ` (${deadlineFor.brand_ambassador_ref_no})` : ''}
          </div>
        </LabelField>

        <LabelField label="Last Date to Submit Proof">
          <DatePicker
            value={deadlineValue}
            onChange={setDeadlineValue}
            format="D MMM YYYY"
            style={{ width: '100%', marginBottom: 4 }}
            allowClear
          />
        </LabelField>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Defaults to the campaign's end date ({viewingCampaign?.end_date ? dateFmt(viewingCampaign.end_date) : 'not set'}). Clear it to go back to following that default.
        </Typography.Text>
      </Modal>

      {/* View Activity — payments / expenditure recorded for this campaign */}
      <Modal
        title={<div style={{ textAlign: 'center', fontWeight: 600 }}>Activity — {viewingCampaign?.campaign_title ?? ''}</div>}
        open={!!viewingCampaign}
        onCancel={() => setViewingCampaign(null)}
        footer={null}
        width={860}
        centered
      >
        <Tabs
          centered
          activeKey={activityTab}
          onChange={setActivityTab}
          items={[
            {
              key: 'brand_ambassadors',
              label: `Brand Ambassadors (${campaignBrandAmbassadors.length})`,
              children: (
                <ActivityPane>
                  {viewingCampaign?.is_terminal ? (
                    <Alert
                      type="warning" showIcon style={{ marginBottom: 12 }}
                      message={`This campaign is already ${viewingCampaign.stage_name} — brand ambassadors can no longer be assigned to it.`}
                    />
                  ) : (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <Select
                        mode="multiple" showSearch optionFilterProp="label" allowClear
                        placeholder="Select brand ambassador(s) to assign…"
                        style={{ flex: 1 }}
                        value={pendingBrandAmbassadorIds}
                        onChange={setPendingBrandAmbassadorIds}
                        options={brandAmbassadorsList
                          .filter(a => a.status === 'active' && !campaignBrandAmbassadors.some(ca => ca.brand_ambassador_id === a.id))
                          .map(a => ({ value: a.id, label: `${a.full_name}${a.brand_ambassador_ref_no ? ` (${a.brand_ambassador_ref_no})` : ''}` }))}
                      />
                      <Button type="primary" loading={assigningBrandAmbassadors} onClick={assignBrandAmbassadors}>Assign</Button>
                    </div>
                  )}
                  {activityLoading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
                  ) : campaignBrandAmbassadors.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Empty description="No brand ambassadors assigned to this campaign yet" />
                    </div>
                  ) : (
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        dataSource={campaignBrandAmbassadors}
                        columns={[
                          { title: 'Ref No', dataIndex: 'brand_ambassador_ref_no', key: 'ref', render: v => v ? <Tag color="blue">{v}</Tag> : '—' },
                          { title: 'Full Name', dataIndex: 'full_name', key: 'name' },
                          { title: 'Phone', dataIndex: 'phone', key: 'phone' },
                          { title: 'Avg. Views', dataIndex: 'avg_status_views', key: 'views', render: v => v != null ? Number(v).toLocaleString() : '—' },
                          { title: 'Total Views', dataIndex: 'total_views', key: 'total_views',
                            render: v => <span style={{ fontWeight: 600, color: '#1677ff' }}>{Number(v || 0).toLocaleString()}</span> },
                          { title: 'Earnings', dataIndex: 'revenue', key: 'revenue',
                            render: v => <span style={{ fontWeight: 600, color: '#389e0d' }}>{money(Math.round((v || 0) * 100) / 100)}</span> },
                          { title: 'Assigned On', dataIndex: 'assigned_on', key: 'assigned_on', render: dateFmt },
                          { title: 'Proof Deadline', dataIndex: 'proof_deadline', key: 'proof_deadline',
                            render: v => v
                              ? <Tag color="purple">{dateFmt(v)}</Tag>
                              : <Typography.Text type="secondary" style={{ fontSize: 12 }}>Campaign end date</Typography.Text> },
                          { title: '', key: 'actions', render: (_, r) => (
                            <>
                              {viewingCampaign?.stage_name === 'Completed' && (
                                <Button
                                  type="link" size="small" icon={<DollarCircleOutlined />} style={{ color: '#389e0d' }}
                                  onClick={() => openPaySalary(r)} title="Pay Salary"
                                />
                              )}
                              <Button
                                type="link" size="small" icon={<CalendarOutlined />}
                                onClick={() => openDeadline(r)} title="Set Proof Deadline"
                              />
                              <Button
                                type="link" danger size="small" icon={<DeleteOutlined />}
                                onClick={() => confirmUnassignBrandAmbassador(r)} title="Remove"
                              />
                            </>
                          ) },
                        ]}
                        summary={rows => (
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3}><strong>Total</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}><strong>{Number(rows.reduce((s, r) => s + Number(r.avg_status_views || 0), 0)).toLocaleString()}</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={2}><strong style={{ color: '#1677ff' }}>{Number(rows.reduce((s, r) => s + Number(r.total_views || 0), 0)).toLocaleString()}</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={3}><strong style={{ color: '#389e0d' }}>{money(Math.round(rows.reduce((s, r) => s + Number(r.revenue || 0), 0) * 100) / 100)}</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={4} colSpan={3} />
                          </Table.Summary.Row>
                        )}
                      />
                    </div>
                  )}
                </ActivityPane>
              ),
            },
            {
              key: 'payments',
              label: `Revenue (${campaignPayments.length})`,
              children: (
                <ActivityPane>
                  {activityLoading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
                  ) : campaignPayments.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Empty description="No payments for this campaign" />
                    </div>
                  ) : (
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        dataSource={campaignPayments}
                        columns={[
                          { title: 'Ref No', dataIndex: 'file_no', key: 'file_no', render: v => v ? <Tag color="blue">{v}</Tag> : '—' },
                          { title: 'Advertiser', dataIndex: 'advertiser_name', key: 'advertiser' },
                          { title: 'Mode', dataIndex: 'payment_mode_name', key: 'mode', render: v => v ? <Tag>{v}</Tag> : '—' },
                          { title: 'Amount', dataIndex: 'amount', key: 'amount', render: money },
                          { title: 'Date', dataIndex: 'payment_date', key: 'date', render: dateFmt },
                        ]}
                        summary={rows => (
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3}><strong>Total</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}><strong>{money(rows.reduce((s, r) => s + Number(r.amount || 0), 0))}</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={2} />
                          </Table.Summary.Row>
                        )}
                      />
                    </div>
                  )}
                </ActivityPane>
              ),
            },
            {
              key: 'salaries',
              label: `Salaries (${campaignSalaries.length})`,
              children: (
                <ActivityPane>
                  {activityLoading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
                  ) : campaignSalaries.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Empty description="No salaries paid for this campaign" />
                    </div>
                  ) : (
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        dataSource={campaignSalaries}
                        columns={[
                          { title: 'Ref No', dataIndex: 'file_no', key: 'file_no', render: v => v ? <Tag color="blue">{v}</Tag> : '—' },
                          { title: 'Brand Ambassador', dataIndex: 'brand_ambassador_name', key: 'brand_ambassador' },
                          { title: 'Mode', dataIndex: 'payment_mode_name', key: 'mode', render: v => v ? <Tag>{v}</Tag> : '—' },
                          { title: 'Amount', dataIndex: 'amount', key: 'amount', render: money },
                          { title: 'Date', dataIndex: 'payment_date', key: 'date', render: dateFmt },
                        ]}
                        summary={rows => (
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3}><strong>Total</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}><strong>{money(rows.reduce((s, r) => s + Number(r.amount || 0), 0))}</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={2} />
                          </Table.Summary.Row>
                        )}
                      />
                    </div>
                  )}
                </ActivityPane>
              ),
            },
            {
              key: 'expenditure',
              label: `Expenditure (${campaignExpenditure.length})`,
              children: (
                <ActivityPane>
                  {activityLoading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
                  ) : campaignExpenditure.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Empty description="No expenditure for this campaign" />
                    </div>
                  ) : (
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        dataSource={campaignExpenditure}
                        columns={[
                          { title: 'Ref No', dataIndex: 'file_no', key: 'file_no', render: v => v ? <Tag color="blue">{v}</Tag> : '—' },
                          { title: 'Type', dataIndex: 'expenditure_type_name', key: 'type' },
                          { title: 'Amount', dataIndex: 'amount', key: 'amount', render: money },
                          { title: 'Date', dataIndex: 'expenditure_date', key: 'date', render: dateFmt },
                        ]}
                        summary={rows => (
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={2}><strong>Total</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}><strong>{money(rows.reduce((s, r) => s + Number(r.amount || 0), 0))}</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={2} />
                          </Table.Summary.Row>
                        )}
                      />
                    </div>
                  )}
                </ActivityPane>
              ),
            },
            {
              key: 'history',
              label: 'History',
              children: (
                <ActivityPane>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <HistoryPanel entityType="campaign" entityId={viewingCampaign?.id} />
                  </div>
                </ActivityPane>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
}
