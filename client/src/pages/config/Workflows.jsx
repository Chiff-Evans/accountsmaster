import { useState, useEffect, useCallback, useRef } from 'react';
import cytoscape from 'cytoscape';
import cytoscapeDagre from 'cytoscape-dagre';
import {
  Tabs, Card, Button, Modal, Form, Input, Select, Switch, Space,
  Tag, Table, Tooltip, Typography, Empty, App, Spin, Row, Col, Pagination, ColorPicker,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, ApartmentOutlined,
  HistoryOutlined, EyeOutlined, SwapOutlined, ArrowRightOutlined,
  ZoomInOutlined, ZoomOutOutlined, FullscreenOutlined, ReloadOutlined,
} from '@ant-design/icons';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import { usePagePermissions } from '../../hooks/usePagePermissions';
import { useIsMobile } from '../../hooks/useIsMobile';
import api from '../../api';

try { cytoscape.use(cytoscapeDagre); } catch (_) {}

const { Text } = Typography;

const LAYOUT_OPTIONS = [
  { value: 'dagre',        label: 'Hierarchical' },
  { value: 'breadthfirst', label: 'Tree'         },
  { value: 'circle',       label: 'Circle'       },
  { value: 'concentric',   label: 'Concentric'   },
  { value: 'cose',         label: 'Force'        },
  { value: 'grid',         label: 'Grid'         },
];

const getLayoutConfig = (name, isMobile) => {
  const base = { animate: true, animationDuration: 350, padding: 40 };
  switch (name) {
    case 'dagre':
      return { ...base, name: 'dagre', rankDir: 'TB', animate: false,
        nodeSep: isMobile ? 40 : 60, rankSep: isMobile ? 60 : 90 };
    case 'breadthfirst':
      return { ...base, name: 'breadthfirst', directed: true, spacingFactor: 1.6 };
    case 'circle':
      return { ...base, name: 'circle', spacingFactor: 1.3 };
    case 'concentric':
      return { ...base, name: 'concentric', spacingFactor: 1.5,
        concentric: n => n.degree(), levelWidth: () => 2 };
    case 'cose':
      return { ...base, name: 'cose', nodeRepulsion: 6000, idealEdgeLength: 100 };
    case 'grid':
      return { ...base, name: 'grid', spacingFactor: 1.2 };
    default:
      return { ...base, name };
  }
};

const MOBILE_MODAL = {
  width: '100%',
  wrapClassName: 'mobile-fs',
  style: { top: 0, margin: 0, padding: 0 },
  styles: {
    content: { borderRadius: 0, height: '100dvh', overflowY: 'auto', padding: '16px 16px' },
    body: { padding: 0 },
    footer: { padding: '16px 0 8px', display: 'flex', justifyContent: 'flex-end', gap: 10 },
  },
  okButtonProps:     { size: 'large', style: { minWidth: 100 } },
  cancelButtonProps: { size: 'large', style: { minWidth: 80  } },
};

const tabLabel = (icon, text, isMobile) =>
  isMobile ? <Tooltip title={text}>{icon}</Tooltip> : <span>{icon} {text}</span>;

