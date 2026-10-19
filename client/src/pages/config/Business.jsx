import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, InputNumber, Select, Tag, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

function useWindowHeight() {
  const [h, setH] = useState(window.innerHeight);
  useEffect(() => {
    const onResize = () => setH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return h;
}

export default function Business() {
  const winH = useWindowHeight();
  const [businesses, setBusinesses] = useState([]);
  const [bLoading, setBLoading] = useState(false);
  const [bOpen, setBOpen] = useState(false);
  const [bEditing, setBEditing] = useState(null);
  const [bForm] = Form.useForm();

  const [shareholders, setShareholders] = useState([]);
  const [sLoading, setSLoading] = useState(false);
  const [sOpen, setSOpen] = useState(false);
  const [sEditing, setSEditing] = useState(null);
  const [sForm] = Form.useForm();

  const loadBusinesses = useCallback(async () => {
    setBLoading(true);
    try {
      const r = await api.get('/business');
      setBusinesses(r.data);
    } finally { setBLoading(false); }
  }, []);

  const loadShareholders = useCallback(async () => {
    setSLoading(true);
    try {
      const r = await api.get('/business/shareholders');
      setShareholders(r.data);
    } finally { setSLoading(false); }
  }, []);

  useEffect(() => {
    loadBusinesses();
    loadShareholders();
  }, [loadBusinesses, loadShareholders]);

  const onSaveBusiness = async () => {
    const vals = await bForm.validateFields();
    const payload = {
      ...vals,
      incorporation_date: vals.incorporation_date
        ? vals.incorporation_date.format('YYYY-MM-DD')
        : null,
    };
    try {
      if (bEditing) await api.put(`/business/${bEditing.id}`, payload);
      else await api.post('/business', payload);
      message.success('Saved');
      setBOpen(false);
      loadBusinesses();
    } catch { message.error('Failed to save'); }
  };

  const onSaveShareholder = async () => {
    const vals = await sForm.validateFields();
    try {
      if (sEditing) await api.put(`/business/shareholders/${sEditing.id}`, vals);
      else await api.post('/business/shareholders', vals);
      message.success('Saved');
      setSOpen(false);
      loadShareholders();
    } catch { message.error('Failed to save'); }
  };

  const businessCols = [
    { title: 'Business Name', dataIndex: 'business_name', key: 'name' },
    { title: 'Owner', dataIndex: 'owner_name', key: 'owner' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Location', dataIndex: 'location', key: 'loc' },
    { title: 'Incorporated', dataIndex: 'incorporation_date', key: 'inc',
      render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
  ];

  const shareholderCols = [
    { title: 'Shareholder Name', dataIndex: 'shareholder_name', key: 'name' },
    { title: 'Business',     dataIndex: 'business_name',  key: 'biz',  mobileExpanded: true, render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'Role',         dataIndex: 'role',           key: 'role', mobileExpanded: true, render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'ID Number',    dataIndex: 'id_number',      key: 'id',   mobileExpanded: true, render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'Phone',        dataIndex: 'phone',          key: 'phone',mobileExpanded: true, render: v => v ? <Tag>{v}</Tag> : null },
    { title: 'Shares %',     dataIndex: 'shares_percent', key: 'pct',  mobileExpanded: true, render: v => <Tag>{Number(v).toFixed(2)}%</Tag> },
    { title: 'Shares (KES)', dataIndex: 'shares_amount',  key: 'amt',  mobileExpanded: true, render: v => <Tag>{Number(v).toLocaleString()}</Tag> },
  ];

  return (
    <>
      <CrudTable
        hidePagination
        title="Business Details"
        columns={businessCols}
        dataSource={businesses}
        loading={bLoading}
        onAdd={() => { setBEditing(null); bForm.resetFields(); setBOpen(true); }}
        onEdit={r => {
          setBEditing(r);
          bForm.setFieldsValue({
            ...r,
            incorporation_date: r.incorporation_date ? dayjs(r.incorporation_date) : null,
          });
          setBOpen(true);
        }}
        onDelete={async r => {
          try { await api.delete(`/business/${r.id}`); message.success('Deleted'); loadBusinesses(); }
          catch { message.error('Cannot delete'); }
        }}
        onRefresh={loadBusinesses}
        searchPlaceholder="Search businesses..."
      />

      <div style={{ height: 16 }} />

      <CrudTable
        height={Math.max(winH - 274, 300)}
        title="Shareholders"
        columns={shareholderCols}
        dataSource={shareholders}
        loading={sLoading}
        onAdd={() => { setSEditing(null); sForm.resetFields(); setSOpen(true); }}
        onEdit={r => {
          setSEditing(r);
          sForm.setFieldsValue({
            ...r,
            shares_percent: parseFloat(r.shares_percent),
            shares_amount: parseFloat(r.shares_amount),
          });
          setSOpen(true);
        }}
        onDelete={async r => {
          try { await api.delete(`/business/shareholders/${r.id}`); message.success('Deleted'); loadShareholders(); }
          catch { message.error('Cannot delete'); }
        }}
        onRefresh={loadShareholders}
        searchPlaceholder="Search shareholders..."
      />

      {/* Business Modal */}
      <Modal
        title={bEditing ? 'Edit Business' : 'Add Business'}
        open={bOpen}
        onOk={onSaveBusiness}
        onCancel={() => setBOpen(false)}
        centered
      >
        <Form form={bForm} layout="vertical">
          <LabelField label="Business Name" required>
            <Form.Item name="business_name" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Owner Name">
            <Form.Item name="owner_name" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Phone">
            <Form.Item name="phone" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Email">
            <Form.Item name="email" rules={[{ type: 'email' }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Location / Address">
            <Form.Item name="location" style={{ marginBottom: 20 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </LabelField>

          <LabelField label="System Incorporation Date">
            <Form.Item name="incorporation_date" style={{ marginBottom: 0 }}>
              <DatePicker
                style={{ width: '100%' }}
                format="D MMM YYYY"
                disabledDate={d => d && d.isAfter(dayjs(), 'day')}
                placeholder="Select incorporation date"
              />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>

      {/* Shareholder Modal */}
      <Modal
        title={sEditing ? 'Edit Shareholder' : 'Add Shareholder'}
        open={sOpen}
        onOk={onSaveShareholder}
        onCancel={() => setSOpen(false)}
        width={560}
        centered
      >
        <Form form={sForm} layout="vertical">
          <LabelField label="Business" required>
            <Form.Item name="business_id" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Select showSearch optionFilterProp="children">
                {businesses.map(b => (
                  <Select.Option key={b.id} value={b.id}>{b.business_name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </LabelField>

          <LabelField label="Shareholder Name" required>
            <Form.Item name="shareholder_name" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Role">
            <Form.Item name="role" style={{ marginBottom: 20 }}>
              <Input placeholder="e.g. Director, Partner, Investor" />
            </Form.Item>
          </LabelField>

          <LabelField label="ID / Passport Number">
            <Form.Item name="id_number" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Phone">
            <Form.Item name="phone" style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Email">
            <Form.Item name="email" rules={[{ type: 'email' }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Shares (%)">
            <Form.Item name="shares_percent" style={{ marginBottom: 20 }}>
              <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
          </LabelField>

          <LabelField label="Shares Amount (KES)">
            <Form.Item name="shares_amount" style={{ marginBottom: 0 }}>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>
    </>
  );
}
