import { useState, useEffect, useCallback } from 'react';
import {
  Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Button, Dropdown,
  message, Typography, Popover, Checkbox, Spin, Space, Radio, Switch,
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
  const [hiddenCols, setHiddenCols] = useState(new Set(['email', 'other', 'idno', 'regfee', 'gender']));
  const [stages, setStages] = useState([]);
  const [stageFilter, setStageFilter] = useState(null);
  const [form]    = Form.useForm();
  // Interest / deductions switches only apply to internal accounts.
  const isHumanWatch = Form.useWatch('is_human', form);
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
        is_human:      vals.is_human !== false,
        // Only internal accounts can be a Group Fund source (the API enforces it too).
        is_interest_account:   vals.is_human === false && !!vals.is_interest_account,
        is_deductions_account: vals.is_human === false && !!vals.is_deductions_account,
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

  const savePortalAccess = async () => {
    const vals = await pwdForm.validateFields();
    try {
      await api.post(`/members/${editing.id}/portal-access`, {
        username: vals.username,
        new_password: vals.new_password ? await hashPassword(vals.new_password) : undefined,
      });
      message.success('Portal access updated'); setPwdModal(false); load();
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
      { key: 'reset', label: 'Portal Access', icon: <KeyOutlined /> },
    ],
    onClick: ({ key }) => {
      if (key === 'reset') {
        setEditing(record);
        pwdForm.resetFields();
        // Suggest a username from the email for members who don't have one yet.
        pwdForm.setFieldsValue({ username: record.username || record.email?.split('@')[0] || '' });
        setPwdModal(true);
      }
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
            is_human:    true,
            is_interest_account:   false,
            is_deductions_account: false,
          });
          setOpen(true);
        }}
        onEdit={r => {
          setEditing(r);
          form.setFieldsValue({
            ...r,
            reg_date: r.reg_date ? dayjs(r.reg_date) : null,
            is_human: r.is_human !== 0,
            is_interest_account: !!r.is_interest_account,
            is_deductions_account: !!r.is_deductions_account,
          });
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

          {/* Stored as members.is_human: Yes = a real member, No = an internal account. */}
          <LabelField label="Rates and Targets Apply">
            <Form.Item
              name="is_human"
              extra="Choose No for accounts that — contribution rates and targets won't apply, and nothing is auto-calculated for their transactions."
              style={{ marginBottom: 20 }}
            >
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>
          </LabelField>

          {/* Internal accounts can be the source of the portal's Group Fund figures. */}
          {isHumanWatch === false && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
              <Form.Item
                name="is_interest_account"
                valuePropName="checked"
                label="Interest Account"
                tooltip="Its deposits are the Interest figure members see in the portal, and its transactions make up the Interest statement."
                style={{ marginBottom: 0 }}
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="is_deductions_account"
                valuePropName="checked"
                label="Deductions Account"
                tooltip="Its withdrawals are the Deductions / Taxes figure members see in the portal, and its transactions make up that statement."
                style={{ marginBottom: 0 }}
              >
                <Switch />
              </Form.Item>
            </div>
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

        </Form>
      </Modal>

      <NextOfKinModal member={kinMember} onClose={() => setKinMember(null)} />

      {/* Portal Access Modal — member portal username + password */}
      <Modal
        title="Members Portal Access"
        open={pwdModal} onOk={savePortalAccess} onCancel={() => setPwdModal(false)} centered
      >
        <Typography.Text>
          Portal login for: <strong>{editing?.member_name}</strong>
        </Typography.Text>
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 20 }}>
          <LabelField label="Username" required>
            <Form.Item name="username" rules={[{ required: true, message: 'Username is required' }]} style={{ marginBottom: 20 }}>
              <Input autoComplete="off" />
            </Form.Item>
          </LabelField>
          <LabelField label={editing?.has_password ? 'New Password' : 'Password'} required={!editing?.has_password}>
            <Form.Item
              name="new_password"
              rules={[
                { required: !editing?.has_password, message: 'Set a password to give portal access' },
                { min: 6, message: 'Min 6 characters' },
              ]}
              extra={editing?.has_password ? 'Leave blank to keep the current password' : null}
              style={{ marginBottom: 0 }}
            >
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
