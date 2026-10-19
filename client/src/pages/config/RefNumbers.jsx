import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, message, Tag } from 'antd';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

export default function RefNumbers() {
  const [data, setData] = useState([]);
  const [processTypes, setProcessTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [r, pt] = await Promise.all([api.get('/ref-numbers'), api.get('/process-types')]);
      setData(r.data); setProcessTypes(pt.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const preview = row => {
    const now = new Date();
    const year  = row?.use_year  ? `-${now.getFullYear()}` : '';
    const month = row?.use_month ? `-${String(now.getMonth() + 1).padStart(2, '0')}` : '';
    const pad = String(row?.next_serial || 1).padStart(row?.padding || 4, '0');
    return `${row?.prefix || 'XXX'}${year}${month}-${pad}`;
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    try {
      if (editing) await api.put(`/ref-numbers/${editing.id}`, vals);
      else await api.post('/ref-numbers', vals);
      message.success('Saved'); setOpen(false); load();
    } catch { message.error('Failed'); }
  };

  const columns = [
    { title: 'Process Type', dataIndex: 'process_type_name', key: 'pt', mobileHeaderSize: 13 },
    { title: 'Prefix',  dataIndex: 'prefix', key: 'prefix', render: v => <Tag>{v}</Tag> },
    { title: 'Preview', key: 'prev', mobileAlign: 'right',
      render: (_, r) => <code style={{ color: '#1677ff' }}>{preview(r)}</code> },
    { title: 'Initial Serial', dataIndex: 'initial_serial', key: 'init',  mobileExpanded: true, render: v => <Tag>{v}</Tag> },
    { title: 'Next Serial',    dataIndex: 'next_serial',    key: 'next',  mobileExpanded: true, render: v => <Tag>{v}</Tag> },
    { title: 'Use Year',       dataIndex: 'use_year',       key: 'year',  mobileExpanded: true, render: v => <Tag>{v ? 'Yes' : 'No'}</Tag> },
    { title: 'Use Month',      dataIndex: 'use_month',      key: 'month', mobileExpanded: true, render: v => <Tag>{v ? 'Yes' : 'No'}</Tag> },
    { title: 'Padding',        dataIndex: 'padding',        key: 'pad',   mobileExpanded: true, render: v => <Tag>{v}</Tag> },
  ];

  return (
    <>
      <CrudTable
        title="Reference Numbering"
        columns={columns}
        dataSource={data}
        loading={loading}
        onAdd={() => { setEditing(null); form.resetFields(); setOpen(true); }}
        onEdit={r => { setEditing(r); form.setFieldsValue({ ...r, use_year: !!r.use_year, use_month: !!r.use_month }); setOpen(true); }}
        onDelete={async r => {
          try { await api.delete(`/ref-numbers/${r.id}`); message.success('Deleted'); load(); }
          catch { message.error('Cannot delete'); }
        }}
        onRefresh={load}
      />
      <Modal title={editing ? 'Edit Ref Number' : 'Add Ref Number'} open={open} onOk={onSave} onCancel={() => setOpen(false)} centered>
        <Form form={form} layout="vertical">
          <LabelField label="Process Type" required>
            <Form.Item name="process_type_id" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Select>
                {processTypes.map(p => <Select.Option key={p.id} value={p.id}>{p.process_type_name}</Select.Option>)}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Prefix" required>
            <Form.Item name="prefix" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input placeholder="e.g. ORD, USR, CLT" maxLength={10} />
            </Form.Item>
          </LabelField>

          <LabelField label="Initial Serial">
            <Form.Item name="initial_serial" initialValue={1} style={{ marginBottom: 20 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Next Serial">
            <Form.Item name="next_serial" initialValue={1} style={{ marginBottom: 20 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Padding (digits)">
            <Form.Item name="padding" initialValue={4} style={{ marginBottom: 20 }}>
              <InputNumber min={1} max={8} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <Form.Item name="use_year" label="Include Year in Ref No" valuePropName="checked" style={{ marginBottom: 20 }}>
            <Switch />
          </Form.Item>

          <Form.Item name="use_month" label="Include Month in Ref No" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
