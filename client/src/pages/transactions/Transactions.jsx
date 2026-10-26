import { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Space, Alert, Checkbox, message } from 'antd';
import dayjs from 'dayjs';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

const fmtAmount = v => v != null ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
const fmtDate = v => v ? dayjs(v).format('D MMM YYYY') : '—';
const fmtUnits = n => Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

// Credit carried between deposits: positive = credit, negative = arrears.
const CreditText = ({ value }) => {
  const v = Number(value || 0);
  if (Math.abs(v) < 0.005) return <span>{fmtAmount(0)}</span>;
  return v > 0
    ? <span style={{ color: '#389e0d' }}>{fmtAmount(v)} </span>
    : <span style={{ color: '#cf1322' }}>{fmtAmount(-v)} </span>;
};

// Where the suggested From Date came from (see /transactions/period-suggestion).
const BASIS_TEXT = {
  last_transaction: s => `last cover ended on (${fmtDate(s.last_to_date)})`,
  reg_date:         () => 'their registration date (no earlier cover)',
  rate_start:       () => "the active rate's start date (no earlier cover or reg date)",
  entered:          () => 'date you entered',
};

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

  // Auto From/To dates for deposits, from the member's last cover + the
  // active contribution rate. Debounced; a newer request wins over older ones.
  const [suggestion, setSuggestion] = useState(null);  // API response, or { error }
  const [suggesting, setSuggesting] = useState(false);
  const suggestTimer = useRef(null);
  const suggestSeq = useRef(0);
  // True once staff type their own From Date: recalculations then work from
  // it instead of replacing it, until the member/type changes or it's cleared.
  const fromEntered = useRef(false);

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

  const resetSuggestion = () => {
    clearTimeout(suggestTimer.current);
    suggestSeq.current += 1; // drop any in-flight response
    fromEntered.current = false;
    setSuggestion(null); setSuggesting(false);
  };

  const isDepositType = typeId => /^deposit/i.test(transactionTypes.find(t => t.id === typeId)?.paramater_value || '');

  const requestSuggestion = () => {
    clearTimeout(suggestTimer.current);
    const { member_id, amount, transaction_type_id, is_migrated, from_date } =
      form.getFieldsValue(['member_id', 'amount', 'transaction_type_id', 'is_migrated', 'from_date']);
    const enteredFrom = fromEntered.current && from_date ? from_date.format('YYYY-MM-DD') : undefined;
    // Only deposits buy cover; withdrawals and other types keep their dates as entered.
    // Migrated records are history keyed in as-is: nothing is calculated.
    // A member alone is enough for the From Date; the amount adds the To Date.
    if (is_migrated || !member_id || !isDepositType(transaction_type_id)) {
      suggestSeq.current += 1;
      setSuggestion(null); setSuggesting(false);
      return;
    }
    // Internal accounts (interest, taxes, ...): rates and targets don't apply,
    // so nothing is calculated — just say so.
    if (members.find(m => m.id === member_id)?.is_human === 0) {
      suggestSeq.current += 1;
      setSuggestion({ internal: true }); setSuggesting(false);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      const seq = ++suggestSeq.current;
      setSuggesting(true);
      try {
        const { data } = await api.get('/transactions/period-suggestion', {
          params: { member_id, amount: amount > 0 ? amount : undefined, exclude_id: editing?.id, from_date: enteredFrom },
        });
        if (seq !== suggestSeq.current) return;
        setSuggestion(data);
        // From Date whenever it could be worked out. To Date once an amount was
        // priced — and cleared while there's no amount, so a stale one can't linger.
        const next = {};
        // A hand-typed From Date is the input here, never overwritten.
        if (data.from_date && !enteredFrom) next.from_date = dayjs(data.from_date);
        if (!(amount > 0)) next.to_date = null;
        else if (data.available) next.to_date = data.to_date ? dayjs(data.to_date) : null;
        form.setFieldsValue(next);
        if ('to_date' in next || 'from_date' in next) form.validateFields(['to_date']).catch(() => {});
      } catch (err) {
        if (seq === suggestSeq.current) setSuggestion({ error: err.response?.data?.message || 'Could not work out the dates' });
      } finally {
        if (seq === suggestSeq.current) setSuggesting(false);
      }
    }, 400);
  };

  // Clean up a pending timer if the page unmounts mid-debounce.
  useEffect(() => () => clearTimeout(suggestTimer.current), []);

  const openAdd = async () => {
    setEditing(null);
    resetSuggestion();
    form.resetFields();
    // Prefill today's date and whichever Transaction Type staff have marked as default.
    form.setFieldsValue({
      transaction_date: dayjs(),
      transaction_type_id: transactionTypes.find(t => t.is_default)?.id,
      is_migrated: false,
    });
    setOpen(true);
    try {
      const r = await api.get('/transactions/next-no');
      setFileNo(r.data.file_no);
    } catch { setFileNo(null); }
  };

  const openEdit = r => {
    setEditing(r);
    resetSuggestion();
    setFileNo(r.file_no);
    form.setFieldsValue({
      member_id: r.member_id,
      transaction_type_id: r.transaction_type_id,
      amount: r.amount != null ? Number(r.amount) : null,
      from_date: r.from_date ? dayjs(r.from_date) : null,
      to_date: r.to_date ? dayjs(r.to_date) : null,
      transaction_date: r.transaction_date ? dayjs(r.transaction_date) : null,
      other_details: r.other_details,
      is_migrated: !!r.is_migrated,
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
    { title: 'File No', dataIndex: 'file_no', key: 'file_no',
      render: (v, r) => (
        <Space size={4} wrap>
          {v && <Tag color="blue" style={{ margin: 0 }}>{v}</Tag>}
          {!!r.is_migrated && <Tag color="purple" style={{ margin: 0 }}>Migrated</Tag>}
        </Space>
      ) },
    { title: 'Member', dataIndex: 'member_name', key: 'member' },
    { title: 'Type', dataIndex: 'transaction_type_name', key: 'type', mobileExpanded: true,
      // Deposits green, withdrawals dark red (matched by name, like the server does).
      render: v => !v ? '—'
        : /^deposit/i.test(v) ? <Tag color="#389e0d">{v}</Tag>
        : /^withdraw/i.test(v) ? <Tag color="#a8071a">{v}</Tag>
        : <Tag>{v}</Tag> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right', mobileAlign: 'right', render: fmtAmount },
    { title: 'From', dataIndex: 'from_date', key: 'from', mobileExpanded: true, render: fmtDate },
    { title: 'To', dataIndex: 'to_date', key: 'to', mobileExpanded: true, render: fmtDate },
    { title: 'Date', dataIndex: 'transaction_date', key: 'date', mobileExpanded: true, render: fmtDate },
    { title: 'Rate', key: 'rate', align: 'right', mobileExpanded: true,
      render: (_, r) => r.rate_amount != null ? `${fmtAmount(r.rate_amount)} / ${r.rate_unit}` : '—' },
    { title: 'Credit C/F', dataIndex: 'credit_carried_forward', key: 'cf', align: 'right', mobileExpanded: true,
      render: v => v == null ? '—' : <CreditText value={v} /> },
    // { title: 'Other Details', dataIndex: 'other_details', key: 'other', mobileExpanded: true, ellipsis: true },
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
        onCancel={() => { resetSuggestion(); setOpen(false); }}
        confirmLoading={saving}
        width={560}
        centered
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingTop: 8, paddingRight: 8 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={changed => {
            // Ticking Is Migrated clears the working note and leaves the dates as typed;
            // unticking it goes back to calculating them.
            // A different member or type means a different chain — back to the suggested start.
            if ('member_id' in changed || 'transaction_type_id' in changed) fromEntered.current = false;
            // Typing a From Date makes it the start; clearing it goes back to the suggestion.
            if ('from_date' in changed) fromEntered.current = !!changed.from_date;
            if ('amount' in changed || 'member_id' in changed || 'transaction_type_id' in changed
                || 'is_migrated' in changed || 'from_date' in changed) {
              requestSuggestion();
            }
          }}
        >
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

          {/* How the From/To dates were worked out (deposits only) */}
          {suggesting && <Alert type="info" showIcon message="Working out the cover period…" style={{ marginBottom: 20 }} />}
          {!suggesting && suggestion?.error && (
            <Alert type="error" showIcon message={suggestion.error} style={{ marginBottom: 20 }} />
          )}
          {!suggesting && suggestion?.internal && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
              message="Internal account — nothing is calculated"
              description="Rates and targets don't apply to internal accounts. So From/To dates and credit/arrears aren't worked out. Enter the dates yourself if needed."
            />
          )}
          {!suggesting && suggestion && !suggestion.error && !suggestion.internal && !suggestion.available && (
            <Alert
              type="warning"
              showIcon
              message={suggestion.from_date ? `Starts ${fmtDate(suggestion.from_date)} — To Date not calculated` : 'Dates not calculated'}
              description={suggestion.reason}
              style={{ marginBottom: 20 }}
            />
          )}
          {!suggesting && suggestion?.available && !suggestion.rate && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
              message={`Starts ${fmtDate(suggestion.from_date)} - ${BASIS_TEXT[suggestion.basis]?.(suggestion)}`}
              description={
                <>
                  {Math.abs(suggestion.credit_brought_forward || 0) >= 0.005 && (
                    <div>Brought forward: <CreditText value={suggestion.credit_brought_forward} /></div>
                  )}
                  <div>Enter the amount to work out the To Date.</div>
                </>
              }
            />
          )}
          {!suggesting && suggestion?.available && suggestion.rate && (
            <Alert
              type={suggestion.warnings?.length ? 'warning' : 'success'}
              showIcon
              style={{ marginBottom: 20 }}
              message={suggestion.to_date
                ? `Covers ${fmtUnits(suggestion.units)} × ${suggestion.rate.time_unit_name} (${suggestion.days_covered} days) at ${fmtAmount(suggestion.rate.amount)} each`
                : `No cover yet — less than one full ${suggestion.rate.unit} (${fmtAmount(suggestion.rate.amount)})`}
              description={
                <>
                  <div>Starts the {BASIS_TEXT[suggestion.basis]?.(suggestion)}.</div>
                  {suggestion.rate.source === 'recorded' && (
                    <div>Priced at this transaction's recorded rate ({fmtAmount(suggestion.rate.amount)} per {suggestion.rate.unit}), not the current active rate.</div>
                  )}
                  <div style={styles.ledger}>
                    <span>Amount</span><span>{fmtAmount(suggestion.available_amount - suggestion.credit_brought_forward)}</span>
                    <span>Brought forward</span><span><CreditText value={suggestion.credit_brought_forward} /></span>
                    <span>Cover value ({fmtUnits(suggestion.units)} × {suggestion.rate.unit})</span><span> {fmtAmount(suggestion.cover_value)}</span>
                    <strong>Carried forward</strong><strong><CreditText value={suggestion.credit_carried_forward} /></strong>
                  </div>
                  {suggestion.warnings?.map(w => <div key={w}>{w}</div>)}
                  <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 2 }}>You can still adjust the dates.</div>
                </>
              }
            />
          )}

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
                    <Form.Item
            name="is_migrated"
            valuePropName="checked"
            extra="For records carried over from a previous system: enter the dates yourself — no automatic dates, rate or credit/arrears."
            style={{ marginBottom: 20 }}
          >
            <Checkbox>Is Migrated</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const styles = {
  ledger: {
    display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 16, rowGap: 2,
    margin: '6px 0', padding: '6px 10px', background: 'rgba(0,0,0,0.03)', borderRadius: 6, fontSize: 13,
  },
};
