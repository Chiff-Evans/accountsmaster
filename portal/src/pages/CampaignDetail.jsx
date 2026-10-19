import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { App, Button, Tag, Typography, Spin, Empty, Modal, Image, Tooltip } from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, SendOutlined, DownloadOutlined,
  FileImageOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined,
  FilePptOutlined, FileZipOutlined, FileTextOutlined, FileUnknownOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import CampaignFormModal from '../components/CampaignFormModal';
import { decodeId } from '../utils/hashids';
import api from '../api';

const STAGE_COLOR = { Draft: 'default' };

const ICON_BY_EXT = {
  jpg: FileImageOutlined, jpeg: FileImageOutlined, png: FileImageOutlined, gif: FileImageOutlined, webp: FileImageOutlined,
  pdf: FilePdfOutlined,
  doc: FileWordOutlined, docx: FileWordOutlined,
  xls: FileExcelOutlined, xlsx: FileExcelOutlined, csv: FileExcelOutlined,
  ppt: FilePptOutlined, pptx: FilePptOutlined,
  zip: FileZipOutlined, rar: FileZipOutlined,
  txt: FileTextOutlined,
};
function iconFor(name = '') {
  const ext = name.split('.').pop()?.toLowerCase();
  return ICON_BY_EXT[ext] || FileUnknownOutlined;
}

export default function CampaignDetail() {
  const { id: hashedId } = useParams();
  const id = decodeId(hashedId);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audiences, setAudiences] = useState([]); // parameter_id 21
  const [formOpen, setFormOpen] = useState(false);

  const load = () => {
    if (!id) { setCampaign(null); setLoading(false); return; }
    setLoading(true);
    api.get(`/campaigns/${id}`)
      .then(r => setCampaign(r.data))
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/parameters/values', { params: { parameter_id: 21 } }).then(r => setAudiences(r.data));
  }, [id]);

  const audienceName = aid => audiences.find(a => a.id === aid)?.paramater_value || aid;

  const submitForReview = () => {
    Modal.confirm({
      title: 'Submit campaign for review?',
      content: 'You will not be able to edit it further once submitted.',
      okText: 'Submit',
      onOk: async () => {
        try {
          await api.post(`/campaigns/${campaign.id}/submit`);
          message.success('Campaign submitted for review');
          load();
        } catch (err) { message.error(err.response?.data?.message || 'Failed to submit'); }
      },
    });
  };

  if (loading) {
    return <div className="page-content" style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;
  }
  if (!campaign) {
    return (
      <div className="page-content">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/campaigns')} type="text" style={{ marginBottom: 16 }}>Back</Button>
        <Empty description="Campaign not found" />
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/campaigns')} type="text" style={{ marginTop: 2 }} />
        <Typography.Title level={5} style={{ margin: 0, flex: 1 }}>{campaign.campaign_title}</Typography.Title>
        <Tag color={campaign.stage_color || STAGE_COLOR[campaign.stage_name] || 'default'}>{campaign.stage_name || '—'}</Tag>
      </div>

      {campaign.file_no && <div style={styles.row}><span>Ref No</span><span>{campaign.file_no}</span></div>}
      {campaign.campaign_type_name && <div style={styles.row}><span>Type</span><span>{campaign.campaign_type_name}</span></div>}
      {campaign.duration_value && <div style={styles.row}><span>Duration</span><span>{campaign.duration_value} {campaign.duration_unit_name}</span></div>}
      {campaign.start_date && <div style={styles.row}><span>Start Date</span><span>{dayjs(campaign.start_date).format('D MMM YYYY')}</span></div>}
      {campaign.end_date && <div style={styles.row}><span>End Date</span><span>{dayjs(campaign.end_date).format('D MMM YYYY')}</span></div>}
      {campaign.budget != null && <div style={styles.row}><span>Budget</span><span>{Number(campaign.budget).toLocaleString()}</span></div>}
      {campaign.whatsapp_number && <div style={styles.row}><span>WhatsApp Number</span><span>{campaign.whatsapp_number}</span></div>}
      {campaign.website_link && (
        <div style={styles.row}>
          <span>Website</span>
          <a href={campaign.website_link} target="_blank" rel="noreferrer" style={{ maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {campaign.website_link}
          </a>
        </div>
      )}
      {campaign.promo_code && <div style={styles.row}><span>Promo Code</span><span>{campaign.promo_code}</span></div>}
      {(campaign.target_country_name || campaign.target_county_name || campaign.target_subcounty_name) && (
        <div style={styles.row}>
          <span>Target Location</span>
          <span>{[campaign.target_subcounty_name, campaign.target_county_name, campaign.target_country_name].filter(Boolean).join(', ')}</span>
        </div>
      )}

      {campaign.target_audience?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {campaign.target_audience.map(aid => <Tag key={aid} color="blue" style={{ marginBottom: 4 }}>{audienceName(aid)}</Tag>)}
        </div>
      )}

      {campaign.description && (
        <Typography.Paragraph style={{ fontSize: 13, color: '#555', marginTop: 10, marginBottom: 0 }}>
          {campaign.description}
        </Typography.Paragraph>
      )}

      {campaign.comments && (
        <>
          <div style={{ ...styles.sectionLabel, marginTop: 12 }}>Comments</div>
          <Typography.Paragraph style={{ fontSize: 13, color: '#555', marginBottom: 0 }}>
            {campaign.comments}
          </Typography.Paragraph>
        </>
      )}

      {campaign.posters?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={styles.sectionLabel}>Posters</div>
          <Image.PreviewGroup>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {campaign.posters.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: 84, height: 84 }}>
                  <Image src={url} width={84} height={84} style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                  <Tooltip title="Download">
                    <a href={url} download target="_blank" rel="noreferrer" style={styles.downloadBadge} onClick={e => e.stopPropagation()}>
                      <DownloadOutlined />
                    </a>
                  </Tooltip>
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      )}

      {campaign.attachments?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={styles.sectionLabel}>Other Attachments</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {campaign.attachments.map((url, i) => {
              const name = url.split('/').pop();
              const Icon = iconFor(name);
              return (
                <a key={i} href={url} download target="_blank" rel="noreferrer" style={styles.attachmentRow}>
                  <Icon style={{ color: '#1677ff', flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <DownloadOutlined style={{ color: '#999', flexShrink: 0 }} />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {campaign.stage_name === 'Draft' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <Button icon={<EditOutlined />} onClick={() => setFormOpen(true)}>Edit</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={submitForReview}>Submit for Review</Button>
        </div>
      )}

      <CampaignFormModal
        open={formOpen}
        editing={campaign}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); load(); }}
      />
    </div>
  );
}

const styles = {
  row: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: '#555' },
  sectionLabel: { fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 },
  downloadBadge: {
    position: 'absolute', bottom: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
    background: 'rgba(0,0,0,0.55)', color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 12,
  },
  attachmentRow: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
    background: '#fafafa', borderRadius: 6, color: 'inherit',
  },
};
