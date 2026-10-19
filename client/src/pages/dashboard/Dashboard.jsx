import { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Tag, Typography, Spin, Select, DatePicker, Segmented } from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);
import {
  NotificationOutlined, SolutionOutlined, DollarOutlined, WalletOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useIsMobile } from '../../hooks/useIsMobile';
import api from '../../api';

const PIE_COLORS = ['#1677ff','#52c41a','#faad14','#ff4d4f','#722ed1','#13c2c2','#fa8c16','#eb2f96'];

/* ── period option builders ──────────────────────────────────────────────── */
function buildMonthOptions(incDate) {
  const start = dayjs(incDate).startOf('month');
  const now   = dayjs().startOf('month');
  const opts  = [];
  let cur = start;
  while (!cur.isAfter(now)) {
    opts.push({
      value: cur.format('YYYY-MM'),
      label: cur.format('MMMM YYYY'),
      from:  cur.startOf('month').format('YYYY-MM-DD'),
      to:    cur.endOf('month').format('YYYY-MM-DD'),
    });
    cur = cur.add(1, 'month');
  }
  return opts.reverse();
}

function buildWeekOptions(incDate) {
  const start = dayjs(incDate).startOf('isoWeek');
  const now   = dayjs().startOf('isoWeek');
  const opts  = [];
  let cur = start;
  while (!cur.isAfter(now)) {
    const end = cur.endOf('isoWeek');
    opts.push({
      value: cur.format('GGGG-[W]WW'),
      label: `${cur.format('D MMM')} – ${end.format('D MMM YYYY')}`,
      from:  cur.format('YYYY-MM-DD'),
      to:    end.format('YYYY-MM-DD'),
    });
    cur = cur.add(1, 'week');
  }
  return opts.reverse();
}

function buildYearOptions(incDate) {
  const startY = dayjs(incDate).year();
  const nowY   = dayjs().year();
  const opts   = [];
  for (let y = nowY; y >= startY; y--) {
    opts.push({
      value: String(y),
      label: String(y),
      from:  `${y}-01-01`,
      to:    `${y}-12-31`,
    });
  }
  return opts;
}

