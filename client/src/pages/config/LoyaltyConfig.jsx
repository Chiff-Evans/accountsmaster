import { useEffect, useState } from 'react';
import {
  Row, Col, Card, Modal, Form, InputNumber, Select,
  Switch, Button, Typography, Spin, message, Tag, Badge,
} from 'antd';
import {
  TrophyOutlined, EditOutlined, CheckCircleOutlined,
  CloseCircleOutlined, DollarOutlined, NodeIndexOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import LabelField from '../../components/common/LabelField';
import { useIsMobile } from '../../hooks/useIsMobile';
import api from '../../api';

export default function LoyaltyConfig() {
  const isMobile  = useIsMobile();
  const [form]    = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [open,    setOpen]    = useState(false);
  const [config,  setConfig]  = useState({});
  const [stages,  setStages]  = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [cfg, stg] = await Promise.all([
        api.get('/loyalty-config'),
        api.get('/loyalty-config/stages'),
      ]);
      setConfig(cfg.data);
      setStages(stg.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const isActiveWatch = Form.useWatch('is_active', form);

  const openEdit = () => {
    form.setFieldsValue({
      min_sale_amount:     config.min_sale_amount  ?? 500,
      amount_per_point:    config.amount_per_point ?? 100,
      qualifying_stage_id: config.qualifying_stage_id ?? undefined,
      is_active:           !!config.is_active,
    });
    setOpen(true);
  };

  const onSave = async () => {
    const vals = await form.validateFields();
    setSaving(true);
    try {
      const { data } = await api.put('/loyalty-config', vals);
      setConfig(data);
      message.success('Loyalty settings saved');
      setOpen(false);
    } catch {
      message.error('Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;

  const isActive   = !!config.is_active;
  const stageName  = config.stage_name || '—';
  const minSale    = config.min_sale_amount  ? `KES ${Number(config.min_sale_amount).toLocaleString()}`  : '—';
  const pointRate  = config.amount_per_point ? `KES ${Number(config.amount_per_point).toLocaleString()} = 1 pt` : '—';

  const statCards = [
    {
      title:   'Programme Status',
      value:   isActive ? 'Active' : 'Inactive',
      icon:    isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
      color:   isActive ? '#52c41a' : '#ff4d4f',
      bg:      isActive ? '#f6ffed' : '#fff2f0',
      border:  isActive ? '#b7eb8f' : '#ffa39e',
    },
    {
      title:  'Min. Sale Amount',
      value:  minSale,
      icon:   <DollarOutlined />,
      color:  '#1677ff',
      bg:     '#e6f4ff',
      border: '#91caff',
    },
    {
      title:  '1 Point Equivalent',
      value:  pointRate,
      icon:   <TrophyOutlined />,
      color:  '#faad14',
      bg:     '#fffbe6',
      border: '#ffe58f',
    },
    {
      title:  'Qualifying Stage',
      value:  stageName,
      icon:   <NodeIndexOutlined />,
      color:  '#722ed1',
      bg:     '#f9f0ff',
      border: '#d3adf7',
    },
  ];

  return (
    <>
      {/* Page header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 12 : 0,
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TrophyOutlined style={{ fontSize: 22, color: '#faad14' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>Loyalty Points Configuration</Typography.Title>
        </div>
        <Button type="primary" icon={<EditOutlined />} onClick={openEdit} block={isMobile}>
          Edit Configuration
        </Button>
      </div>

      {/* Summary stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map(card => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card
              size="small"
              style={{
                borderRadius: 10,
                border: `1px solid ${card.border}`,
                background: card.bg,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              styles={{ body: { padding: '18px 20px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${card.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ color: card.color, fontSize: 18 }}>{card.icon}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 4 }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: card.color, wordBreak: 'break-word' }}>
                    {card.value}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Points earning formula callout */}
      {config.amount_per_point && (
        <Card
          size="small"
          style={{ borderRadius: 10, background: '#f5f5f5', border: '1px solid #e0e0e0', marginBottom: 24 }}
          styles={{ body: { padding: '14px 18px' } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThunderboltOutlined style={{ color: '#faad14', fontSize: 16 }} />
            <Typography.Text>
              <strong>Earning formula:</strong> A booking with total payments of{' '}
              <Tag color="blue">KES {Number(config.min_sale_amount || 0).toLocaleString()}</Tag>
              or more earns{' '}
              <Tag color="gold">1 point per KES {Number(config.amount_per_point || 0).toLocaleString()}</Tag>
              paid, once it reaches the{' '}
              <Tag color="purple">{stageName}</Tag> stage.
            </Typography.Text>
          </div>
        </Card>
      )}

      {/* Edit modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrophyOutlined style={{ color: '#faad14' }} />
            Edit Loyalty Configuration
          </div>
        }
        open={open}
        onOk={onSave}
        onCancel={() => setOpen(false)}
        okText="Save Settings"
        confirmLoading={saving}
        centered
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <LabelField label="Programme Status">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              border: `1px solid ${isActiveWatch ? '#b7eb8f' : '#d9d9d9'}`,
              borderRadius: 6,
              padding: '10px 12px',
              background: isActiveWatch ? '#f6ffed' : '#fafafa',
              marginBottom: 20,
              transition: 'all 0.2s',
            }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, fontWeight: 500,
                color: isActiveWatch ? '#389e0d' : 'rgba(0,0,0,0.65)',
              }}>
                {isActiveWatch
                  ? <CheckCircleOutlined style={{ fontSize: 15 }} />
                  : <CloseCircleOutlined style={{ fontSize: 15 }} />}
                {isActiveWatch ? 'Active — advertisers are earning points' : 'Inactive — points are paused'}
              </span>
              <Form.Item name="is_active" valuePropName="checked" noStyle>
                <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              </Form.Item>
            </div>
          </LabelField>

          <LabelField label="Minimum amount paid to qualify (KES)" required>
            <Form.Item
              name="min_sale_amount"
              rules={[{ required: true, message: 'Required' }]}
              extra="Bookings whose total payments are below this amount do not earn any points."
              style={{ marginBottom: 20 }}
            >
              <InputNumber
                min={0} step={100} style={{ width: '100%' }}
                formatter={v => `KES ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={v => v.replace(/KES\s?|,/g, '')}
              />
            </Form.Item>
          </LabelField>

          <LabelField label="KES equivalent of 1 point" required>
            <Form.Item
              name="amount_per_point"
              rules={[{ required: true, message: 'Required' }]}
              extra="e.g. 100 means every KES 100 paid earns 1 point."
              style={{ marginBottom: 20 }}
            >
              <InputNumber
                min={1} step={10} style={{ width: '100%' }}
                formatter={v => `KES ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={v => v.replace(/KES\s?|,/g, '')}
              />
            </Form.Item>
          </LabelField>

          <LabelField label="Workflow stage that awards points" required>
            <Form.Item
              name="qualifying_stage_id"
              rules={[{ required: true, message: 'Required' }]}
              extra="Points are awarded when a booking reaches this stage (based on how much has been paid toward it by then)."
              style={{ marginBottom: 4 }}
            >
              <Select
                placeholder="Select a stage…"
                allowClear
                optionFilterProp="label"
                showSearch
                options={stages.map(s => ({
                  value: s.id,
                  label: s.stage_name,
                  color: s.stage_color,
                  process: s.process_type_name,
                }))}
                optionRender={opt => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color={opt.data.color || 'blue'} style={{ margin: 0, fontSize: 11 }}>
                      {opt.data.label}
                    </Tag>
                    {opt.data.process && (
                      <span style={{ fontSize: 11, color: '#888' }}>{opt.data.process}</span>
                    )}
                  </div>
                )}
              />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>
    </>
  );
}