/* ─── Cytoscape Workflow Visualization ───────────────────── */
function WorkflowViz({ stages, transitions, isMobile, onRefresh }) {
  const containerRef  = useRef(null);
  const cyRef         = useRef(null);
  const layoutNameRef = useRef('dagre');
  const [layoutName, setLayoutName] = useState('dagre');

  useEffect(() => {
    if (!containerRef.current) return;
    if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null; }
    if (!stages.length) return;

    const nodeColor = s =>
      s.stage_color ||
      (s.is_initial ? '#52c41a' : s.is_terminal ? '#ff4d4f' : '#1677ff');

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...stages.map(s => ({
          data: { id: `s${s.id}`, label: s.stage_name, color: nodeColor(s) },
        })),
        ...transitions.map(t => ({
          data: { id: `t${t.id}`, source: `s${t.from_stage_id}`, target: `s${t.to_stage_id}`, label: t.action_label || '' },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            shape: 'ellipse',
            width: isMobile ? 44 : 54,
            height: isMobile ? 44 : 54,
            'background-color': 'data(color)',
            'border-width': 0,
            label: 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 6,
            'font-size': isMobile ? 12 : 14,
            'font-weight': 600,
            color: '#333',
            'text-wrap': 'wrap',
            'text-max-width': isMobile ? 70 : 90,
          },
        },
        {
          selector: 'node:selected',
          style: { 'border-width': 3, 'border-color': '#faad14' },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#93b8f0',
            'target-arrow-color': '#93b8f0',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': isMobile ? 9 : 10,
            color: '#888',
            'text-background-color': '#fff',
            'text-background-opacity': 1,
            'text-background-padding': '2px',
            'text-rotation': 'autorotate',
          },
        },
        {
          selector: 'edge:selected',
          style: { 'line-color': '#1677ff', 'target-arrow-color': '#1677ff' },
        },
      ],
      layout: getLayoutConfig(layoutNameRef.current, isMobile),
      userZoomingEnabled: true,
      userPanningEnabled: true,
      minZoom: 0.2,
      maxZoom: 4,
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null; }
    };
  }, [stages, transitions, isMobile]);

  const fit     = () => cyRef.current?.fit(undefined, 40);
  const zoomIn  = () => { const cy = cyRef.current; if (cy) cy.zoom({ level: cy.zoom() * 1.25, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } }); };
  const zoomOut = () => { const cy = cyRef.current; if (cy) cy.zoom({ level: cy.zoom() / 1.25, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } }); };
  const redraw  = () => { if (cyRef.current) cyRef.current.layout(getLayoutConfig(layoutNameRef.current, isMobile)).run(); };

  const changeLayout = name => {
    setLayoutName(name);
    layoutNameRef.current = name;
    if (cyRef.current) cyRef.current.layout(getLayoutConfig(name, isMobile)).run();
  };

  if (!stages.length) return <Empty description="No stages configured" style={{ padding: 40 }} />;

  return (
    <div>
      {/* Legend + controls */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <Tag color="green">● Initial</Tag>
        <Tag color="red">● Terminal</Tag>
        <Tag color="blue">● Intermediate</Tag>
        <div style={{ marginLeft: 'auto' }}>
          <Space size={4}>
            <Select
              size="small"
              value={layoutName}
              onChange={changeLayout}
              options={LAYOUT_OPTIONS}
              style={{ width: isMobile ? 110 : 130 }}
              popupMatchSelectWidth={false}
            />
            <Tooltip title="Redraw">
              <Button size="small" icon={<ReloadOutlined />} onClick={redraw} />
            </Tooltip>
            <Tooltip title="Zoom in">
              <Button size="small" icon={<ZoomInOutlined />} onClick={zoomIn} />
            </Tooltip>
            <Tooltip title="Zoom out">
              <Button size="small" icon={<ZoomOutOutlined />} onClick={zoomOut} />
            </Tooltip>
            <Tooltip title="Fit">
              <Button size="small" icon={<FullscreenOutlined />} onClick={fit} />
            </Tooltip>
            {onRefresh && (
              <Tooltip title="Refresh data">
                <Button size="small" icon={<ReloadOutlined />} onClick={onRefresh} />
              </Tooltip>
            )}
          </Space>
        </div>
      </div>

      {/* Graph canvas */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: isMobile ? 'calc(100vh - 230px)' : 'calc(100vh - 195px)',
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          background: '#f9f9fb',
        }}
      />
    </div>
  );
}

