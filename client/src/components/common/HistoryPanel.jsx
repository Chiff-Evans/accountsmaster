import { useState, useEffect, useCallback } from 'react';
import { Timeline, Tag, Typography, Spin, Empty } from 'antd';
import api from '../../api';

const { Text } = Typography;

const stageTag = (label, color) =>
  label
    ? <Tag color={color || undefined}>{label.replace(/_/g, ' ').toUpperCase()}</Tag>
    : <Text type="secondary">—</Text>;

// Read-only audit trail for one entity's workflow transitions (registration,
// approval, rejection, ...), reusing the same GET /workflows/history endpoint
// the Config → Workflows history tab uses, just scoped to a single record.
export default function HistoryPanel({ entityType, entityId }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    try {
      const r = await api.get('/workflows/history', { params: { entity_type: entityType, entity_id: entityId, limit: 100 } });
      setData(r.data.data || []);
    } finally { setLoading(false); }
  }, [entityType, entityId]);

  useEffect(() => { load(); }, [load]);

  if (!entityId) return null;

  return (
    <Spin spinning={loading}>
      {!loading && !data.length ? (
        <Empty description="No history yet" style={{ padding: 32 }} />
      ) : (
        <Timeline
          style={{ paddingTop: 8 }}
          items={data.map(r => ({
            key: r.id,
            color: r.to_stage_color || 'blue',
            children: (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  {stageTag(r.from_status, r.from_stage_color)}
                  <span style={{ color: '#999' }}>→</span>
                  {stageTag(r.to_status, r.to_stage_color)}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(r.moved_at).toLocaleString()}{r.moved_by_name ? ` · by ${r.moved_by_name}` : ''}
                </Text>
                {r.notes && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{r.notes}</div>}
              </div>
            ),
          }))}
        />
      )}
    </Spin>
  );
}
