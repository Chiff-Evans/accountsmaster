import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import CrudTable from '../../components/common/CrudTable';
import api from '../../api';

const fmtAmount = v => v != null ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
const sum = (rows, key) => Math.round(rows.reduce((s, r) => s + Math.round((r[key] || 0) * 100), 0)) / 100;

/* Per-member deposits / withdrawals and where each member stands against
   the active target (Configurations > Targets). Read-only. */
export default function MemberStatistics() {
  const [data, setData] = useState([]);
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/member-statistics');
      setData(r.data.data);
      setTarget(r.data.target);
    } catch { message.error('Failed to load statistics'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Search is applied here (not inside CrudTable) so the totals row always
  // adds up exactly the members currently shown.
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(r => [r.member_name, r.member_ref_no].some(v => v && v.toLowerCase().includes(q)));
  }, [data, search]);

  const totals = useMemo(() => ({
    id: 'totals',
    member_ref_no: null,
    member_name: 'TOTAL',
    deposits: sum(rows, 'deposits'),
    withdrawals: sum(rows, 'withdrawals'),
    balance: target ? sum(rows, 'balance') : null,
    overpayment: target ? sum(rows, 'overpayment') : null,
  }), [rows, target]);

  const columns = [
    { title: 'Ref No', dataIndex: 'member_ref_no', key: 'ref', width: 130,
      render: v => v ? <Tag color="blue">{v}</Tag> : null },
    { title: 'Member', dataIndex: 'member_name', key: 'name' },
    { title: 'Total Deposits', dataIndex: 'deposits', key: 'deposits', align: 'right', mobileAlign: 'right', render: fmtAmount },
    { title: 'Total Withdrawals', dataIndex: 'withdrawals', key: 'withdrawals', align: 'right', mobileAlign: 'right', render: fmtAmount },
    { title: 'Balance', dataIndex: 'balance', key: 'balance', align: 'right', mobileAlign: 'right',
      render: v => v > 0 ? <Typography.Text type="danger">{fmtAmount(v)}</Typography.Text> : fmtAmount(v) },
    { title: 'Overpayment', dataIndex: 'overpayment', key: 'overpayment', align: 'right', mobileAlign: 'right',
      render: v => v > 0 ? <Typography.Text type="success">{fmtAmount(v)}</Typography.Text> : fmtAmount(v) },
  ];

  const targetInfo = target
    ? <Tag color="blue">Target {fmtAmount(target.target_amount)} by {dayjs(target.target_date).format('D MMM YYYY')}</Tag>
    : null;

  return (
    <>
      {!loading && !target && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="No active target"
          description="Balance and Overpayment need an active target. Set one in Configurations → Targets."
        />
      )}
      <CrudTable
        title="Member Statistics"
        columns={columns}
        dataSource={rows}
        loading={loading}
        onSearch={setSearch}
        onRefresh={load}
        extra={targetInfo}
        hideAdd
        summaryRow={totals}
        searchPlaceholder="Search by member name or ref no..."
      />
    </>
  );
}