/* ─── Transitions config tab ─────────────────────────────── */
function TransitionsTab({ workflowId, stages }) {
  const { message } = App.useApp();
  const perms    = usePagePermissions();
  const isMobile = useIsMobile();
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [editingT, setEditingT]       = useState(null);
  const [editModal, setEditModal]     = useState(false);
  const [form]     = Form.useForm();
  const [editForm] = Form.useForm();

  const load = useCallback(async () => {
    if (!workflowId) return;
    setLoading(true);
    try { const r = await api.get(`/workflows/${workflowId}/transitions`); setTransitions(r.data); }
    finally { setLoading(false); }
  }, [workflowId]);

  useEffect(() => { load(); }, [load]);

  const addTransition = async () => {
    try {
      const vals = await form.validateFields();
      if (vals.from_stage_id === vals.to_stage_id)
        return message.error('From and To stage must be different');
      await api.post(`/workflows/${workflowId}/transitions`, vals);
      message.success('Transition added');
      form.resetFields();
      load();
    } catch (e) { if (e?.response) message.error(e.response.data?.message || 'Failed'); }
  };

  const openEdit = r => {
    setEditingT(r);
    editForm.setFieldsValue({
      from_stage_id: r.from_stage_id,
      to_stage_id:   r.to_stage_id,
      action_label:  r.action_label,
    });
    setEditModal(true);
  };

  const saveEdit = async () => {
    try {
      const vals = await editForm.validateFields();
      if (vals.from_stage_id === vals.to_stage_id)
        return message.error('From and To stage must be different');
      await api.put(`/workflows/${workflowId}/transitions/${editingT.id}`, vals);
      message.success('Transition updated');
      setEditModal(false);
      load();
    } catch (e) { if (e?.response) message.error(e.response.data?.message || 'Failed'); }
  };

  const remove = async id => {
    await api.delete(`/workflows/${workflowId}/transitions/${id}`);
    message.success('Removed');
    load();
  };

  const stageOptions = stages.map(s => ({ value: s.id, label: s.stage_name }));

  return (
    <div>
      {perms.canCreate && (
        <Card size="small" title="Add Transition" style={{ marginBottom: 16 }}>
          {isMobile ? (
            <Form form={form} layout="vertical">
              <Form.Item name="from_stage_id" label="From Stage"
                rules={[{ required: true }]} style={{ marginBottom: 12 }}>
                <Select placeholder="From Stage" options={stageOptions} showSearch optionFilterProp="label" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="to_stage_id" label="To Stage"
                rules={[{ required: true }]} style={{ marginBottom: 12 }}>
                <Select placeholder="To Stage" options={stageOptions} showSearch optionFilterProp="label" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="action_label" label="Action Label" style={{ marginBottom: 12 }}>
                <Input placeholder="e.g. Approve" style={{ width: '100%' }} />
              </Form.Item>
              <Button type="primary" icon={<PlusOutlined />} onClick={addTransition} block>Add</Button>
            </Form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Form form={form} style={{ display: 'contents' }}>
                <Form.Item name="from_stage_id" rules={[{ required: true }]}
                  style={{ flex: 1, marginBottom: 0 }}>
                  <Select placeholder="From Stage" options={stageOptions} showSearch optionFilterProp="label" style={{ width: '100%' }} />
                </Form.Item>
                <ArrowRightOutlined style={{ color: '#1677ff', fontSize: 18, flexShrink: 0 }} />
                <Form.Item name="to_stage_id" rules={[{ required: true }]}
                  style={{ flex: 1, marginBottom: 0 }}>
                  <Select placeholder="To Stage" options={stageOptions} showSearch optionFilterProp="label" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="action_label" style={{ flex: 1, marginBottom: 0 }}>
                  <Input placeholder="Action label (e.g. Approve)" style={{ width: '100%' }} />
                </Form.Item>
                <Button type="primary" icon={<PlusOutlined />} onClick={addTransition}
                  style={{ flexShrink: 0 }}>Add</Button>
              </Form>
            </div>
          )}
        </Card>
      )}

      <Table
        rowKey="id"
        size="small"
        loading={loading}
        dataSource={transitions}
        pagination={false}
        scroll={{ x: true, y: 'calc(100vh - 335px)' }}
        columns={[
          { title: 'From Stage', dataIndex: 'from_stage_name', key: 'from' },
          { title: '', key: 'arr', width: 40,
            render: () => <ArrowRightOutlined style={{ color: '#1677ff' }} /> },
          { title: 'To Stage', dataIndex: 'to_stage_name', key: 'to' },
          { title: 'Action Label', dataIndex: 'action_label', key: 'lbl' },
          (perms.canEdit || perms.canDelete) ? {
            title: '', key: 'actions', width: perms.canEdit && perms.canDelete ? 80 : 50,
            align: 'right',
            render: (_, r) => (
              <Space size={0}>
                {perms.canEdit && (
                  <Tooltip title="Edit">
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
                  </Tooltip>
                )}
                {perms.canDelete && (
                  <Tooltip title="Delete">
                    <Button type="link" danger size="small" icon={<DeleteOutlined />}
                      onClick={() => Modal.confirm({
                        title: 'Remove this transition?', okType: 'danger', okText: 'Remove',
                        centered: true,
                        onOk: () => remove(r.id),
                      })} />
                  </Tooltip>
                )}
              </Space>
            ),
          } : {},
        ].filter(c => c.key)}
      />

      {/* Edit Transition Modal */}
      <Modal
        title="Edit Transition"
        open={editModal}
        onOk={saveEdit}
        onCancel={() => setEditModal(false)}
        okText="Save"
        centered
        width={isMobile ? '92vw' : 440}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <LabelField label="From Stage" required>
            <Form.Item name="from_stage_id" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Select options={stageOptions} showSearch optionFilterProp="label" style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>
          <LabelField label="To Stage" required>
            <Form.Item name="to_stage_id" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Select options={stageOptions} showSearch optionFilterProp="label" style={{ width: '100%' }} />
            </Form.Item>
          </LabelField>
          <LabelField label="Action Label">
            <Form.Item name="action_label" style={{ marginBottom: 8 }}>
              <Input placeholder="e.g. Approve" />
            </Form.Item>
          </LabelField>
        </Form>
      </Modal>
    </div>
  );
}

