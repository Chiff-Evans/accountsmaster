import { useState, useMemo, useEffect } from 'react';
import { Table, Button, Space, Input, Tooltip, Modal, Pagination, Card, List, Tag, Spin, Select } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, ReloadOutlined, DownOutlined, UpOutlined,
} from '@ant-design/icons';
import { Typography } from 'antd';
import { usePagePermissions } from '../../hooks/usePagePermissions';
import { useIsMobile } from '../../hooks/useIsMobile';

const LAYOUT_H   = 128;
const SCROLL_DEDUCT = LAYOUT_H + 44 + 40 + 56;
const ROW_H      = 38;

function filterTree(nodes, predicate) {
  if (!nodes) return [];
  return nodes.reduce((acc, node) => {
    const filteredChildren = node.children ? filterTree(node.children, predicate) : undefined;
    if (predicate(node) || filteredChildren?.length > 0)
      acc.push({ ...node, children: filteredChildren?.length > 0 ? filteredChildren : undefined });
    return acc;
  }, []);
}

/* Bordered box for a single label : value field — the unit the whole mobile
   card is built from (also reused for the Ref/Actions header boxes).
   Exported so other mobile card views (e.g. ResponsiveTable) can match this
   grid's look exactly instead of drifting into their own styling. */
export function FieldBox({ label, value, align = 'right', style }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
      border: '1px solid #e8e8e8', borderRadius: 8, padding: '5px 10px',
      background: '#fff',
      ...style,
    }}>
      {label != null && <span style={{ fontSize: 12, color: '#888', fontWeight: 500, whiteSpace: 'nowrap' }}>{label} :</span>}
      <span style={{ fontSize: 13, textAlign: align, flex: 1, minWidth: 0 }}>{value}</span>
    </div>
  );
}

