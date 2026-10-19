import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, message, Typography } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CrudTable from '../../components/common/CrudTable';
import api from '../../api';

const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

const QUILL_FORMATS = ['bold', 'italic', 'underline', 'list', 'bullet'];

export default function ReceiptConfig() {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [open, setOpen]               = useState(false);
  const [editing, setEditing]         = useState(null);
  const [otherConditions, setOtherConditions] = useState('');
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/receipt-config');
      setData(r.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setOtherConditions('');
    form.resetFields();
    setOpen(true);
  };

  const openEdit = r => {
    setEditing(r);
    setOtherConditions(r.other_conditions || '');
    form.setFieldsValue({
      config_name:      r.config_name,
      payment_details:  r.payment_details  || '',
      customer_care_no: r.customer_care_no || '',
      email:            r.email            || '',
    });
    setOpen(true);
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    try {
      const payload = { ...vals, other_conditions: otherConditions };
      if (editing) await api.put(`/receipt-config/${editing.id}`, payload);
      else         await api.post('/receipt-config', payload);
      message.success('Saved');
      setOpen(false);
      load();
    } catch { message.error('Failed to save'); }
  };

  const onDelete = async r => {
    try {
      await api.delete(`/receipt-config/${r.id}`);
      message.success('Deleted');
      load();
    } catch { message.error('Cannot delete'); }
  };

  const columns = [
    { title: 'Config Name',       dataIndex: 'config_name',      key: 'name' },
    { title: 'Payment Details',   dataIndex: 'payment_details',  key: 'pd',    mobileExpanded: true, render: v => v || '—' },
    { title: 'Customer Care No.', dataIndex: 'customer_care_no', key: 'cc',    mobileExpanded: true, render: v => v || '—' },
    { title: 'Email',             dataIndex: 'email',            key: 'email', mobileExpanded: true, render: v => v || '—' },
    { title: 'Created By',  dataIndex: 'created_by_name', key: 'cb', mobileExpanded: true, render: v => v || '—' },
    { title: 'Created On',  dataIndex: 'created_at',      key: 'ca', mobileExpanded: true, render: v => v ? new Date(v).toLocaleString() : '—' },
    { title: 'Updated By',  dataIndex: 'updated_by_name', key: 'ub', mobileExpanded: true, render: v => v || '—' },
    { title: 'Updated On',  dataIndex: 'updated_at',      key: 'ua', mobileExpanded: true, render: v => v ? new Date(v).toLocaleString() : '—' },
  ];

  return (
    <>
      <CrudTable
        title="Receipt Setup"
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={onDelete}
        onRefresh={load}
        hidePagination
        searchPlaceholder="Search configs…"
      />

      <Modal
        title={editing ? `Edit — ${editing.config_name}` : 'New Receipt Config'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        okText="Save"
        width={680}
        centered
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Config Name" name="config_name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Default" />
          </Form.Item>

          <Form.Item label="Payment Details" name="payment_details">
            <Input placeholder="e.g. EQUITY ACC NO 0713269635" />
          </Form.Item>

          <Form.Item label="Customer Care No." name="customer_care_no">
            <Input placeholder="e.g. 0117107055" />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
            <Input placeholder="e.g. info@business.com" />
          </Form.Item>

          <Form.Item label="Other Conditions / Remarks">
            <ReactQuill
              key={editing?.id ?? 'new'}
              theme="snow"
              value={otherConditions}
              onChange={setOtherConditions}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              style={{ background: '#fff' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