/* ─── History tab ────────────────────────────────────────── */
// Entity types are derived from whatever workflows actually exist — add a
// new workflow for a new entity and it shows up here automatically, no code
// change needed.
const titleCase = s => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const dataTableToEntityType = dt => dt.replace(/s$/, '');

function HistoryTab() {
  const isMobile = useIsMobile();
  const [data, setData]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [entityType, setEntityType] = useState(null);
  const [page, setPage]       = useState(1);
  const [entityTypeOptions, setEntityTypeOptions] = useState([]);

  useEffect(() => {
    api.get('/workflows').then(r => {
      const options = (r.data || [])
        .filter(w => w.data_table)
        .map(w => ({ value: dataTableToEntityType(w.data_table), label: titleCase(w.data_table) }))
        .filter((opt, i, arr) => arr.findIndex(o => o.value === opt.value) === i);
      setEntityTypeOptions(options);
      setEntityType(prev => prev ?? options[0]?.value ?? null);
    }).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!entityType) return;
    setLoading(true);
    try {
      const r = await api.get('/workflows/history', { params: { entity_type: entityType, page, limit: 20 } });
      setData(r.data.data);
      setTotal(r.data.total);
    } finally { setLoading(false); }
  }, [entityType, page]);

  useEffect(() => { load(); }, [load]);

  const stageTag = (label, color) =>
    label
      ? <Tag color={color || undefined}>{label.replace(/_/g, ' ').toUpperCase()}</Tag>
      : <Text type="secondary">—</Text>;

  const cols = [
    { title: 'Entity', dataIndex: 'entity_ref', key: 'ref',
      render: (v, r) => <Space size={4}>{v && <Text strong>{v}</Text>}<Text code>{r.entity_type}</Text></Space> },
    { title: 'From', key: 'from',
      render: (_, r) => stageTag(r.from_status, r.from_stage_color) },
    { title: 'To', key: 'to',
      render: (_, r) => stageTag(r.to_status, r.to_stage_color) },
    { title: 'Moved By', dataIndex: 'moved_by_name', key: 'by' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: v => v || '—' },
    { title: 'Date', dataIndex: 'moved_at', key: 'dt',
      render: v => new Date(v).toLocaleString() },
  ];

  const statusTag = (v, color) =>
    v ? <Tag color={color || undefined}>{v.replace(/_/g,' ').toUpperCase()}</Tag>
      : <Text type="secondary">—</Text>;

  return (
    <div>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <Text style={{ whiteSpace: 'nowrap' }}>Entity Type:</Text>
        <Select value={entityType} onChange={v => { setEntityType(v); setPage(1); }}
          style={{ width: isMobile ? '100%' : 180, flex: isMobile ? 1 : undefined }}
          options={entityTypeOptions} />
      </div>

      {isMobile ? (
        /* ── Mobile card list ── */
        <Spin spinning={loading}>
          {!data.length && !loading && (
            <Empty description="No history records" style={{ padding: 32 }} />
          )}
          {data.map(r => (
            <Card key={r.id} size="small" variant="outlined"
              style={{ marginBottom: 10, borderRadius: 10 }}
              styles={{ body: { padding: '10px 14px' } }}>
              {/* Header: entity ref + date */}
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 8 }}>
                <Space size={4}>
                  <Text strong style={{ fontSize: 13 }}>{r.entity_ref}</Text>
                  <Text code style={{ fontSize: 11 }}>{r.entity_type}</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {new Date(r.moved_at).toLocaleDateString()}
                </Text>
              </div>
              {/* From → To */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {statusTag(r.from_status, r.from_stage_color)}
                <ArrowRightOutlined style={{ color: '#1677ff', fontSize: 12, flexShrink: 0 }} />
                {statusTag(r.to_status, r.to_stage_color)}
              </div>
              {/* Footer: moved by + notes */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  by <Text strong style={{ fontSize: 12 }}>{r.moved_by_name || '—'}</Text>
                </Text>
                {r.notes && <Text type="secondary" style={{ fontSize: 11 }}>{r.notes}</Text>}
              </div>
            </Card>
          ))}
          {total > 20 && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
              <Pagination size="small" current={page} total={total} pageSize={20}
                onChange={setPage} showTotal={t => `${t} entries`} />
            </div>
          )}
        </Spin>
      ) : (
        /* ── Desktop table ── */
        <Table
          rowKey="id" size="small" loading={loading}
          dataSource={data} columns={cols}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage,
            showTotal: t => `${t} entries`, size: 'small' }}
          scroll={{ x: true, y: 'calc(100vh - 280px)' }}
        />
      )}
    </div>
  );
}

