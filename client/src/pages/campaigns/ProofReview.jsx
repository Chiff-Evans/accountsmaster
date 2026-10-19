import { useState, useEffect, useCallback } from 'react';
import { Select, Tag, Image, Button, Modal, Input, App, Typography, Popover, Checkbox, Space } from 'antd';
import { CheckOutlined, CloseOutlined, UndoOutlined, TableOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import CrudTable from '../../components/common/CrudTable';
import { useIsMobile } from '../../hooks/useIsMobile';
import api from '../../api';

const STATUS_COLOR = { pending: 'gold', accepted: 'green', rejected: 'red' };
const dateFmt = v => v ? dayjs(v).format('D MMM YYYY') : '—';
const dateTimeFmt = v => v ? dayjs(v).format('D MMM YYYY, h:mm A') : '—';

export default function ProofReview() {
  const { message, modal } = App.useApp();
  const isMobile = useIsMobile();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(''); // default to All Statuses — keeps accepted/rejected history visible
  const [loading, setLoading] = useState(false);
  const [hiddenCols, setHiddenCols] = useState(new Set(['submitted_on', 'review_notes']));

  const [rejecting, setRejecting] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/campaign-proofs', { params: { page, limit, search, status: status || undefined } });
      setData(r.data.data); setTotal(r.data.total);
    } finally { setLoading(false); }
  }, [page, limit, search, status]);

  useEffect(() => { load(); }, [load]);

  const accept = async record => {
    setReviewingId(record.id);
    try {
      await api.post(`/campaign-proofs/${record.id}/review`, { action: 'accept' });
      message.success('Proof accepted');
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to accept proof');
    } finally { setReviewingId(null); }
  };

  const revert = record => {
    modal.confirm({
      title: 'Revert this proof to Pending?',
      content: `${record.brand_ambassador_name} — ${record.campaign_title} (${dateFmt(record.proof_date)}). It will need to be reviewed again.`,
      okText: 'Revert',
      centered: true,
      onOk: async () => {
        setReviewingId(record.id);
        try {
          await api.post(`/campaign-proofs/${record.id}/review`, { action: 'revert' });
          message.success('Proof reverted to Pending');
          load();
        } catch (err) {
          message.error(err.response?.data?.message || 'Failed to revert proof');
        } finally { setReviewingId(null); }
      },
    });
  };

  const submitReject = async () => {
    if (!rejectNotes.trim()) return message.warning('A reason is required to reject a proof');
    setReviewingId(rejecting.id);
    try {
      await api.post(`/campaign-proofs/${rejecting.id}/review`, { action: 'reject', notes: rejectNotes.trim() });
      message.success('Proof rejected');
      setRejecting(null);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to reject proof');
    } finally { setReviewingId(null); }
  };

  const allColumns = [
    { title: '', key: 'thumb', width: 60, render: (_, r) => (
      <Image src={r.image_path} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6 }} />
    ) },
    { title: 'Campaign', key: 'campaign', render: (_, r) => (
      <div>
        <div style={{ fontWeight: 600 }}>{r.campaign_title}</div>
        {r.file_no && <Tag color="blue" style={{ marginTop: 2 }}>{r.file_no}</Tag>}
      </div>
    ) },
    { title: 'Brand Ambassador', key: 'brand_ambassador', render: (_, r) => (
      <div>
        <div>{r.brand_ambassador_name}</div>
        {r.brand_ambassador_ref_no && <Typography.Text type="secondary" style={{ fontSize: 12 }}>{r.brand_ambassador_ref_no}</Typography.Text>}
      </div>
    ) },
    { title: 'Proof Date', dataIndex: 'proof_date', key: 'proof_date', mobileExpanded: true, render: dateFmt },
    { title: 'Views', dataIndex: 'status_views', key: 'status_views', mobileExpanded: true,
      render: v => v != null ? Number(v).toLocaleString() : '—' },
    { title: 'Status', dataIndex: 'status', key: 'status', mobileExpanded: true,
      render: v => <Tag color={STATUS_COLOR[v] || 'default'}>{v?.charAt(0).toUpperCase() + v?.slice(1)}</Tag> },
    { title: 'Rejections', dataIndex: 'rejection_count', key: 'rejection_count', mobileExpanded: true,
      render: v => Number(v || 0) },
    { title: 'Submitted On', dataIndex: 'submitted_on', key: 'submitted_on', mobileExpanded: true, render: dateTimeFmt },
    { title: 'Reviewer', dataIndex: 'reviewer_name', key: 'reviewer_name', mobileExpanded: true, render: v => v?.trim() || '—' },
    { title: 'Reviewed On', dataIndex: 'reviewed_on', key: 'reviewed_on', mobileExpanded: true, render: dateTimeFmt },
    { title: 'Review Notes', dataIndex: 'review_notes', key: 'review_notes', mobileExpanded: true, render: v => v || '—' },
  ];
  const columns = allColumns.filter(c => !hiddenCols.has(c.key));

  const colToggle = (
    <Popover
      title="Show / hide columns"
      trigger="click"
      content={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 150 }}>
          {allColumns.filter(c => c.title).map(c => (
            <Checkbox
              key={c.key}
              checked={!hiddenCols.has(c.key)}
              onChange={e => setHiddenCols(prev => {
                const next = new Set(prev);
                e.target.checked ? next.delete(c.key) : next.add(c.key);
                return next;
              })}
            >{c.title}</Checkbox>
          ))}
        </div>
      }
    >
      <Button icon={<TableOutlined />} />
    </Popover>
  );

  return (
    <>
      <CrudTable
        title="Proof Review"
        columns={columns}
        dataSource={data}
        loading={loading}
        onSearch={v => { setSearch(v); setPage(1); }}
        onRefresh={load}
        pagination={{ current: page, total, pageSize: limit, onChange: (p, ps) => { setPage(p); setLimit(ps); }, showTotal: t => `${t} proofs` }}
        searchPlaceholder="Search by campaign, file no, or brand ambassador..."
        extraRow
        extra={
          isMobile ? (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <Select
                value={status}
                onChange={v => { setStatus(v); setPage(1); }}
                style={{ flex: 1, minWidth: 0 }}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />
              {colToggle}
            </div>
          ) : (
            <Space wrap>
              <Select
                value={status}
                onChange={v => { setStatus(v); setPage(1); }}
                style={{ width: 160 }}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />
              {colToggle}
            </Space>
          )
        }
        extraActions={record => {
          if (record.status === 'pending') return (
            <>
              <Button
                type="link" size="small" icon={<CheckOutlined />} style={{ color: '#389e0d' }}
                loading={reviewingId === record.id} onClick={() => accept(record)} title="Accept"
              />
              <Button
                type="link" danger size="small" icon={<CloseOutlined />}
                loading={reviewingId === record.id} onClick={() => { setRejecting(record); setRejectNotes(''); }} title="Reject"
              />
            </>
          );
          if (record.status === 'accepted' || record.status === 'rejected') return (
            <Button
              type="link" size="small" icon={<UndoOutlined />}
              loading={reviewingId === record.id} onClick={() => revert(record)} title="Revert to Pending"
            />
          );
          return null;
        }}
      />

      <Modal
        title="Reject Proof"
        open={!!rejecting}
        onOk={submitReject}
        onCancel={() => setRejecting(null)}
        confirmLoading={reviewingId === rejecting?.id}
        okText="Reject"
        okButtonProps={{ danger: true }}
        centered
      >
        <Typography.Paragraph type="secondary">
          {rejecting?.brand_ambassador_name} — {rejecting?.campaign_title} ({dateFmt(rejecting?.proof_date)})
        </Typography.Paragraph>
        <Input.TextArea
          rows={3}
          placeholder="Reason for rejection…"
          value={rejectNotes}
          onChange={e => setRejectNotes(e.target.value)}
        />
      </Modal>
    </>
  );
}
