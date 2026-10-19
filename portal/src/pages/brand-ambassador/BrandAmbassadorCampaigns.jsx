import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Empty, Spin } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import brandAmbassadorApi from '../../brandAmbassadorApi';
import { encodeId } from '../../utils/hashids';

const STAGE_COLOR = { Draft: 'default' };

const isoDate = v => v ? String(v).slice(0, 10) : null;
const todayStr = () => new Date().toISOString().slice(0, 10);

/* Every calendar day from start to end, inclusive — both already 'YYYY-MM-DD'. */
function dateRange(startStr, endStr) {
  const dates = [];
  let d = new Date(`${startStr}T00:00:00Z`);
  const end = new Date(`${endStr}T00:00:00Z`);
  while (d <= end) {
    dates.push(d.toISOString().slice(0, 10));
    d = new Date(d.getTime() + 86400000);
  }
  return dates;
}

export default function BrandAmbassadorCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofs, setProofs] = useState([]);

  useEffect(() => {
    brandAmbassadorApi.get('/my-campaigns').then(r => setCampaigns(r.data)).finally(() => setLoading(false));
    brandAmbassadorApi.get('/campaign-proofs').then(r => setProofs(r.data));
  }, []);

  const proofFor = (campaignId, dateStr) =>
    proofs.find(p => p.campaign_id === campaignId && isoDate(p.proof_date) === dateStr);

  return (
    <div className="page-content">
      <Typography.Title level={5} style={{ margin: '0 0 16px' }}>My Campaigns</Typography.Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : campaigns.length === 0 ? (
        <Empty image={<SoundOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />} description="No campaigns have been assigned to you yet" />
      ) : (
        campaigns.map(c => {
          const startStr = isoDate(c.start_date);
          const endStr = isoDate(c.end_date);
          const assignedStr = isoDate(c.assigned_on);
          // Proof is only ever owed from whichever is later — the campaign's
          // own start, or the day this brand ambassador was actually
          // assigned to it (assigned mid-flight shouldn't owe proof for days
          // before they were even on the campaign).
          const proofStartStr = assignedStr && assignedStr > startStr ? assignedStr : startStr;
          const days = proofStartStr && endStr ? dateRange(proofStartStr, endStr) : [];
          const today = todayStr();
          const actionableDays = days.filter(d => d <= today);
          const doneCount = actionableDays.filter(d => proofFor(c.id, d)).length;

          return (
            <Card
              key={c.id}
              size="small"
              hoverable
              onClick={() => navigate(`/brand-ambassador/campaigns/${encodeId(c.id)}`)}
              style={styles.card}
              styles={{ body: { padding: '14px 16px' } }}
              extra={<Tag color={c.stage_color || STAGE_COLOR[c.stage_name] || 'default'}>{c.stage_name || '—'}</Tag>}
              title={<span style={{ fontWeight: 700 }}>{c.campaign_title}</span>}
            >
              {c.advertiser_name && <div style={styles.row}><span>Advertiser</span><span>{c.advertiser_name}</span></div>}
              {c.file_no && <div style={styles.row}><span>Ref No</span><span>{c.file_no}</span></div>}
              {actionableDays.length > 0 && (
                <div style={styles.row}>
                  <span>Daily Posting Proof</span>
                  <Tag color={doneCount === actionableDays.length ? 'green' : 'gold'}>{doneCount}/{actionableDays.length} submitted</Tag>
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}

const styles = {
  card: { borderRadius: 12, marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '3px 0', color: '#555' },
};