/* ─── Main Workflows Page ────────────────────────────────── */
export default function Workflows() {
  const { message } = App.useApp();
  const perms    = usePagePermissions();
  const isMobile = useIsMobile();

  const [workflows, setWorkflows]       = useState([]);
  const [processTypes, setProcessTypes] = useState([]);
  const [roles, setRoles]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [wfModal, setWfModal]           = useState(false);
  const [editingWf, setEditingWf]       = useState(null);

  const [activeWf, setActiveWf]         = useState(null);
  const [stages, setStages]             = useState([]);
  const [stageModal, setStageModal]     = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [activeTab, setActiveTab]       = useState('workflows');

  const [wfForm]    = Form.useForm();
  const [stageForm] = Form.useForm();

  const modalProps = { centered: true, width: isMobile ? '92vw' : 480 };

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const [wf, pt, rl] = await Promise.all([
        api.get('/workflows'), api.get('/process-types'), api.get('/roles'),
      ]);
      setWorkflows(wf.data);
      setProcessTypes(pt.data);
      setRoles(rl.data);
    } finally { setLoading(false); }
  }, []);

  const loadStages = useCallback(async () => {
    if (!activeWf) return;
    const r = await api.get(`/workflows/${activeWf.id}/stages`);
    setStages(r.data);
  }, [activeWf]);

  useEffect(() => { loadWorkflows(); }, [loadWorkflows]);
  useEffect(() => { loadStages(); }, [loadStages]);

  const saveWorkflow = async () => {
    try {
      const vals = await wfForm.validateFields();
      if (editingWf) await api.put(`/workflows/${editingWf.id}`, vals);
      else           await api.post('/workflows', vals);
      message.success('Saved');
      setWfModal(false);
      loadWorkflows();
    } catch (e) { if (e?.response) message.error('Failed'); }
  };

  const deleteWorkflow = async r => {
    try { await api.delete(`/workflows/${r.id}`); message.success('Deleted'); loadWorkflows(); }
    catch { message.error('Cannot delete'); }
  };

  const saveStage = async () => {
    try {
      const vals = await stageForm.validateFields();
      vals.is_initial        = vals.is_initial        ? 1 : 0;
      vals.is_terminal       = vals.is_terminal       ? 1 : 0;
      vals.include_in_revenue = vals.include_in_revenue ? 1 : 0;
      vals.advertiser_can_edit = vals.advertiser_can_edit ? 1 : 0;
      vals.send_approval_email = vals.send_approval_email ? 1 : 0;
      vals.assign_ref_no = vals.assign_ref_no ? 1 : 0;
      vals.show_in_grid_default = vals.show_in_grid_default ? 1 : 0;
      if (vals.stage_color && typeof vals.stage_color === 'object') {
        vals.stage_color = vals.stage_color.toHexString();
      }
      if (editingStage) await api.put(`/workflows/${activeWf.id}/stages/${editingStage.id}`, vals);
      else              await api.post(`/workflows/${activeWf.id}/stages`, vals);
      message.success('Saved');
      setStageModal(false);
      loadStages();
    } catch (e) { if (e?.response) message.error('Failed'); }
  };

  const deleteStage = async r => {
    try { await api.delete(`/workflows/${activeWf.id}/stages/${r.id}`); message.success('Deleted'); loadStages(); }
    catch { message.error('Cannot delete — may have transitions attached'); }
  };

  const wfCols = [
    { title: 'Workflow Name', dataIndex: 'workflow_name', key: 'name' },
    { title: 'Process Type', dataIndex: 'process_type_name', key: 'pt',
      render: v => v || '—', hiddenOnMobile: true },
    { title: 'Description', dataIndex: 'description', key: 'desc',
      render: v => v || '—', hiddenOnMobile: true },
    { title: 'Status', dataIndex: 'is_active', key: 'act',
      render: v => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag> },
  ];

  const stageCols = [
    { title: 'Stage Name', dataIndex: 'stage_name', key: 'name', mobileHeaderSize: 13 },
    { title: '#',     dataIndex: 'stage_order',     key: 'ord',   mobileExpanded: true, render: v => <Tag>{v}</Tag> },
    { title: 'Status', dataIndex: 'workflow_status', key: 'ws',   mobileExpanded: true,
      render: (v, r) => v ? <Tag color={r.stage_color || undefined}>{v}</Tag> : null },
    { title: 'Flags', key: 'flags', mobileExpanded: true,
      render: (_, r) => (
        <Space size={4}>
          {r.is_initial  ? <Tag color="green">Initial</Tag>  : null}
          {r.is_terminal ? <Tag color="red">Terminal</Tag>   : null}
          {!r.is_initial && !r.is_terminal ? <Tag>—</Tag> : null}
        </Space>
      )},
    { title: 'Color', dataIndex: 'stage_color', key: 'color', mobileExpanded: true,
      render: v => v ? (
        <Space size={6}>
          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, background: v, border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }} />
          <Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace' }}>{v}</Text>
        </Space>
      ) : null },
    { title: 'Revenue', dataIndex: 'include_in_revenue', key: 'rev', mobileExpanded: true,
      render: v => v || v === undefined
        ? <Tag color="green">Included</Tag>
        : <Tag color="red">Excluded</Tag> },
    { title: 'Portal Edit', dataIndex: 'advertiser_can_edit', key: 'edit', mobileExpanded: true,
      render: v => v || v === undefined
        ? <Tag color="green">Allowed</Tag>
        : <Tag color="red">Locked</Tag> },
    { title: 'Status Email', dataIndex: 'send_approval_email', key: 'send_approval_email', mobileExpanded: true,
      render: v => v
        ? <Tag color="blue">Sends</Tag>
        : <Tag>—</Tag> },
    { title: 'File Number', dataIndex: 'assign_ref_no', key: 'assign_ref_no', mobileExpanded: true,
      render: v => v
        ? <Tag color="orange">Assigns</Tag>
        : <Tag>—</Tag> },
    { title: 'In Grid', dataIndex: 'show_in_grid_default', key: 'show_in_grid_default', mobileExpanded: true,
      render: v => v || v === undefined
        ? <Tag color="green">Shown</Tag>
        : <Tag color="red">Hidden</Tag> },
    { title: 'Responsible Group', dataIndex: 'responsible_group', key: 'rg', mobileExpanded: true,
      render: v => v ? <Tag>{v}</Tag> : null },
  ];

  const ptOptions   = processTypes.map(p => ({ value: p.id,          label: p.process_type_name }));
  const roleOptions = roles.map(r         => ({ value: r.role_name,   label: r.role_name }));
  const openWorkflow = r => { setActiveWf(r); setActiveTab('stages'); };

  const workflowTabs = activeWf ? [
    {
      key: 'stages',
      label: tabLabel(<ApartmentOutlined />, 'Stages', isMobile),
      children: (
        <CrudTable
          title={`Stages — ${activeWf.workflow_name}`}
          columns={stageCols}
          dataSource={stages}
          loading={false}
          rowKey="id"
          heightOffset={46}
          onAdd={perms.canCreate ? () => { setEditingStage(null); stageForm.resetFields(); stageForm.setFieldsValue({ include_in_revenue: true, advertiser_can_edit: true, send_approval_email: false, assign_ref_no: false, show_in_grid_default: true }); setStageModal(true); } : null}
          onEdit={perms.canEdit ? r => {
            setEditingStage(r);
            stageForm.setFieldsValue({ ...r, is_initial: !!r.is_initial, is_terminal: !!r.is_terminal, include_in_revenue: r.include_in_revenue !== 0, advertiser_can_edit: r.advertiser_can_edit !== 0, send_approval_email: !!r.send_approval_email, assign_ref_no: !!r.assign_ref_no, show_in_grid_default: r.show_in_grid_default !== 0 });
            setStageModal(true);
          } : null}
          onDelete={perms.canDelete ? deleteStage : null}
          onRefresh={loadStages}
          searchPlaceholder="Search stages..."
        />
      ),
    },
    {
      key: 'transitions',
      label: tabLabel(<SwapOutlined />, 'Transitions', isMobile),
      children: <TransitionsTab workflowId={activeWf.id} stages={stages} />,
    },
    {
      key: 'visualization',
      label: tabLabel(<EyeOutlined />, 'Visualization', isMobile),
      children: <VisualizationWrapper workflowId={activeWf.id} stages={stages} isMobile={isMobile} />,
    },
  ] : [];

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={key => {
          // Going back to the plain list exits whichever workflow was open,
          // so "History" (hidden while a workflow's own tabs are showing)
          // reappears instead of staying hidden for the rest of the session.
          if (key === 'workflows') setActiveWf(null);
          setActiveTab(key);
        }}
        items={[
          {
            key: 'workflows',
            label: 'Workflows',
            children: (
              <CrudTable
                title="Workflows"
                columns={wfCols}
                dataSource={workflows}
                loading={loading}
                rowKey="id"
                heightOffset={46}
                onAdd={perms.canCreate ? () => {
                  setEditingWf(null);
                  wfForm.resetFields();
                  wfForm.setFieldsValue({ is_active: true });
                  setWfModal(true);
                } : null}
                onEdit={perms.canEdit ? r => {
                  setEditingWf(r);
                  wfForm.setFieldsValue({ ...r, is_active: !!r.is_active });
                  setWfModal(true);
                } : null}
                onDelete={perms.canDelete ? deleteWorkflow : null}
                onRefresh={loadWorkflows}
                searchPlaceholder="Search workflows..."
                extraActions={r => (
                  <Tooltip title="Open Workflow">
                    <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openWorkflow(r)}>
                      {isMobile ? null : 'Open'}
                    </Button>
                  </Tooltip>
                )}
              />
            ),
          },
          ...workflowTabs,
          ...(!activeWf ? [{
            key: 'history',
            label: tabLabel(<HistoryOutlined />, 'History', isMobile),
            children: <HistoryTab />,
          }] : []),
        ]}
        tabBarExtraContent={activeWf && !isMobile && (
          <Tag color="blue"><ApartmentOutlined /> {activeWf.workflow_name}</Tag>
        )}
      />

      {/* Workflow Modal */}
      {/* Workflow Modal */}
      <Modal
        title={editingWf ? 'Edit Workflow' : 'New Workflow'}
        open={wfModal}
        onOk={saveWorkflow}
        onCancel={() => setWfModal(false)}
        okText="Save"
        {...modalProps}
      >
        <Form form={wfForm} layout="vertical" style={{ marginTop: 24 }}>
          <LabelField label="Workflow Name" required>
            <Form.Item name="workflow_name" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Description">
            <Form.Item name="description" style={{ marginBottom: 20 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </LabelField>

          <LabelField label="Process Type">
            <Form.Item name="process_type_id" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch optionFilterProp="label" options={ptOptions} />
            </Form.Item>
          </LabelField>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>Active</span>
            <Form.Item name="is_active" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Stage Modal */}
      <Modal
        title={editingStage ? 'Edit Stage' : 'New Stage'}
        open={stageModal}
        onOk={saveStage}
        onCancel={() => setStageModal(false)}
        okText="Save"
        {...modalProps}
      >
        <Form form={stageForm} layout="vertical" style={{ marginTop: 24 }}>
          <LabelField label="Stage Name" required>
            <Form.Item name="stage_name" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <Row gutter={12}>
            <Col xs={14} sm={16}>
              <LabelField label="Workflow Status">
                <Form.Item name="workflow_status" style={{ marginBottom: 20 }}>
                  <Input />
                </Form.Item>
              </LabelField>
            </Col>
            <Col xs={10} sm={8}>
              <LabelField label="Order">
                <Form.Item name="stage_order" style={{ marginBottom: 20 }}>
                  <Input type="number" min={0} />
                </Form.Item>
              </LabelField>
            </Col>
          </Row>

          <LabelField label="Stage Color">
            <Form.Item name="stage_color" style={{ marginBottom: 20 }}>
              <ColorPicker format="hex" showText style={{ width: '100%', justifyContent: 'flex-start' }} />
            </Form.Item>
          </LabelField>

          <LabelField label="Responsible Group">
            <Form.Item name="responsible_group" style={{ marginBottom: 20 }}>
              <Select allowClear showSearch options={roleOptions} />
            </Form.Item>
          </LabelField>

          <LabelField label="Description">
            <Form.Item name="description" style={{ marginBottom: 20 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </LabelField>

          {/* Flags row — always two per row; a trailing odd one spans the full width */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 4,
          }}>
            {(() => {
              const flags = [
                { name: 'is_initial',        label: 'Initial Stage',   color: '#52c41a' },
                { name: 'is_terminal',       label: 'Terminal Stage',  color: '#ff4d4f' },
                { name: 'include_in_revenue', label: 'Count Revenue',  color: '#1677ff' },
                { name: 'advertiser_can_edit', label: 'Advertiser Can Edit', color: '#722ed1' },
                { name: 'send_approval_email', label: 'Send Status Email', color: '#13c2c2' },
                { name: 'assign_ref_no',       label: 'Assign File Number', color: '#fa8c16' },
                { name: 'show_in_grid_default', label: 'Show In Grid By Default', color: '#52c41a' },
              ];
              const isLastOdd = i => flags.length % 2 === 1 && i === flags.length - 1;
              return flags.map(({ name, label, color }, i) => (
                <div key={name} style={{
                  gridColumn: isLastOdd(i) ? '1 / -1' : undefined,
                  display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRight: (i % 2 === 0 && !isLastOdd(i)) ? '1px solid #f0f0f0' : 'none',
                  borderTop: i > 1 ? '1px solid #f0f0f0' : 'none',
                  background: '#fafafa',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color }}>{label}</div>
                  <Form.Item name={name} valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                </div>
              ));
            })()}
          </div>
        </Form>
      </Modal>
    </>
  );
}

/* Visualization wrapper — fetches transitions independently */
function VisualizationWrapper({ workflowId, stages, isMobile }) {
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading]         = useState(false);

  const load = useCallback(async () => {
    if (!workflowId) return;
    setLoading(true);
    try { const r = await api.get(`/workflows/${workflowId}/transitions`); setTransitions(r.data); }
    finally { setLoading(false); }
  }, [workflowId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spin style={{ display: 'block', margin: '60px auto' }} />;

  return (
    <WorkflowViz stages={stages} transitions={transitions} isMobile={isMobile} onRefresh={load} />
  );
}