const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function StatCard({ title, value, icon, color = '#1677ff', formatter, isMobile, subtitle }) {
  const display = formatter ? formatter(value) : String(value ?? 0);
  const len = display.length;
  const fontSize = len <= 4 ? (isMobile ? 22 : 24) : len <= 6 ? (isMobile ? 18 : 20) : len <= 8 ? (isMobile ? 15 : 17) : len <= 10 ? (isMobile ? 13 : 14) : len <= 13 ? 12 : 10;
  const iconSize  = isMobile ? 30 : 42;
  const iconFont  = isMobile ? 15 : 20;
  const padding   = isMobile ? '8px 10px' : '12px 14px';
  const gap       = isMobile ? 8 : 12;
  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      background: '#fff',
      border: `1px solid ${color}28`,
      boxShadow: `0 2px 10px ${color}14`,
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div style={{ padding, display: 'flex', alignItems: 'center', gap }}>
        {icon && (
          <div style={{
            width: iconSize, height: iconSize, borderRadius: isMobile ? 8 : 10,
            background: `linear-gradient(135deg, ${color}22, ${color}10)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: iconFont, color, lineHeight: 1 }}>{icon}</span>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: isMobile ? 10 : 11, color: '#8c8c8c', lineHeight: 1.3, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          <div style={{ fontSize, fontWeight: 700, color: '#141414', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{display}</div>
          {subtitle && (
            <div style={{ fontSize: 10, color: '#ff4d4f', fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const isMobile = useIsMobile();

  const [filterType,      setFilterType]      = useState('month'); // month|week|day|year
  const [dateRange,       setDateRange]       = useState(null);    // {from,to,label}
  const [incDate,         setIncDate]         = useState(null);    // dayjs | null
  const [summary,         setSummary]         = useState(null);
  const [trend,           setTrend]           = useState([]);
  const [pipeline,        setPipeline]        = useState([]);
  const [topCampaigns,    setTopCampaigns]    = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [vis,             setVis]             = useState({});
  const [loading,         setLoading]         = useState(true);

  /* load business config for incorporation date */
  useEffect(() => {
    api.get('/business').then(r => {
      const biz = r.data?.[0];
      const inc = biz?.incorporation_date ? dayjs(biz.incorporation_date) : dayjs().subtract(1, 'year');
      setIncDate(inc);
      // default: current month
      setDateRange({
        from:  dayjs().startOf('month').format('YYYY-MM-DD'),
        to:    dayjs().endOf('month').format('YYYY-MM-DD'),
        label: dayjs().format('MMMM YYYY'),
      });
    });
  }, []);

  /* build option lists */
  const monthOpts = useMemo(() => incDate ? buildMonthOptions(incDate) : [], [incDate]);
  const weekOpts  = useMemo(() => incDate ? buildWeekOptions(incDate)  : [], [incDate]);
  const yearOpts  = useMemo(() => incDate ? buildYearOptions(incDate)  : [], [incDate]);

  /* when filterType changes, auto-select the most recent option */
  useEffect(() => {
    if (!incDate) return;
    if (filterType === 'month' && monthOpts.length) setDateRange(monthOpts[0]);
    if (filterType === 'week'  && weekOpts.length)  setDateRange(weekOpts[0]);
    if (filterType === 'year'  && yearOpts.length)  setDateRange(yearOpts[0]);
    if (filterType === 'day') {
      const today = dayjs().format('YYYY-MM-DD');
      setDateRange({ from: today, to: today, label: dayjs().format('D MMMM YYYY') });
    }
  }, [filterType, incDate]); // eslint-disable-line

  useEffect(() => {
    if (!dateRange) return;
    (async () => {
      setLoading(true);
      try {
        const { data: v } = await api.get('/dashboard-config/me');
        setVis(v);

        const p = `?date_from=${dateRange.from}&date_to=${dateRange.to}`;
        const calls = [api.get(`/dashboard/summary${p}`)];
        if (v.chart_trend)            calls.push(api.get(`/dashboard/trend${p}`));
        if (v.chart_pipeline)         calls.push(api.get(`/dashboard/pipeline${p}`));
        if (v.chart_top_campaigns)    calls.push(api.get(`/dashboard/top-campaigns${p}`));
        if (v.chart_recent_campaigns) calls.push(api.get(`/dashboard/recent-campaigns${p}`));

        const results = await Promise.all(calls);
        let i = 0;
        setSummary(results[i++].data);
        if (v.chart_trend)            setTrend(results[i++].data);
        if (v.chart_pipeline)         setPipeline(results[i++].data);
        if (v.chart_top_campaigns)    setTopCampaigns(results[i++].data);
        if (v.chart_recent_campaigns) setRecentCampaigns(results[i++].data);
      } finally {
        setLoading(false);
      }
    })();
  }, [dateRange]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;

  const campaignCols = [
    { title: 'Campaign', dataIndex: 'campaign_title', key: 'campaign' },
    { title: 'Member', dataIndex: 'member_name', key: 'member' },
    { title: 'Budget', dataIndex: 'budget', key: 'budget', align: 'right',
      render: v => v != null ? Number(v).toLocaleString() : '—' },
    { title: 'Stage', key: 'stage',
      render: (_, r) => r.stage_name ? <Tag color={r.stage_color || 'default'}>{r.stage_name}</Tag> : '—' },
    { title: 'Date', dataIndex: 'created_on', key: 'dt',
      render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
  ];

  return (
    <div>
      {/* Title + period selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>Dashboard</Typography.Title>
          {dateRange && (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {dateRange.label}
            </Typography.Text>
          )}
        </div>

        {/* Filter type tabs + dynamic selector on same row (stacked, full-width on mobile) */}
        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'center', alignItems: isMobile ? 'stretch' : 'center',
          gap: 10, flexWrap: 'wrap',
        }}>
          <Segmented
            block={isMobile}
            value={filterType}
            onChange={setFilterType}
            options={[
              { value: 'month', label: 'Month' },
              { value: 'week',  label: 'Week' },
              { value: 'day',   label: 'Day' },
              { value: 'year',  label: 'Year' },
            ]}
          />
          {filterType === 'month' && (
            <Select
              value={dateRange?.from?.slice(0, 7)}
              onChange={v => setDateRange(monthOpts.find(o => o.from.slice(0, 7) === v))}
              options={monthOpts}
              style={{ width: isMobile ? '100%' : 200 }}
              size="small"
            />
          )}
          {filterType === 'week' && (
            <Select
              value={dateRange?.from}
              onChange={v => setDateRange(weekOpts.find(o => o.from === v))}
              options={weekOpts.map(o => ({ value: o.from, label: o.label }))}
              style={{ width: isMobile ? '100%' : 240 }}
              size="small"
            />
          )}
          {filterType === 'day' && (
            <DatePicker
              value={dateRange?.from ? dayjs(dateRange.from) : null}
              onChange={d => {
                if (!d) return;
                const fmt = d.format('YYYY-MM-DD');
                setDateRange({ from: fmt, to: fmt, label: d.format('D MMMM YYYY') });
              }}
              disabledDate={d => {
                if (!d) return false;
                if (d.isAfter(dayjs(), 'day')) return true;
                return incDate ? d.isBefore(incDate, 'day') : false;
              }}
              format="D MMM YYYY"
              size="small"
              allowClear={false}
              style={{ width: isMobile ? '100%' : undefined }}
            />
          )}
          {filterType === 'year' && (
            <Select
              value={dateRange?.from?.slice(0, 4)}
              onChange={v => setDateRange(yearOpts.find(o => o.value === v))}
              options={yearOpts}
              style={{ width: isMobile ? '100%' : 120 }}
              size="small"
            />
          )}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <Row gutter={[12, 12]} justify="center">
        {vis.stat_campaigns && (
          <Col xs={12} sm={8} xl={4}>
            <StatCard title="Campaigns" value={summary?.total_campaigns}
              icon={<NotificationOutlined />} color="#1677ff" isMobile={isMobile} />
          </Col>
        )}
        {vis.stat_revenue && (
          <Col xs={12} sm={8} xl={4}>
            <StatCard title="Revenue (KES)" value={summary?.total_revenue}
              icon={<DollarOutlined />} color="#52c41a" isMobile={isMobile}
              formatter={v => Number(v ?? 0).toLocaleString()} />
          </Col>
        )}
        {vis.stat_expenditure && (
          <Col xs={12} sm={8} xl={4}>
            <StatCard title="Expenditure (KES)" value={summary?.total_expenditure}
              icon={<WalletOutlined />} color="#fa8c16" isMobile={isMobile}
              formatter={v => Number(v ?? 0).toLocaleString()} />
          </Col>
        )}
        {vis.stat_members && (
          <Col xs={12} sm={8} xl={4}>
            <StatCard title="Active Members" value={summary?.total_members}
              icon={<TeamOutlined />} color="#722ed1" isMobile={isMobile} />
          </Col>
        )}
        {vis.stat_brand_ambassadors && (
          <Col xs={12} sm={8} xl={4}>
            <StatCard title="Active Brand Ambassadors" value={summary?.total_brand_ambassadors}
              icon={<SolutionOutlined />} color="#eb2f96" isMobile={isMobile} />
          </Col>
        )}
      </Row>

      {/* ── Revenue vs Expenditure trend + Campaigns pipeline ── */}
      {(vis.chart_trend || vis.chart_pipeline) && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {vis.chart_trend && (
            <Col xs={24} xl={vis.chart_pipeline ? 16 : 24}>
              <Card title={`Revenue vs Expenditure — ${dateRange?.label ?? ''}`} size="small">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={v => Number(v).toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue"     stroke="#52c41a" name="Revenue"     dot={false} />
                    <Line type="monotone" dataKey="expenditure" stroke="#ff4d4f" name="Expenditure" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
          {vis.chart_pipeline && (
            <Col xs={24} xl={vis.chart_trend ? 8 : 24}>
              <Card title="Campaigns Pipeline" size="small">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pipeline} dataKey="count" nameKey="status_name"
                      cx="50%" cy="42%" outerRadius={85} labelLine={false} label={<PieLabel />}>
                      {pipeline.map((entry, i) => (
                        <Cell key={i} fill={entry.color || PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, name) => [v, name]} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* ── Bottom row ── */}
      {(vis.chart_top_campaigns || vis.chart_recent_campaigns) && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {vis.chart_top_campaigns && (
            <Col xs={24} xl={vis.chart_recent_campaigns ? 12 : 24}>
              <Card title="Top 10 Campaigns by Revenue" size="small">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topCampaigns} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 'dataMax']} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="campaign_title" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => [Number(v).toLocaleString(), 'Revenue (KES)']} />
                    <Bar dataKey="total_revenue" fill="#52c41a" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
          {vis.chart_recent_campaigns && (
            <Col xs={24} xl={vis.chart_top_campaigns ? 12 : 24}>
              <Card title="Recent Campaigns" size="small">
                <ResponsiveTable rowKey="id" columns={campaignCols} dataSource={recentCampaigns}
                  pagination={false} size="small" scroll={{ x: true }} />
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
}
