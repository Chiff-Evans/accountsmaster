import { useEffect, useState, useCallback, useMemo } from 'react';
import { Tabs, Segmented, DatePicker, Table, Tag, Card, Row, Col, Typography, Button, Spin, Empty } from 'antd';
import {
  DollarOutlined, WalletOutlined, RiseOutlined, NotificationOutlined, PrinterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useIsMobile } from '../../hooks/useIsMobile';
import api from '../../api';

const { RangePicker } = DatePicker;

/* ── formatting shared by both the on-screen Table and the print output ── */
const FORMATTERS = {
  text:    v => (v ?? v === 0 ? v : '—'),
  number:  v => v != null ? Number(v).toLocaleString() : '—',
  money:   v => v != null ? `KES ${Number(v).toLocaleString()}` : '—',
  percent: v => v != null ? `${Number(v).toFixed(1)}%` : '—',
  date:    v => v ? dayjs(v).format('D MMM YYYY') : '—',
};

/* Each view is just: where to fetch from + how to render its columns.
   `total: true` marks a numeric column that gets summed in the footer/print. */
const VIEWS = {
  'revenue:campaign': {
    path: '/reports/revenue/by-campaign', label: 'By Campaign',
    columns: [
      { title: 'File No', dataIndex: 'file_no' },
      { title: 'Campaign', dataIndex: 'campaign_title' },
      { title: 'Payments', dataIndex: 'payment_count', format: 'number' },
      { title: 'Revenue', dataIndex: 'total_revenue', format: 'money', total: true },
    ],
  },
  'revenue:advertiser': {
    path: '/reports/revenue/by-advertiser', label: 'By Advertiser',
    columns: [
      { title: 'Advertiser', dataIndex: 'advertiser_name' },
      { title: 'Payments', dataIndex: 'payment_count', format: 'number' },
      { title: 'Revenue', dataIndex: 'total_revenue', format: 'money', total: true },
    ],
  },
  'revenue:stage': {
    path: '/reports/revenue/by-stage', label: 'By Stage',
    columns: [
      { title: 'Campaign', dataIndex: 'campaign_title' },
      { title: 'Stage', dataIndex: 'stage_name', tag: true, tagColor: r => r.stage_color },
      { title: 'Payments', dataIndex: 'payment_count', format: 'number' },
      { title: 'Revenue', dataIndex: 'total_revenue', format: 'money', total: true },
    ],
  },
  'revenue:date': {
    path: '/reports/revenue/by-date', label: 'By Date',
    columns: [
      { title: 'Date', dataIndex: 'date', format: 'date' },
      { title: 'Payments', dataIndex: 'payment_count', format: 'number' },
      { title: 'Revenue', dataIndex: 'total_revenue', format: 'money', total: true },
    ],
  },
  'profit:campaign': {
    path: '/reports/profit/by-campaign', label: 'By Campaign',
    columns: [
      { title: 'File No', dataIndex: 'file_no' },
      { title: 'Campaign', dataIndex: 'campaign_title' },
      { title: 'Revenue', dataIndex: 'revenue', format: 'money', total: true },
      { title: 'Expenditure', dataIndex: 'expenditure', format: 'money', total: true },
      { title: 'Profit', dataIndex: 'profit', format: 'money', total: true, signColor: true },
      { title: 'Margin', dataIndex: 'margin', format: 'percent' },
    ],
  },
  'expenditure:campaign': {
    path: '/reports/expenditure/by-campaign', label: 'By Campaign',
    columns: [
      { title: 'File No', dataIndex: 'file_no' },
      { title: 'Campaign', dataIndex: 'campaign_title' },
      { title: 'Entries', dataIndex: 'entry_count', format: 'number' },
      { title: 'Expenditure', dataIndex: 'total_expenditure', format: 'money', total: true },
    ],
  },
  'expenditure:item': {
    path: '/reports/expenditure/by-item', label: 'By Item',
    columns: [
      { title: 'Type', dataIndex: 'type_name' },
      { title: 'Entries', dataIndex: 'entry_count', format: 'number' },
      { title: 'Expenditure', dataIndex: 'total_expenditure', format: 'money', total: true },
    ],
  },
  'expenditure:date': {
    path: '/reports/expenditure/by-date', label: 'By Date',
    columns: [
      { title: 'Date', dataIndex: 'date', format: 'date' },
      { title: 'Entries', dataIndex: 'entry_count', format: 'number' },
      { title: 'Expenditure', dataIndex: 'total_expenditure', format: 'money', total: true },
    ],
  },
};

