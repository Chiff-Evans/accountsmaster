import { useState, useEffect } from 'react';
import { Card, Select, Switch, Typography, Divider, Row, Col, message, Spin } from 'antd';
import { useIsMobile } from '../../hooks/useIsMobile';
import api from '../../api';

const SECTIONS = [
  { key: 'stat_members',              label: 'Active Members',                group: 'Stat Cards' },
  { key: 'stat_deposits',             label: 'Deposits',                      group: 'Stat Cards' },
  { key: 'stat_withdrawals',          label: 'Withdrawals',                   group: 'Stat Cards' },
  { key: 'stat_net',                  label: 'Net Contributions',             group: 'Stat Cards' },
  { key: 'stat_target',               label: 'Target Progress',               group: 'Stat Cards' },
  { key: 'chart_trend',               label: 'Deposits vs Withdrawals Trend', group: 'Charts' },
  { key: 'chart_by_type',             label: 'Transactions by Type',          group: 'Charts' },
  { key: 'chart_top_members',         label: 'Top Members by Contribution',   group: 'Charts' },
  { key: 'chart_recent_transactions', label: 'Recent Transactions Table',     group: 'Charts' },
];

const GROUPS = [...new Set(SECTIONS.map(s => s.group))];

export default function DashboardConfig() {
  const isMobile = useIsMobile();
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/dashboard-config').then(r => {
      setRoles(r.data);
      if (r.data.length) {
        setSelectedRoleId(r.data[0].id);
        setSections(r.data[0].sections);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleRoleChange = roleId => {
    const role = roles.find(r => r.id === roleId);
    setSelectedRoleId(roleId);
    setSections(role?.sections || {});
  };

  const handleToggle = async (key, checked) => {
    const updated = { ...sections, [key]: checked };
    setSections(updated);
    setSaving(true);
    try {
      await api.put(`/dashboard-config/${selectedRoleId}`, { sections: updated });
      message.success('Saved');
    } catch {
      message.error('Failed to save');
      setSections(sections); // revert
    } finally { setSaving(false); }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 16, textAlign: isMobile ? 'center' : 'left' }}>
        Dashboard Visibility Config
      </Typography.Title>

      <div style={{ marginBottom: 24, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: 12 }}>
        <Typography.Text strong style={{ textAlign: isMobile ? 'center' : 'left' }}>Role:</Typography.Text>
        <Select
          value={selectedRoleId}
          onChange={handleRoleChange}
          style={{ width: isMobile ? '100%' : 220 }}
          options={roles.map(r => ({ value: r.id, label: r.role_name }))}
        />
        {saving && <Typography.Text type="secondary" style={{ textAlign: 'center' }}>Saving…</Typography.Text>}
      </div>

      {GROUPS.map(group => (
        <Card key={group} title={group} size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 12]}>
            {SECTIONS.filter(s => s.group === group).map(s => (
              <Col key={s.key} xs={24} sm={12} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', border: '1px solid #f0f0f0', borderRadius: 6 }}>
                  <Typography.Text>{s.label}</Typography.Text>
                  <Switch
                    size="small"
                    checked={sections[s.key] ?? true}
                    onChange={checked => handleToggle(s.key, checked)}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      ))}
    </div>
  );
}
