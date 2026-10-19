import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal, Form, Input, Select, Tag, Button, Dropdown,
  message, Typography, Popover, Checkbox, Spin, Space,
} from 'antd';
import {
  LockOutlined, UnlockOutlined, StopOutlined,
  MoreOutlined, KeyOutlined, StarFilled, TableOutlined, SwapOutlined,
} from '@ant-design/icons';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import ImageUploadField from '../../components/common/ImageUploadField';
import api from '../../api';
import { hashPassword } from '../../utils/crypto';

const STATUS_COLOR = {
  active:    'green',
  inactive:  'default',
  locked:    'orange',
  suspended: 'red',
  revoked:   'volcano',
};

function StageTag({ name, color }) {
  if (!name) return <Typography.Text type="secondary">—</Typography.Text>;
  return <Tag color={color || undefined}>{name}</Tag>;
}

export default function Advertisers() {
  const [data, setData]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [limit, setLimit]       = useState(100);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [editing, setEditing]   = useState(null);
  const [pwdModal, setPwdModal] = useState(false);
  const [hiddenCols, setHiddenCols] = useState(new Set(['email']));
  const [stages, setStages] = useState([]);
  const [stageFilter, setStageFilter] = useState(null);
  const [form]    = Form.useForm();
  const [pwdForm] = Form.useForm();
  const usernameTouched = useRef(false);

  const [advertiserTypes, setAdvertiserTypes] = useState([]); // parameter_id 12
  const [industries, setIndustries]   = useState([]); // parameter_id 14
  const [countries, setCountries]     = useState([]); // parameter_id 15
  const [counties, setCounties]       = useState([]); // parameter_id 16
  const [subcounties, setSubcounties] = useState([]); // parameter_id 17

  const [preview, setPreview]           = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Process (workflow transition) modal — Submitted -> Under Review -> Approved/Rejected
  const [processing, setProcessing] = useState(null);
  const [transitionList, setTransitionList] = useState([]);
  const [transLoading, setTransLoading] = useState(false);
  const [transAction, setTransAction] = useState(null);
  const [transNotes, setTransNotes] = useState('');
  const [moving, setMoving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/advertisers', { params: { page, limit, search, stage_id: stageFilter || undefined } });
      setData(r.data.data); setTotal(r.data.total);
    } finally { setLoading(false); }
  }, [page, limit, search, stageFilter]);

  useEffect(() => {
    load();
    api.get('/parameters/values', { params: { parameter_id: 12 } }).then(r => setAdvertiserTypes(r.data));
    api.get('/parameters/values', { params: { parameter_id: 14 } }).then(r => setIndustries(r.data));
    api.get('/parameters/values', { params: { parameter_id: 15 } }).then(r => setCountries(r.data));
    api.get('/parameters/values', { params: { parameter_id: 16 } }).then(r => setCounties(r.data));
    api.get('/parameters/values', { params: { parameter_id: 17 } }).then(r => setSubcounties(r.data));
  }, [load]);

  useEffect(() => { api.get('/advertisers/stages').then(r => setStages(r.data)); }, []);

  const onSave = async () => {
    const vals = await form.validateFields();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('advertiser_type_id', vals.advertiser_type_id ?? '');
      formData.append('advertiser_name', vals.advertiser_name);
      formData.append('industry_id', vals.industry_id ?? '');
      formData.append('country_id', vals.country_id ?? '');
      formData.append('county_id', vals.county_id ?? '');
      formData.append('subcounty_id', vals.subcounty_id ?? '');
      formData.append('gender', vals.gender || '');
      formData.append('phone', vals.phone || '');
      formData.append('email', vals.email || '');
      formData.append('username', vals.username || '');
      if (vals.password) formData.append('password', await hashPassword(vals.password));
      if (editing) formData.append('status', vals.status || 'active');
      if (selectedFile) formData.append('logo', selectedFile);

      if (editing) await api.put(`/advertisers/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/advertisers', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      message.success('Saved'); setOpen(false); load();
    } catch (err) { message.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const doAction = async (id, action) => {
    try {
      await api.post(`/advertisers/${id}/action`, { action });
      message.success(`Advertiser ${action}`);
      load();
    } catch { message.error('Action failed'); }
  };

  const resetPwd = async () => {
    const vals = await pwdForm.validateFields();
    try {
      await api.post(`/advertisers/${editing.id}/reset-password`, { new_password: await hashPassword(vals.new_password) });
      message.success('Password reset'); setPwdModal(false);
    } catch { message.error('Failed'); }
  };

  const openProcess = async record => {
    setProcessing(record);
    setTransAction(null);
    setTransNotes('');
    setTransitionList([]);
    setTransLoading(true);
    try {
      const { data: rows } = await api.get(`/advertisers/${record.id}/transitions`);
      setTransitionList(rows);
    } catch { message.error('Failed to load transitions'); }
    finally { setTransLoading(false); }
  };

  const doTransition = async () => {
    if (!transAction) return message.warning('Select an action');
    setMoving(true);
    try {
      await api.post(`/advertisers/${processing.id}/transition`, { transition_id: transAction, notes: transNotes || null });
      message.success('Advertiser stage updated');
      setProcessing(null);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Transition failed');
    } finally { setMoving(false); }
  };

  const getActionMenu = record => ({
    items: [
      record.status === 'active'
        ? { key: 'locked',    label: 'Lock Account', icon: <LockOutlined /> }
        : { key: 'active',    label: 'Activate',     icon: <UnlockOutlined /> },
      { key: 'suspended', label: 'Suspend', icon: <StopOutlined />, danger: true },
      { key: 'revoked',   label: 'Revoke',  icon: <StopOutlined />, danger: true },
      { type: 'divider' },
      { key: 'reset', label: 'Reset Password', icon: <KeyOutlined /> },
    ],
    onClick: ({ key }) => {
      if (key === 'reset') { setEditing(record); pwdForm.resetFields(); setPwdModal(true); }
      else doAction(record.id, key);
    },
  });

  const allColumns = [
    { title: 'Ref No',   dataIndex: 'advertiser_ref_no', key: 'ref', width: 110,
      render: v => <Tag color="blue">{v}</Tag> },
    { title: 'Name',     key: 'name', render: (_, r) => r.advertiser_name || `${r.firstname} ${r.lastname}` },
    { title: 'Type',     dataIndex: 'advertiser_type_name', key: 'type', mobileExpanded: true,
      render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'Industry', dataIndex: 'industry_name', key: 'industry', mobileExpanded: true,
      render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'Phone',    dataIndex: 'phone',  key: 'phone', mobileAlign: 'right' },
    { title: 'Username', dataIndex: 'username', key: 'user', mobileExpanded: true,
      render: v => v ? <Tag>{v}</Tag> : <Typography.Text type="secondary">—</Typography.Text> },
    { title: 'Email',    dataIndex: 'email',   key: 'email',   mobileExpanded: true,
      render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'Points',   dataIndex: 'loyalty_points', key: 'pts', mobileExpanded: true,
      render: v => v > 0
        ? <Tag color="gold" icon={<StarFilled />}>{Number(v).toLocaleString()} pts</Tag>
        : <Typography.Text type="secondary">—</Typography.Text> },
    { title: 'Stage',    dataIndex: 'stage_name', key: 'stage', mobileExpanded: true,
      render: (v, r) => <StageTag name={v} color={r.stage_color} /> },
    { title: 'Status',   dataIndex: 'status',  key: 'status',  mobileExpanded: true,
      render: v => <Tag color={STATUS_COLOR[v] || 'default'}>{v}</Tag> },
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
  const selectedCountyId = Form.useWatch('county_id', form);
  const subcountiesForCounty = subcounties.filter(s => s.parent_value_id === selectedCountyId);

  return (
    <>
      <CrudTable
        title="Advertiser Management"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={() => {
          setEditing(null); form.resetFields();
          setSelectedFile(null); setPreview(null);
          usernameTouched.current = false;
          // Prefill whichever value staff have explicitly marked as default per parameter.
          form.setFieldsValue({
            advertiser_type_id: advertiserTypes.find(c => c.is_default)?.id,
            industry_id:    industries.find(i => i.is_default)?.id,
            country_id:     countries.find(c => c.is_default)?.id,
            county_id:       counties.find(c => c.is_default)?.id,
            subcounty_id: subcounties.find(c => c.is_default)?.id,
          });
          setOpen(true);
        }}
        onEdit={r => {
          setEditing(r);
          setSelectedFile(null); setPreview(r.logo_url || null);
          form.setFieldsValue({ ...r, password: undefined });
          usernameTouched.current = true; // existing record — don't overwrite username
          setOpen(true);
        }}
        onDelete={async r => {
          try { await api.delete(`/advertisers/${r.id}`); message.success('Deleted'); load(); }
          catch { message.error('Cannot delete'); }
        }}
        onSearch={v => { setSearch(v); setPage(1); }}
        onRefresh={load}
        pagination={{
          current: page, total, pageSize: limit,
          onChange: (p, ps) => { setPage(p); setLimit(ps); },
          showTotal: t => `${t} advertisers`,
        }}
        extra={toolbarExtra}
        searchPlaceholder="Search by name, phone, email, username..."
        extraActions={record => (
          <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => openProcess(record)} title="Process" />
        )}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={editing ? 'Edit Advertiser' : 'Add Advertiser'}
        open={open} onOk={onSave} onCancel={() => setOpen(false)} confirmLoading={saving} centered width={640}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingTop: 8, paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical">
          <LabelField label="Advertiser Type">
            <Form.Item name="advertiser_type_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children">
                {advertiserTypes.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Advertiser Name" required>
            <Form.Item name="advertiser_name" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input placeholder="Company or individual name" />
            </Form.Item>
          </LabelField>

          <LabelField label="Industry">
            <Form.Item name="industry_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children">
                {industries.map(i => <Select.Option key={i.id} value={i.id}>{i.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Country">
            <Form.Item name="country_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children">
                {countries.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="County">
            <Form.Item name="county_id" style={{ marginBottom: 20 }}>
              <Select
                allowClear showSearch optionFilterProp="children"
                onChange={() => form.setFieldValue('subcounty_id', undefined)}
              >
                {counties.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Sub-County">
            <Form.Item name="subcounty_id" style={{ marginBottom: 20 }}>
              <Select
                allowClear showSearch optionFilterProp="children"
                disabled={!selectedCountyId}
                placeholder={selectedCountyId ? 'Select sub-county' : 'Select a county first'}
              >
                {subcountiesForCounty.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
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
              <Input
                onChange={e => {
                  if (usernameTouched.current) return;
                  const prefix = e.target.value.split('@')[0];
                  form.setFieldValue('username', prefix);
                }}
              />
            </Form.Item>
          </LabelField>

          <LabelField label="Username (for portal access)">
            <Form.Item name="username" style={{ marginBottom: 20 }}>
              <Input
                placeholder="Optional — leave blank if no login needed"
                autoComplete="off"
                onChange={() => { usernameTouched.current = true; }}
              />
            </Form.Item>
          </LabelField>

          {!editing && (
            <LabelField label="Password">
              <Form.Item
                name="password"
                style={{ marginBottom: 20 }}
                extra="Leave blank to use default: Password@12345"
              >
                <Input.Password autoComplete="new-password" placeholder="Default:" />
              </Form.Item>
            </LabelField>
          )}

          {editing && (
            <LabelField label="Status">
              <Form.Item name="status" style={{ marginBottom: 20 }}>
                <Select showSearch optionFilterProp="children">
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                  <Select.Option value="locked">Locked</Select.Option>
                  <Select.Option value="suspended">Suspended</Select.Option>
                  <Select.Option value="revoked">Revoked</Select.Option>
                </Select>
              </Form.Item>
            </LabelField>
          )}

          <LabelField label="Logo">
            <ImageUploadField
              value={preview}
              onChange={file => { setSelectedFile(file); setPreview(URL.createObjectURL(file)); }}
              onRemove={selectedFile ? () => { setSelectedFile(null); setPreview(editing?.logo_url || null); } : null}
              hint="JPG, PNG or WEBP · Max 5MB"
            />
          </LabelField>
        </Form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        title="Reset Advertiser Password"
        open={pwdModal} onOk={resetPwd} onCancel={() => setPwdModal(false)} centered
      >
        <Typography.Text>
          Resetting password for: <strong>{editing?.username || editing?.advertiser_name || `${editing?.firstname} ${editing?.lastname}`}</strong>
        </Typography.Text>
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 20 }}>
          <LabelField label="New Password" required>
            <Form.Item name="new_password" rules={[{ required: true, min: 6, message: 'Min 6 characters' }]} style={{ marginBottom: 0 }}>
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>

      {/* Process — move an advertiser through its registration-approval workflow */}
      <Modal
        title={<div style={{ textAlign: 'center', fontWeight: 600, fontSize: 15 }}>{processing?.advertiser_name}</div>}
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
    </>
  );
}