const CATEGORY_SUBVIEWS = {
  revenue:     ['campaign', 'advertiser', 'stage', 'date'],
  profit:      ['campaign'],
  expenditure: ['campaign', 'item', 'date'],
};

/* ── print (same self-contained approach used elsewhere in this app —
   inject a print stylesheet once, build a plain HTML table, window.print()) ── */
function ensurePrintStyle() {
  if (document.getElementById('campaigns-report-print-style')) return;
  const style = document.createElement('style');
  style.id = 'campaigns-report-print-style';
  style.innerHTML = `
    /* Hidden during normal browsing — plain display:none, not just
       visibility, so it never affects on-screen layout. */
    #campaigns-report-printable { display: none; }
    @media print {
      @page { size: A4 landscape; margin: 14mm; }
      body * { visibility: hidden; }
      /* visibility:visible alone can't override the display:none above —
         it has to be re-declared display:block here too, or nothing
         prints at all (that was the actual bug: the div stayed
         display:none straight through printing). */
      #campaigns-report-printable { display: block !important; visibility: visible; position: absolute; top: 0; left: 0; width: 100%; }
      #campaigns-report-printable * { visibility: visible; }
      #campaigns-report-printable table { width: 100%; border-collapse: collapse; font-size: 12px; }
      #campaigns-report-printable th, #campaigns-report-printable td { border: 1px solid #ccc; padding: 6px 8px; }
      #campaigns-report-printable th { background: #f0f0f0; text-align: left; }
    }
  `;
  document.head.appendChild(style);
  if (!document.getElementById('campaigns-report-printable')) {
    const div = document.createElement('div');
    div.id = 'campaigns-report-printable';
    document.body.appendChild(div);
  }
}

