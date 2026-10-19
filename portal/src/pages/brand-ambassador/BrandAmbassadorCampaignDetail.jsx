import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Empty, Spin, Image, Tooltip, Modal, Button, InputNumber, App } from 'antd';
import dayjs from 'dayjs';
import {
  ArrowLeftOutlined, SoundOutlined, DownloadOutlined, FileImageOutlined, FilePdfOutlined,
  FileWordOutlined, FileExcelOutlined, FilePptOutlined, FileZipOutlined,
  FileTextOutlined, FileUnknownOutlined,
} from '@ant-design/icons';
import brandAmbassadorApi from '../../brandAmbassadorApi';
import ImageUploadField from '../../components/common/ImageUploadField';
import { decodeId } from '../../utils/hashids';

const STAGE_COLOR = { Draft: 'default' };
const PROOF_STATUS_COLOR = { pending: 'gold', accepted: 'green', rejected: 'red' };

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

export default function BrandAmbassadorCampaignDetail() {
  const { id: hashedId } = useParams();
  const id = decodeId(hashedId);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audiences, setAudiences] = useState([]); // parameter_id 21
  const [proofs, setProofs] = useState([]);
  const [maxResubmissions, setMaxResubmissions] = useState(0); // 0 = unlimited

  const [uploadTarget, setUploadTarget] = useState(null); // { dateStr }
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadStatusViews, setUploadStatusViews] = useState(null);
  const [submittingProof, setSubmittingProof] = useState(false);

  const loadProofs = () => {
    if (!id) return;
    brandAmbassadorApi.get('/campaign-proofs', { params: { campaign_id: id } }).then(r => setProofs(r.data));
  };

  const load = () => {
    if (!id) { setCampaign(null); setLoading(false); return; }
    setLoading(true);
    brandAmbassadorApi.get(`/my-campaigns/${id}`)
      .then(r => setCampaign(r.data))
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    brandAmbassadorApi.get('/parameters/values', { params: { parameter_id: 21 } }).then(r => setAudiences(r.data));
    brandAmbassadorApi.get('/config').then(r => setMaxResubmissions(Number(r.data.max_proof_resubmissions || 0)));
    loadProofs();
  }, [id]);

  const audienceName = aid => audiences.find(a => a.id === aid)?.paramater_value || aid;
  const proofFor = dateStr => proofs.find(p => isoDate(p.proof_date) === dateStr);

  const openUpload = dateStr => {
    setUploadTarget({ dateStr });
    setUploadFile(null);
    setUploadPreview(null);
    setUploadStatusViews(null);
  };

  const submitProof = async () => {
    if (!uploadFile) return message.error('Please select a screenshot first');
    if (uploadStatusViews == null) return message.error('Please enter the number of status views');
    setSubmittingProof(true);
    try {
      const formData = new FormData();
      formData.append('campaign_id', campaign.id);
      formData.append('proof_date', uploadTarget.dateStr);
      formData.append('proof_image', uploadFile);
      formData.append('status_views', uploadStatusViews);
      await brandAmbassadorApi.post('/campaign-proofs', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Proof submitted for review');
      setUploadTarget(null);
      loadProofs();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to submit proof');
    } finally { setSubmittingProof(false); }
  };

  if (loading) {
    return <div className="page-content" style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;
  }
  if (!campaign) {
    return (
      <div className="page-content">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/brand-ambassador/campaigns')} type="text" style={{ marginBottom: 16 }}>Back</Button>
        <Empty image={<SoundOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />} description="Campaign not found" />
      </div>
    );
  }

  const startStr = isoDate(campaign.start_date);
  // Staff can extend/shorten this specific assignment's proof window —
  // overrides the campaign's own end_date when set.
  const endStr = isoDate(campaign.proof_deadline) || isoDate(campaign.end_date);
  const assignedStr = isoDate(campaign.assigned_on);
  const proofStartStr = assignedStr && assignedStr > startStr ? assignedStr : startStr;
  const days = proofStartStr && endStr ? dateRange(proofStartStr, endStr) : [];
  const today = todayStr();
  const actionableDays = days.filter(d => d <= today);
  const doneCount = actionableDays.filter(d => proofFor(d)).length;
  const proofsLocked = campaign.member_can_edit === 0;

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/brand-ambassador/campaigns')} type="text" style={{ marginTop: 2 }} />
        <Typography.Title level={5} style={{ margin: 0, flex: 1 }}>{campaign.campaign_title}</Typography.Title>
        <Tag color={campaign.stage_color || STAGE_COLOR[campaign.stage_name] || 'default'}>{campaign.stage_name || '—'}</Tag>
      </div>

      {campaign.member_name && <div style={styles.row}><span>Member</span><span>{campaign.member_name}</span></div>}
      {campaign.file_no && <div style={styles.row}><span>Ref No</span><span>{campaign.file_no}</span></div>}
      {campaign.campaign_type_name && <div style={styles.row}><span>Type</span><span>{campaign.campaign_type_name}</span></div>}
      {campaign.duration_value && <div style={styles.row}><span>Duration</span><span>{campaign.duration_value} {campaign.duration_unit_name}</span></div>}
      {startStr && <div style={styles.row}><span>Start Date</span><span>{dayjs(startStr).format('D MMM YYYY')}</span></div>}
      {endStr && <div style={styles.row}><span>End Date</span><span>{dayjs(endStr).format('D MMM YYYY')}</span></div>}
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
      {campaign.assigned_on && <div style={styles.row}><span>Assigned On</span><span>{new Date(campaign.assigned_on).toLocaleDateString()}</span></div>}

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

      {days.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={styles.sectionLabel}>Daily Posting Proof ({doneCount}/{actionableDays.length} submitted)</div>
          {proofsLocked && (
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              This campaign's current stage ({campaign.stage_name}) no longer accepts new proof submissions.
            </Typography.Text>
          )}
          <div style={styles.proofList}>
            {days.map(dateStr => {
              const proof = proofFor(dateStr);
              const isFuture = dateStr > today;
              const limitReached = proof?.status === 'rejected' && maxResubmissions > 0 && proof.rejection_count >= maxResubmissions;
              return (
                <div key={dateStr} style={styles.proofRow}>
                  <span style={{ fontSize: 12.5, color: '#555' }}>{dayjs(dateStr).format('D MMM YYYY')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {proof && (
                      <Image src={proof.image_path} width={26} height={26} style={{ objectFit: 'cover', borderRadius: 4 }} />
                    )}
                    {proof?.status_views != null && (
                      <span style={{ fontSize: 12, color: '#888' }}>{Number(proof.status_views).toLocaleString()} views</span>
                    )}
                    <Tag color={proof ? PROOF_STATUS_COLOR[proof.status] : 'default'} style={{ margin: 0 }}>
                      {proof ? proof.status.charAt(0).toUpperCase() + proof.status.slice(1) : (isFuture ? 'Upcoming' : 'Not submitted')}
                    </Tag>
                    {!proofsLocked && !limitReached && !isFuture && (!proof || proof.status === 'rejected') && (
                      <Button size="small" type={proof?.status === 'rejected' ? 'default' : 'primary'} onClick={() => openUpload(dateStr)}>
                        {proof ? 'Resubmit' : 'Upload'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        title={`Submit Proof — ${uploadTarget ? dayjs(uploadTarget.dateStr).format('D MMM YYYY') : ''}`}
        open={!!uploadTarget}
        onOk={submitProof}
        onCancel={() => setUploadTarget(null)}
        confirmLoading={submittingProof}
        okText="Submit"
        centered
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
          {campaign.campaign_title}
        </Typography.Paragraph>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>
            Number of Status Views <span style={{ color: '#ff4d4f' }}>*</span>
          </div>
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="e.g. 500"
            value={uploadStatusViews}
            onChange={setUploadStatusViews}
          />
        </div>
        <ImageUploadField
          value={uploadPreview}
          onChange={file => { setUploadFile(file); setUploadPreview(URL.createObjectURL(file)); }}
          onRemove={uploadFile ? () => { setUploadFile(null); setUploadPreview(null); } : null}
          hint="Screenshot of your status posting for this day · Max 5MB"
        />
      </Modal>
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
  proofList: {
    maxHeight: 320, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 8,
  },
  proofRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '7px 10px', borderBottom: '1px solid #f5f5f5',
  },
};
