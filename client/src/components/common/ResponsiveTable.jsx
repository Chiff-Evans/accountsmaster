import { Table, Card, Space, Spin } from 'antd';
import { useIsMobile } from '../../hooks/useIsMobile';
import { FieldBox } from './CrudTable';

/**
 * Drop-in replacement for AntD Table that renders cards on mobile.
 * Columns with a non-empty `title` become label/value pairs (first one is the card header).
 * Columns with no title (or empty title) are treated as action columns and rendered
 * at the bottom-right of the card.
 */
export default function ResponsiveTable({
  columns = [],
  dataSource = [],
  rowKey = 'id',
  loading,
  locale,
  ...tableProps
}) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        locale={locale}
        {...tableProps}
      />
    );
  }

  // ── Mobile card view ──
  const dataCols   = columns.filter(c => c.title && String(c.title).trim() !== '');
  const actionCols = columns.filter(c => !c.title || String(c.title).trim() === '');

  const cellValue = (col, record) => {
    const raw = col.dataIndex ? record[col.dataIndex] : undefined;
    return col.render ? col.render(raw, record) : raw;
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <Spin />
    </div>
  );

  if (!dataSource.length) return (
    <div style={{ textAlign: 'center', color: '#aaa', padding: 32 }}>
      {locale?.emptyText || 'No data'}
    </div>
  );

  const [primaryCol, ...restCols] = dataCols;

  return (
    <div>
      {dataSource.map(record => {
        const primaryVal = primaryCol ? cellValue(primaryCol, record) : record[rowKey];
        const actions    = actionCols.map((col, i) => (
          <span key={col.key ?? i}>{cellValue(col, record)}</span>
        ));

        return (
          <Card
            key={record[rowKey]}
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
            {/* Header: primary value + action buttons, same bordered-box pair as the rest of the app */}
            <div style={{ display: 'flex', gap: 6, marginBottom: restCols.length ? 6 : 0 }}>
              <FieldBox
                align="left"
                value={<span style={{ fontWeight: 600, fontSize: 14 }}>{primaryVal}</span>}
                style={{ flex: 1, justifyContent: 'flex-start' }}
              />
              {actions.length > 0 && (
                <FieldBox
                  value={<Space size={4}>{actions}</Space>}
                  style={{ flexShrink: 0, justifyContent: 'center' }}
                />
              )}
            </div>

            {/* Body: remaining fields, one bordered row each */}
            {restCols.map((col, idx) => {
              const val = cellValue(col, record);
              if (val == null || val === '') return null;
              return (
                <FieldBox
                  key={col.key ?? col.dataIndex ?? idx}
                  label={col.title}
                  value={val}
                  style={{ marginBottom: 6 }}
                />
              );
            })}
          </Card>
        );
      })}
    </div>
  );
}