/* ── Mobile card for one record ── */
function RecordCard({ record, columns, rowKey, showEdit, showDelete, onEdit, onConfirmDelete, extraActions }) {
  const [expanded, setExpanded] = useState(false);

  const dataCols  = columns.filter(c => c.title && c.key !== 'actions' && !c.hiddenOnMobile);
  const extraCols = columns.filter(c => (!c.title || String(c.title).trim() === '') && c.key !== 'actions');

  // Split into always-visible, label-row, and expandable — all three render
  // as the same stacked bordered field boxes, just in different sections.
  const visibleCols  = dataCols.filter(c => !c.mobileExpanded && !c.mobileLabelRow);
  const labelRowCols = dataCols.filter(c =>  c.mobileLabelRow);
  const expandedCols = dataCols.filter(c =>  c.mobileExpanded);

  // mobilePrimary col becomes the header; fallback to first visible
  const primaryCol  = visibleCols.find(c => c.mobilePrimary) ?? visibleCols[0];
  const rest        = visibleCols.filter(c => c !== primaryCol);

  const cellValue = col => {
    const raw = col.dataIndex ? record[col.dataIndex] : undefined;
    return col.render ? col.render(raw, record) : raw;
  };

  const hasActions = showEdit || showDelete || extraActions || extraCols.length > 0;

  const fieldRow = (col, idx) => {
    const val = cellValue(col);
    if (val == null || val === '') return null;
    return <FieldBox key={col.key ?? col.dataIndex ?? idx} label={col.title} value={val} style={{ marginBottom: 6 }} />;
  };

  return (
    <Card
      size="small"
      variant="outlined"
      style={{
        borderRadius: 10,
        background: '#f4f6f9',
        border: '1px solid #dfe3ea',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        marginBottom: 10,
      }}
      styles={{ body: { padding: '10px 12px' } }}
    >
      {/* Header: Ref/primary box + Actions box, side by side */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <FieldBox
          align="left"
          value={<span style={{ fontWeight: 600, fontSize: primaryCol?.mobileHeaderSize ?? 14 }}>
            {primaryCol ? cellValue(primaryCol) : record[rowKey]}
          </span>}
          style={{ flex: 1, justifyContent: 'flex-start' }}
        />
        {hasActions && (
          <FieldBox
            value={
              <Space size={4}>
                {extraActions?.(record)}
                {extraCols.map((col, i) => {
                  const rendered = col.render ? col.render(col.dataIndex ? record[col.dataIndex] : undefined, record) : null;
                  return rendered ? <span key={col.key ?? i}>{rendered}</span> : null;
                })}
                {showEdit && (
                  <Button type="default" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
                )}
                {showDelete && (
                  <Button danger size="small" icon={<DeleteOutlined />} onClick={() => onConfirmDelete(record)} />
                )}
              </Space>
            }
            style={{ flexShrink: 0, justifyContent: 'center' }}
          />
        )}
      </div>

      {/* Always-visible fields — one bordered row each */}
      {rest.map(fieldRow)}

      {/* Label-row fields — same styling, distinct source (kept for callers
          that explicitly want a field forced full-width) */}
      {labelRowCols.map(fieldRow)}

      {/* Expandable section */}
      {expandedCols.length > 0 && (
        <>
          <div
            onClick={() => setExpanded(p => !p)}
            style={{
              border: '1px solid #e8e8e8', borderRadius: 8, padding: '5px 10px',
              background: '#fff',
              textAlign: 'center', cursor: 'pointer', color: '#1677ff', fontSize: 12,
              marginBottom: expanded ? 6 : 0,
            }}
          >
            {expanded ? <><UpOutlined style={{ fontSize: 10 }} /> Less</> : <><DownOutlined style={{ fontSize: 10 }} /> More Details</>}
          </div>
          {expanded && expandedCols.map(fieldRow)}
        </>
      )}
    </Card>
  );
}

export default function CrudTable({
  title,
  columns,
  dataSource,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
  onRefresh,
  pagination,
  extra,
  extraRow = false,
  rowKey = 'id',
  searchPlaceholder = 'Search...',
  hideAdd = false,
  height: customHeight,
  hidePagination = false,
  extraActions,
  heightOffset = 0,
  summaryRow,
}) {
  const perms   = usePagePermissions();
  const isMobile = useIsMobile();

  const [searchText, setSearchText] = useState('');
  const [iPage,      setIPage]      = useState(1);
  const [iSize,      setISize]      = useState(100);
  const [winH,       setWinH]       = useState(window.innerHeight);
  const [expandedKeys, setExpandedKeys] = useState([]);

  useEffect(() => {
    const onResize = () => setWinH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const allParentKeys = useMemo(() => {
    const collect = nodes => nodes?.flatMap(n =>
      n.children?.length > 0 ? [n[rowKey], ...collect(n.children)] : []
    ) ?? [];
    return collect(dataSource);
  }, [dataSource, rowKey]);

  const isTreeData = allParentKeys.length > 0;
  const effectiveExpandedKeys = searchText ? allParentKeys : expandedKeys;

  const filteredData = useMemo(() => {
    if (onSearch || !searchText) return dataSource;
    const lower = searchText.toLowerCase();
    const matchNode = row => Object.entries(row).some(([k, v]) =>
      k !== 'children' && v != null && String(v).toLowerCase().includes(lower)
    );
    return isTreeData ? filterTree(dataSource ?? [], matchNode) : (dataSource?.filter(matchNode) ?? []);
  }, [dataSource, searchText, onSearch, isTreeData]);

  const displayData = useMemo(() => {
    if (hidePagination) return filteredData ?? [];
    if (pagination)     return filteredData;
    if (!filteredData)  return [];
    const start = (iPage - 1) * iSize;
    return filteredData.slice(start, start + iSize);
  }, [filteredData, pagination, hidePagination, iPage, iSize]);

  // Rows actually on screen right now — a collapsed node's children don't
  // count, but an expanded one's do (recursively, for grandchildren etc.),
  // so the scroll-height calc below reacts to expand/collapse instead of
  // only ever seeing the top-level row count.
  const visibleRowCount = useMemo(() => {
    if (!isTreeData) return displayData?.length ?? 0;
    const expandedSet = new Set(effectiveExpandedKeys);
    const count = nodes => nodes.reduce((sum, n) => {
      const children = n.children?.length && expandedSet.has(n[rowKey]) ? count(n.children) : 0;
      return sum + 1 + children;
    }, 0);
    return count(displayData ?? []);
  }, [displayData, isTreeData, effectiveExpandedKeys, rowKey]);

  const handleSearch = text => {
    setSearchText(text);
    if (!pagination && !hidePagination) setIPage(1);
    if (onSearch) onSearch(text);
  };

  const confirmDelete = record => {
    Modal.confirm({
      title: 'Delete this record?',
      content: 'This action is permanent and cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: () => onDelete(record),
    });
  };

  const showEdit   = onEdit   && perms.canEdit;
  const showDelete = onDelete && perms.canDelete;

  const actionCol = (showEdit || showDelete || extraActions) ? [{
    title: 'Actions', key: 'actions', fixed: 'right', align: 'right', width: extraActions ? 120 : 90,
    render: (_, record) => (
      <Space size={0}>
        {extraActions?.(record)}
        {showEdit   && <Tooltip title="Edit">  <Button type="link" size="small" icon={<EditOutlined />}   onClick={() => onEdit(record)} /></Tooltip>}
        {showDelete && <Tooltip title="Delete"><Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(record)} /></Tooltip>}
      </Space>
    ),
  }] : [];

  const PAGE_SIZE_OPTIONS = ['100', '200', '500'];

  const pageProps = pagination
    ? { ...pagination, showSizeChanger: true, pageSizeOptions: PAGE_SIZE_OPTIONS, showTotal: pagination.showTotal ?? (t => `${t} records`) }
    : { current: iPage, pageSize: iSize, total: filteredData?.length ?? 0, showSizeChanger: true, pageSizeOptions: PAGE_SIZE_OPTIONS, showTotal: t => `${t} records`, onChange: (p, ps) => { setIPage(p); setISize(ps); } };

  const currentPageSize = pagination ? (pagination.pageSize ?? 100) : iSize;
  const onMobileSizeChange = v => {
    if (pagination?.onChange) pagination.onChange(1, v);
    else { setISize(v); setIPage(1); }
  };

  // An explicit height without pagination (e.g. a grid inside a pop-up)
  // stays exactly that tall — rows scroll inside it instead of growing it.
  const fixedHeight = hidePagination && !!customHeight;
  const TOOLBAR_H = 44;
  const TABLE_HEADER_H = 39;

  const containerHeight = fixedHeight
    ? `${customHeight}px`
    : hidePagination
      ? 'auto'
      : customHeight
        ? `${customHeight}px`
        : `calc(${isMobile ? '100dvh' : '100vh'} - ${LAYOUT_H + heightOffset}px)`;

  const scrollY = (() => {
    if (fixedHeight) return customHeight - TOOLBAR_H - TABLE_HEADER_H;
    if (hidePagination) return undefined;
    const bodyH = customHeight ? customHeight - 140 : winH - SCROLL_DEDUCT - heightOffset;
    // Don't fix the height when content fits — avoids unnecessary scrollbar track
    const contentH = visibleRowCount * ROW_H + TABLE_HEADER_H;
    if (contentH < bodyH) return undefined;
    return customHeight ? bodyH : `calc(100vh - ${SCROLL_DEDUCT + heightOffset}px)`;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: containerHeight, overflow: hidePagination && !fixedHeight ? 'visible' : 'hidden' }}>

      {/* Toolbar */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, flexShrink: 0 }}>
          {/* Centered title */}
          <Typography.Title level={4} style={{ margin: 0, textAlign: 'center' }}>{title}</Typography.Title>

          {(extra && extraRow) ? (
            <>
              {/* Row 1: wide extra (e.g. filter select) + refresh + add */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>{extra}</div>
                {onRefresh && <Button icon={<ReloadOutlined />} onClick={onRefresh} />}
                {!hideAdd && onAdd && perms.canCreate && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} />
                )}
              </div>
              {/* Row 2: search full width */}
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => handleSearch(e.target.value)}
                allowClear
              />
            </>
          ) : (
            /* Single row: extra (icon) + search + refresh + add */
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {extra}
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => handleSearch(e.target.value)}
                allowClear
                style={{ flex: 1 }}
              />
              {onRefresh && <Button icon={<ReloadOutlined />} onClick={onRefresh} />}
              {!hideAdd && onAdd && perms.canCreate && (
                <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} />
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{title}</Typography.Title>
          <Space wrap>
            {extra}
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              allowClear
              style={{ width: 220 }}
            />
            {onRefresh && <Button icon={<ReloadOutlined />} onClick={onRefresh} />}
            {!hideAdd && onAdd && perms.canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Add New</Button>
            )}
          </Space>
        </div>
      )}

      {/* Body — card list on mobile, table on desktop */}
      {isMobile ? (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 4 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : !displayData?.length ? (
            <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>No records found</div>
          ) : (
            displayData.map(record => (
              <RecordCard
                key={record[rowKey]}
                record={record}
                columns={columns}
                rowKey={rowKey}
                showEdit={showEdit}
                showDelete={showDelete}
                onEdit={onEdit}
                onConfirmDelete={confirmDelete}
                extraActions={extraActions}
              />
            ))
          )}
          {/* Totals card — same column renderers as the rows above */}
          {summaryRow && !loading && displayData?.length > 0 && (
            <RecordCard
              record={summaryRow}
              columns={columns}
              rowKey={rowKey}
              showEdit={false}
              showDelete={false}
            />
          )}
        </div>
      ) : (
        <div style={hidePagination && !fixedHeight ? {} : { flex: 1, minHeight: 0 }}>
          <Table
            rowKey={rowKey}
            columns={[...columns, ...actionCol]}
            dataSource={displayData}
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content', y: scrollY }}
            size="small"
            summary={summaryRow ? () => {
              // Optional totals row, sticky at the bottom; each cell reuses
              // its column's render so totals format like the rows above.
              const allCols = [...columns, ...actionCol];
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ background: '#fafafa' }}>
                    {allCols.map((col, i) => {
                      const val = col.dataIndex ? summaryRow[col.dataIndex] : undefined;
                      const content = col.render ? col.render(val, summaryRow, -1) : val;
                      return (
                        <Table.Summary.Cell key={col.key ?? i} index={i} align={col.align}>
                          <strong>{content}</strong>
                        </Table.Summary.Cell>
                      );
                    })}
                  </Table.Summary.Row>
                </Table.Summary>
              );
            } : undefined}
            expandable={isTreeData ? {
              expandedRowKeys: effectiveExpandedKeys,
              onExpandedRowsChange: keys => { if (!searchText) setExpandedKeys(keys); },
            } : undefined}
          />
        </div>
      )}

      {/* Pagination */}
      {!hidePagination && (
        isMobile ? (
          <div style={{ flexShrink: 0, padding: '8px 10px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
            {/* Row 1: navigation centered */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <Pagination size="small" {...pageProps} showSizeChanger={false} showTotal={undefined} />
            </div>
            {/* Row 2: page size selector full width with record count embedded */}
            <Select
              size="small"
              value={currentPageSize}
              onChange={onMobileSizeChange}
              options={[
                { value: 100, label: '100 / page' },
                { value: 200, label: '200 / page' },
                { value: 500, label: '500 / page' },
              ]}
              labelRender={({ label }) => (
                <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>{label}</span>
                  <span style={{ color: '#888', fontSize: 12 }}>
                    {pageProps.total?.toLocaleString()} records
                  </span>
                </span>
              )}
              popupMatchSelectWidth={false}
              style={{ width: '100%' }}
            />
          </div>
        ) : (
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '10px 8px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
            <Pagination size="small" {...pageProps} />
          </div>
        )
      )}
    </div>
  );
}
