import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Space, message } from 'antd';
import dayjs from 'dayjs';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

const fmtAmount = v => v != null ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
const fmtDate = v => v ? dayjs(v).format('D MMM YYYY') : '—';

export default function Transactions() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]); // parameter text_id 'transaction-types'

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileNo, setFileNo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/transactions', {
        params: { page, limit, search, member_id: memberFilter || undefined, transaction_type_id: typeFilter || undefined },
      });
      setData(r.data.data); setTotal(r.data.total); setTotalAmount(r.data.total_amount);
    } finally { setLoading(false); }
  }, [page, limit, search, memberFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get('/members', { params: { limit: 1000 } }).then(r => setMembers(r.data.data ?? r.data));
    api.get('/parameters/values', { params: { text_id: 'transaction-types' } }).then(r => setTransactionTypes(r.data));
  }, []);

  const openAdd = async () => {
    setEditing(null);
    form.resetFields();
    // Prefill today's date and whichever Transaction Type staff have marked as default.
    form.setFieldsValue({
      transaction_date: dayjs(),
      transaction_type_id: transactionTypes.find(t => t.is_default)?.id,
    });
    setOpen(true);
    try {
      const r = await api.get('/transactions/next-no');
      setFileNo(r.data.file_no);
    } catch { setFileNo(null); }
  };

  const openEdit = r => {
    setEditing(r);
    setFileNo(r.file_no);
    form.setFieldsValue({
      member_id: r.member_id,
      transaction_type_id: r.transaction_type_id,
      amount: r.amount != null ? Number(r.amount) : null,
      from_date: r.from_date ? dayjs(r.from_date) : null,
      to_date: r.to_date ? dayjs(r.to_date) : null,
      transaction_date: r.transaction_date ? dayjs(r.transaction_date) : null,
      other_details: r.other_details,
    });
    setOpen(true);
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    const toDay = d => d ? d.format('YYYY-MM-DD') : null;
    const payload = {
      ...vals,
      from_date: toDay(vals.from_date),
      to_date: toDay(vals.to_date),
      transaction_date: toDay(vals.transaction_date),
    };
    setSaving(true);
    try {
      if (editing) await api.put(`/transactions/${editing.id}`, payload);
      else await api.post('/transactions', payload);
      message.success('Saved');
      setOpen(false);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const columns = [
    { title: 'File No', dataIndex: 'file_no', key: 'file_no', render: v => v ? <Tag color="blue">{v}</Tag> : null },
    { title: 'Member', dataIndex: 'member_name', key: 'member' },
    { title: 'Type', dataIndex: 'transaction_type_name', key: 'type', mobileExpanded: true, render: v => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right', mobileAlign: 'right', render: fmtAmount },
    { title: 'From', dataIndex: 'from_date', key: 'from', mobileExpanded: true, render: fmtDate },
    { title: 'To', dataIndex: 'to_date', key: 'to', mobileExpanded: true, render: fmtDate },
    { title: 'Date', dataIndex: 'transaction_date', key: 'date', mobileExpanded: true, render: fmtDate },
    { title: 'Other Details', dataIndex: 'other_details', key: 'other', mobileExpanded: true, ellipsis: true },
  ];

  const memberOptions = members.map(m => ({
    value: m.id,
    label: m.member_ref_no ? `${m.member_name} (${m.member_ref_no})` : m.member_name,
  }));
  const typeOptions = transactionTypes.map(t => ({ value: t.id, label: t.paramater_value }));

  const toolbarExtra = (
    <Space wrap>
      <Select
        allowClear showSearch optionFilterProp="label"
        placeholder="All members"
        style={{ width: 180 }}
        value={memberFilter || undefined}
        onChange={v => { setMemberFilter(v || null); setPage(1); }}
        options={memberOptions}
      />
      <Select
        allowClear
        placeholder="All types"
        style={{ width: 140 }}
        value={typeFilter || undefined}
        onChange={v => { setTypeFilter(v || null); setPage(1); }}
        options={typeOptions}
      />
    </Space>
  );

  return (
    <>
      <CrudTable
        title="Transactions"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={async r => {
          try { await api.delete(`/transactions/${r.id}`); message.success('Deleted'); load(); }
          catch { message.error('Cannot delete'); }
        }}
        onSearch={v => { setSearch(v); setPage(1); }}
        onRefresh={load}
        extra={toolbarExtra}
        pagination={{
          current: page, total, pageSize: limit,
          onChange: (p, ps) => { setPage(p); setLimit(ps); },
          showTotal: t => `${t} transactions · Total ${fmtAmount(totalAmount)}`,
        }}
        searchPlaceholder="Search by file no, member or details..."
      />

      <Modal
        title={editing ? 'Edit Transaction' : 'Record Transaction'}
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

          <LabelField label="Member" required>
            <Form.Item name="member_id" rules={[{ required: true, message: 'Member is required' }]} style={{ marginBottom: 20 }}>
              <Select showSearch optionFilterProp="label" placeholder="Select Member" options={memberOptions} />
            </Form.Item>
          </LabelField>

          <LabelField label="Transaction Type">
            <Form.Item name="transaction_type_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="label" placeholder="Select Transaction Type" options={typeOptions} />
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

          <LabelField label="From Date">
            <Form.Item name="from_date" style={{ marginBottom: 20 }}>
              <DatePicker style={{ width: '100%' }} format="D MMM YYYY" />
            </Form.Item>
          </LabelField>

          <LabelField label="To Date">
            <Form.Item
              name="to_date"
              dependencies={['from_date']}
              rules={[({ getFieldValue }) => ({
                validator(_, value) {
                  const from = getFieldValue('from_date');
                  if (!value || !from || !value.isBefore(from, 'day')) return Promise.resolve();
                  return Promise.reject(new Error('To Date cannot be before From Date'));
                },
              })]}
              style={{ marginBottom: 20 }}
            >
              <DatePicker style={{ width: '100%' }} format="D MMM YYYY" />
            </Form.Item>
          </LabelField>

          <LabelField label="Transaction Date" required>
            <Form.Item name="transaction_date" rules={[{ required: true, message: 'Transaction date is required' }]} style={{ marginBottom: 20 }}>
              <DatePicker style={{ width: '100%' }} format="D MMM YYYY" />
            </Form.Item>
          </LabelField>

          <LabelField label="Other Details">
            <Form.Item name="other_details" style={{ marginBottom: 0 }}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>
    </>
  );
}
