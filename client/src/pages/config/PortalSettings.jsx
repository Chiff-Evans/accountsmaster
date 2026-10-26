import { useState, useEffect } from 'react';
import { Card, Switch, Typography, Spin, Alert, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePagePermissions } from '../../hooks/usePagePermissions';
import api from '../../api';

const fmt = v => `KES ${Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* What members see on their portal Home. Each switch saves straight away and
   shows the figure it would reveal right now. */
const SETTINGS = [
  {
    key: 'show_total_balance',
    label: 'Show total balance to members',
    help: "The group's total balance: every account's deposits minus withdrawals, including interest and deductions.",
    preview: p => [['Total balance', fmt(p.total_balance)]],
  },
  {
    key: 'show_interest',
    label: 'Show interest earned',
    help: "Deposits into the account marked as Interest Account (Members form). Members can tap it to see that account's statement.",
    preview: p => [['Interest earned', p.interest == null ? 'No Interest Account set' : fmt(p.interest)]],
  },
  {
    key: 'show_deductions',
    label: 'Show deductions / taxes',
    help: "Withdrawals from the account marked as Deductions Account (Members form). Members can tap it to see that account's statement.",
    preview: p => [['Deductions / taxes', p.deductions == null ? 'No Deductions Account set' : fmt(p.deductions)]],
  },
];

export default function PortalSettings() {
  const isMobile = useIsMobile();
  const perms = usePagePermissions();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(null); // key being saved

  useEffect(() => {
    api.get('/portal-settings').then(r => setData(r.data)).catch(() => message.error('Failed to load settings'));
  }, []);

  const toggle = async (key, checked) => {
    const previous = data;
    setData({ ...data, [key]: checked });
    setSaving(key);
    try {
      const { data: saved } = await api.put('/portal-settings', { [key]: checked });
      setData(saved);
      message.success(checked ? 'Now visible to members' : 'Hidden from members');
    } catch (err) {
      setData(previous); // revert
      message.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(null); }
  };

  if (!data) return <Spin style={{ display: 'block', margin: '40px auto' }} />;

  return (
    <div style={{ maxWidth: 760 }}>
      <Typography.Title level={4} style={{ marginBottom: 4, textAlign: isMobile ? 'center' : 'left' }}>
        Portal Settings
      </Typography.Title>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Choose which group-wide figures members see on their portal Home page. Members always see their own contributions.
      </Typography.Text>

      {!perms.canEdit && (
        <Alert type="info" showIcon style={{ marginBottom: 16 }} message="You can view these settings but not change them." />
      )}

      {SETTINGS.map(s => (
        <Card key={s.key} size="small" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <Typography.Text strong>{s.label}</Typography.Text>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{s.help}</div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 10 }}>
                {s.preview(data.preview).map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}><EyeOutlined /> {label} (now)</div>
                    <div style={{ fontWeight: 700 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <Switch
              checked={!!data[s.key]}
              loading={saving === s.key}
              disabled={!perms.canEdit || (saving && saving !== s.key)}
              onChange={checked => toggle(s.key, checked)}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
