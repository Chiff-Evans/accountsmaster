import { useState, useEffect, useCallback } from 'react';
import {
  Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Button, Dropdown,
  message, Typography, Popover, Checkbox, Spin, Space,
} from 'antd';
import dayjs from 'dayjs';
import {
  LockOutlined, UnlockOutlined, StopOutlined,
  MoreOutlined, KeyOutlined, TableOutlined, SwapOutlined, TeamOutlined,
} from '@ant-design/icons';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import NextOfKinModal from './NextOfKinModal';
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

export default function Members() {
  const [data, setData]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [limit, setLimit]       = useState(100);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [editing, setEditing]   = useState(null);
  const [pwdModal, setPwdModal] = useState(false);
  const [hiddenCols, setHiddenCols] = useState(new Set(['email', 'other']));
  const [stages, setStages] = useState([]);
  const [stageFilter, setStageFilter] = useState(null);
  const [form]    = Form.useForm();
  const [pwdForm] = Form.useForm();

  const [positions, setPositions] = useState([]); // parameter text_id 'parties-positions'
  const [genders, setGenders]     = useState([]); // parameter text_id 'genders'
  const [saving, setSaving] = useState(false);

  // Process (workflow transition) modal — Submitted -> Under Review -> Approved/Rejected
  const [kinMember, setKinMember] = useState(null); // member whose next-of-kin grid is open

  const [processing, setProcessing] = useState(null);
  const [transitionList, setTransitionList] = useState([]);
  const [transLoading, setTransLoading] = useState(false);
  const [transAction, setTransAction] = useState(null);
  const [transNotes, setTransNotes] = useState('');
  const [moving, setMoving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/members', { params: { page, limit, search, stage_id: stageFilter || undefined } });
      setData(r.data.data); setTotal(r.data.total);
    } finally { setLoading(false); }
  }, [page, limit, search, stageFilter]);

  useEffect(() => {
    load();
    api.get('/parameters/values', { params: { text_id: 'parties-positions' } }).then(r => setPositions(r.data));
    api.get('/parameters/values', { params: { text_id: 'genders' } }).then(r => setGenders(r.data));
  }, [load]);

  useEffect(() => { api.get('/members/stages').then(r => setStages(r.data)); }, []);

  const onSave = async () => {
    const vals = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        member_name:   vals.member_name,
        position_id:   vals.position_id ?? null,
        id_number:     vals.id_number || null,
        phone:         vals.phone || null,
        email:         vals.email || null,
        gender_id:     vals.gender_id ?? null,
        reg_date:      vals.reg_date ? vals.reg_date.format('YYYY-MM-DD') : null,
        reg_fee:       vals.reg_fee ?? null,
        other_details: vals.other_details || null,
      };
      if (editing) payload.status = vals.status || 'active';

      if (editing) await api.put(`/members/${editing.id}`, payload);
      else await api.post('/members', payload);

      message.success('Saved'); setOpen(false); load();
    } catch (err) { message.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const doAction = async (id, action) => {
    try {
      await api.post(`/members/${id}/action`, { action });
      message.success(`Member ${action}`);
      load();
    } catch { message.error('Action failed'); }
  };

  const resetPwd = async () => {
    const vals = await pwdForm.validateFields();
    try {
      await api.post(`/members/${editing.id}/reset-password`, { new_password: await hashPassword(vals.new_password) });
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
      const { data: rows } = await api.get(`/members/${record.id}/transitions`);
      setTransitionList(rows);
    } catch { message.error('Failed to load transitions'); }
    finally { setTransLoading(false); }
  };

  const doTransition = async () => {
    if (!transAction) return message.warning('Select an action');
    setMoving(true);
    try {
      await api.post(`/members/${processing.id}/transition`, { transition_id: transAction, notes: transNotes || null });
      message.success('Member stage updated');
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
    { title: 'Ref No',   dataIndex: 'member_ref_no', key: 'ref', width: 110,
      render: v => <Tag color="blue">{v}</Tag> },
    { title: 'Name',     dataIndex: 'member_name', key: 'name' },
    { title: 'Position', dataIndex: 'position_name', key: 'position', mobileExpanded: true,
      render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'ID Number', dataIndex: 'id_number', key: 'idno', mobileExpanded: true },
    { title: 'Phone',    dataIndex: 'phone',  key: 'phone', mobileAlign: 'right' },
    { title: 'Email',    dataIndex: 'email',   key: 'email',   mobileExpanded: true,
      render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'Gender',   dataIndex: 'gender_name', key: 'gender', mobileExpanded: true },
    { title: 'Reg Date', dataIndex: 'reg_date', key: 'regdate', mobileExpanded: true,
      render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    { title: 'Reg Fee',  dataIndex: 'reg_fee', key: 'regfee', mobileExpanded: true, align: 'right',
      render: v => v != null ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—' },
    { title: 'Other Details', dataIndex: 'other_details', key: 'other', mobileExpanded: true, ellipsis: true },
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

  return (
    <>
      <CrudTable
        title="Members Management"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={() => {
          setEditing(null); form.resetFields();
          // Prefill whichever values staff have explicitly marked as default per parameter.
          form.setFieldsValue({
            position_id: positions.find(p => p.is_default)?.id,
            gender_id:   genders.find(g => g.is_default)?.id,
            reg_date:    dayjs(),
          });
          setOpen(true);
        }}
        onEdit={r => {
          setEditing(r);
          form.setFieldsValue({ ...r, reg_date: r.reg_date ? dayjs(r.reg_date) : null });
          setOpen(true);
        }}
        onDelete={async r => {
          try { await api.delete(`/members/${r.id}`); message.success('Deleted'); load(); }
          catch { message.error('Cannot delete'); }
        }}
        onSearch={v => { setSearch(v); setPage(1); }}
        onRefresh={load}
        pagination={{
          current: page, total, pageSize: limit,
          onChange: (p, ps) => { setPage(p); setLimit(ps); },
          showTotal: t => `${t} members`,
        }}
        extra={toolbarExtra}
        searchPlaceholder="Search by name, ID number, phone, email, ref no..."
        extraActions={record => (
          <>
            <Button type="link" size="small" icon={<TeamOutlined />} onClick={() => setKinMember(record)} title="Next of Kin" />
            <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => openProcess(record)} title="Process" />
          </>
        )}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={editing ? 'Edit Member' : 'Member Registration'}
        open={open} onOk={onSave} onCancel={() => setOpen(false)} confirmLoading={saving} centered width={640}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingTop: 8, paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical">
          <LabelField label="Name" required>
            <Form.Item name="member_name" rules={[{ required: true, message: 'Name is required' }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Position">
            <Form.Item name="position_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children" placeholder="Select Position">
                {positions.map(p => <Select.Option key={p.id} value={p.id}>{p.paramater_value}</Select.Option>)}
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
            <Form.Item name="email" rules={[{ type: 'email' }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Gender">
            <Form.Item name="gender_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="children" placeholder="Select Gender">
                {genders.map(g => <Select.Option key={g.id} value={g.id}>{g.paramater_value}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Reg Date">
            <Form.Item name="reg_date" style={{ marginBottom: 20 }}>
              <DatePicker style={{ width: '100%' }} format="D MMM YYYY" />
            </Form.Item>
          </LabelField>

          <LabelField label="Reg Fee">
            <Form.Item name="reg_fee" style={{ marginBottom: 20 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Other Details">
            <Form.Item name="other_details" style={{ marginBottom: 20 }}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </LabelField>

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

        </Form>
      </Modal>

      <NextOfKinModal member={kinMember} onClose={() => setKinMember(null)} />

      {/* Reset Password Modal */}
      <Modal
        title="Reset Member Password"
        open={pwdModal} onOk={resetPwd} onCancel={() => setPwdModal(false)} centered
      >
        <Typography.Text>
          Resetting password for: <strong>{editing?.username || editing?.member_name || `${editing?.firstname} ${editing?.lastname}`}</strong>
        </Typography.Text>
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 20 }}>
          <LabelField label="New Password" required>
            <Form.Item name="new_password" rules={[{ required: true, min: 6, message: 'Min 6 characters' }]} style={{ marginBottom: 0 }}>
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>

      {/* Process — move a member through its registration-approval workflow */}
      <Modal
        title={<div style={{ textAlign: 'center', fontWeight: 600, fontSize: 15 }}>{processing?.member_name}</div>}
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
