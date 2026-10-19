import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Card, Button, Modal, Empty, Typography, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, SoundOutlined, SendOutlined } from '@ant-design/icons';
import CampaignFormModal from '../components/CampaignFormModal';
import { encodeId } from '../utils/hashids';
import api from '../api';

const STAGE_COLOR = { Draft: 'default' };

export default function Campaigns() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/campaigns').then(r => setCampaigns(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setFormOpen(true); };

  const openEdit = c => {
    if (c.stage_name && c.stage_name !== 'Draft') {
      return message.info(`This campaign is "${c.stage_name}" and can no longer be edited.`);
    }
    setEditing(c);
    setFormOpen(true);
  };

  const submitForReview = c => {
    Modal.confirm({
      title: 'Submit campaign for review?',
      content: 'You will not be able to edit it further once submitted.',
      okText: 'Submit',
      onOk: async () => {
        try {
          await api.post(`/campaigns/${c.id}/submit`);
          message.success('Campaign submitted for review');
          load();
        } catch (err) { message.error(err.response?.data?.message || 'Failed to submit'); }
      },
    });
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={5} style={{ margin: 0 }}>My Campaigns</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} shape="round">
          New Campaign
        </Button>
      </div>

      {!loading && campaigns.length === 0 ? (
        <Empty image={<SoundOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />} description="No campaigns yet">
          <Button type="primary" onClick={openAdd}>Create Your First Campaign</Button>
        </Empty>
      ) : (
        campaigns.map(c => (
          <Card
            key={c.id}
            size="small"
            hoverable
            onClick={() => navigate(`/campaigns/${encodeId(c.id)}`)}
            style={styles.card}
            styles={{ body: { padding: '14px 16px' } }}
            extra={
              <Space onClick={e => e.stopPropagation()}>
                <Tag color={c.stage_color || STAGE_COLOR[c.stage_name] || 'default'}>{c.stage_name || '—'}</Tag>
                {c.stage_name === 'Draft' && (
                  <>
                    <Button icon={<EditOutlined />} size="small" type="text" onClick={() => openEdit(c)} />
                    <Button icon={<SendOutlined />} size="small" type="text" onClick={() => submitForReview(c)} title="Submit for Review" />
                  </>
                )}
              </Space>
            }
            title={<span style={{ fontWeight: 700 }}>{c.campaign_title}</span>}
          >
            {c.file_no && <div style={styles.row}><span>Ref No</span><span>{c.file_no}</span></div>}
            {c.campaign_type_name && <div style={styles.row}><span>Campaign Type</span><span>{c.campaign_type_name}</span></div>}
            {(c.start_date || c.end_date) ? (
              <div style={styles.row}>
                <span>Dates</span>
                <span>
                  {c.start_date ? new Date(c.start_date).toLocaleDateString() : '—'}
                  {' – '}
                  {c.end_date ? new Date(c.end_date).toLocaleDateString() : '—'}
                </span>
              </div>
            ) : c.duration_value ? (
              <div style={styles.row}><span>Duration</span><span>{c.duration_value} {c.duration_unit_name || ''}</span></div>
            ) : null}
            {c.budget != null && <div style={styles.row}><span>Budget</span><span>{Number(c.budget).toLocaleString()}</span></div>}
          </Card>
        ))
      )}

      <CampaignFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); load(); }}
      />
    </div>
  );
}

const styles = {
  card: { borderRadius: 12, marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', color: '#555' },
};