function printReport({ title, periodLabel, view, rows }) {
  ensurePrintStyle();
  const cols = view.columns;
  const totalsCells = cols.map((c, i) => {
    if (i === 0) return '<td><strong>Total</strong></td>';
    if (!c.total) return '<td></td>';
    const sum = rows.reduce((s, r) => s + Number(r[c.dataIndex] || 0), 0);
    return `<td><strong>${FORMATTERS[c.format || 'text'](sum)}</strong></td>`;
  }).join('');

  const html = `
    <h2 style="margin:0 0 4px;">${title}</h2>
    <div style="margin-bottom:14px;color:#555;">${periodLabel}</div>
    <table>
      <thead><tr>${cols.map(c => `<th>${c.title}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map(r => `<tr>${cols.map(c => `<td>${FORMATTERS[c.format || 'text'](r[c.dataIndex])}</td>`).join('')}</tr>`).join('')}
        <tr>${totalsCells}</tr>
      </tbody>
    </table>
  `;
  const printable = document.getElementById('campaigns-report-printable');
  printable.innerHTML = html;
  const prevTitle = document.title;
  document.title = `${periodLabel} - ${title}`;
  window.print();
  document.title = prevTitle;
}

export default function CampaignsReport() {
  const isMobile = useIsMobile();

  const defaultRange = [dayjs().startOf('month'), dayjs()];
  const [dateRange, setDateRange] = useState(defaultRange);
  const [category, setCategory] = useState('revenue');
  const [subView, setSubView]   = useState({ revenue: 'campaign', profit: 'campaign', expenditure: 'campaign' });

  const [summary, setSummary] = useState(null);
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  const dateFrom = dateRange[0].format('YYYY-MM-DD');
  const dateTo   = dateRange[1].format('YYYY-MM-DD');
  const periodLabel = `${dateRange[0].format('D MMM YYYY')} – ${dateRange[1].format('D MMM YYYY')}`;

  const viewKey = `${category}:${subView[category]}`;
  const view = VIEWS[viewKey];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { date_from: dateFrom, date_to: dateTo };
      const [summaryRes, viewRes] = await Promise.all([
        api.get('/reports/summary', { params }),
        api.get(view.path, { params }),
      ]);
      setSummary(summaryRes.data);
      setRows((viewRes.data.data || []).map((r, i) => ({ ...r, _rowKey: `${viewKey}-${i}` })));
    } finally { setLoading(false); }
  }, [dateFrom, dateTo, view.path, viewKey]);

  useEffect(() => { load(); }, [load]);

  const columns = useMemo(() => view.columns.map(c => ({
    title: c.title,
    dataIndex: c.dataIndex,
    key: c.dataIndex,
    align: c.format === 'text' || !c.format ? 'left' : 'right',
    render: (v, row) => {
      const text = FORMATTERS[c.format || 'text'](v);
      if (c.tag) return <Tag color={c.tagColor ? c.tagColor(row) : 'default'}>{text}</Tag>;
      if (c.signColor) return <span style={{ color: Number(v) >= 0 ? '#389e0d' : '#cf1322', fontWeight: 600 }}>{text}</span>;
      return text;
    },
  })), [view]);

  const kpiCards = summary && [
    { title: 'Revenue',     value: `KES ${Number(summary.total_revenue).toLocaleString()}`, icon: <DollarOutlined />, color: '#1677ff' },
    { title: 'Expenditure', value: `KES ${Number(summary.total_expenditure).toLocaleString()}`, icon: <WalletOutlined />, color: '#faad14' },
    { title: 'Profit',      value: `KES ${Number(summary.total_profit).toLocaleString()}`, icon: <RiseOutlined />, color: summary.total_profit >= 0 ? '#52c41a' : '#ff4d4f' },
    { title: 'Campaigns',   value: summary.total_campaigns, icon: <NotificationOutlined />, color: '#722ed1' },
  ];

  const categoryTabs = [
    { key: 'revenue',     label: 'Revenue' },
    { key: 'profit',      label: 'Profit' },
    { key: 'expenditure', label: 'Expenditure' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        gap: 12, marginBottom: 16,
      }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Campaigns Report</Typography.Title>
        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          gap: 8, flexWrap: 'wrap', width: isMobile ? '100%' : undefined,
        }}>
          <RangePicker
            value={dateRange}
            onChange={r => r && r[0] && r[1] && setDateRange(r)}
            disabledDate={d => d && d.isAfter(dayjs(), 'day')}
            allowClear={false}
            format="D MMM YYYY"
            style={isMobile ? { width: '100%' } : undefined}
          />
          <Button
            block={isMobile}
            icon={<PrinterOutlined />}
            disabled={loading || !rows.length}
            onClick={() => printReport({ title: `${categoryTabs.find(c => c.key === category).label} — ${view.label}`, periodLabel, view, rows })}
          >
            Print / PDF
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      {kpiCards && (
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          {kpiCards.map(k => (
            <Col xs={12} sm={8} lg={6} key={k.title}>
              <Card size="small" style={{ borderRadius: 10 }} styles={{ body: { padding: '12px 14px', textAlign: 'center' } }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: k.color, fontSize: 15 }}>{k.icon}</span>
                  <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{k.title}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: k.color }}>{k.value}</div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Category tabs */}
      <Tabs
        activeKey={category}
        onChange={setCategory}
        items={categoryTabs.map(c => ({ key: c.key, label: c.label }))}
        style={{ marginBottom: 4 }}
      />

      {/* Sub-view selector (Campaign / Advertiser / Stage / Date, etc.) */}
      {CATEGORY_SUBVIEWS[category].length > 1 && (
        <Segmented
          block
          value={subView[category]}
          onChange={v => setSubView(prev => ({ ...prev, [category]: v }))}
          options={CATEGORY_SUBVIEWS[category].map(k => ({ value: k, label: VIEWS[`${category}:${k}`].label }))}
          style={{ marginBottom: 14 }}
        />
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : rows.length === 0 ? (
        <Empty description="No data for this period" />
      ) : (
        <Table
          rowKey="_rowKey"
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content' }}
          summary={() => (
            <Table.Summary.Row>
              {view.columns.map((c, i) => (
                <Table.Summary.Cell index={i} align={i === 0 ? 'left' : 'right'} key={c.dataIndex}>
                  {i === 0 ? <strong>Total</strong> : c.total
                    ? <strong>{FORMATTERS[c.format](rows.reduce((s, r) => s + Number(r[c.dataIndex] || 0), 0))}</strong>
                    : null}
                </Table.Summary.Cell>
              ))}
            </Table.Summary.Row>
          )}
        />
      )}
    </div>
  );
}
