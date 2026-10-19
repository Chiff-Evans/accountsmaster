import { useEffect, useState } from 'react';
import { Card, Modal, Form, InputNumber, Button, Typography, Spin, message } from 'antd';
import { SolutionOutlined, EditOutlined } from '@ant-design/icons';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

export default function BrandAmbassadorSettings() {
  const [form]    = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [open,    setOpen]    = useState(false);
  const [config,  setConfig]  = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/brand-ambassador-config');
      setConfig(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = () => {
    form.setFieldsValue({
      min_avg_status_views: config.min_avg_status_views ?? 0,
      max_proof_resubmissions: config.max_proof_resubmissions ?? 3,
      brand_ambassador_pay_percentage: config.brand_ambassador_pay_percentage ?? 0,
    });
    setOpen(true);
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    setSaving(true);
    try {
      const { data } = await api.put('/brand-ambassador-config', vals);
      setConfig(data);
      message.success('Brand Ambassador settings saved');
      setOpen(false);
    } catch {
      message.error('Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SolutionOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>Brand Ambassador Settings</Typography.Title>
        </div>
        <Button type="primary" icon={<EditOutlined />} onClick={openEdit}>
          Edit Configuration
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Card
          size="small"
          style={{ borderRadius: 10, border: '1px solid #91caff', background: '#e6f4ff', maxWidth: 360, flex: '1 1 320px' }}
          styles={{ body: { padding: '18px 20px' } }}
        >
          <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 4 }}>
            Minimum Average Status Views
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1677ff' }}>
            {Number(config.min_avg_status_views || 0).toLocaleString()}
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Brand ambassadors must report at least this many average status views to register or update their profile — enforced both in the MIS and the brand ambassador portal.
          </Typography.Text>
        </Card>

        <Card
          size="small"
          style={{ borderRadius: 10, border: '1px solid #ffccc7', background: '#fff2f0', maxWidth: 360, flex: '1 1 320px' }}
          styles={{ body: { padding: '18px 20px' } }}
        >
          <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 4 }}>
            Max Resubmissions After Rejection
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#cf1322' }}>
            {config.max_proof_resubmissions > 0 ? config.max_proof_resubmissions : 'Unlimited'}
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Once a daily posting proof has been rejected this many times, the brand ambassador can no longer resubmit it. Set to 0 for unlimited.
          </Typography.Text>
        </Card>

        <Card
          size="small"
          style={{ borderRadius: 10, border: '1px solid #b7eb8f', background: '#f6ffed', maxWidth: 360, flex: '1 1 320px' }}
          styles={{ body: { padding: '18px 20px' } }}
        >
          <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 4 }}>
            Brand Ambassador Pay Percentage
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#389e0d' }}>
            {Number(config.brand_ambassador_pay_percentage || 0)}%
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Share of a campaign's budget set aside to pay the brand ambassadors who ran it. Split among them in proportion to their accepted status views on that campaign.
          </Typography.Text>
        </Card>
      </div>

      <Modal
        title="Edit Brand Ambassador Settings"
        open={open}
        onOk={onSave}
        onCancel={() => setOpen(false)}
        okText="Save Settings"
        confirmLoading={saving}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <LabelField label="Minimum Average Status Views" required>
            <Form.Item
              name="min_avg_status_views"
              rules={[{ required: true, message: 'Required' }]}
              extra="Registrations and profile updates with a lower value will be rejected."
              style={{ marginBottom: 20 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Max Resubmissions After Rejection" required>
            <Form.Item
              name="max_proof_resubmissions"
              rules={[{ required: true, message: 'Required' }]}
              extra="0 = unlimited. Once a proof hits this many rejections it can no longer be resubmitted."
              style={{ marginBottom: 20 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Brand Ambassador Pay Percentage" required>
            <Form.Item
              name="brand_ambassador_pay_percentage"
              rules={[{ required: true, message: 'Required' }]}
              extra="Percentage of a campaign's budget set aside to pay brand ambassadors, split by their share of accepted views."
              style={{ marginBottom: 0 }}
            >
              <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} addonAfter="%" />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>
    </>
  );
}
