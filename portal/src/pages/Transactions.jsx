import { useEffect, useState, useCallback } from 'react';
import { Typography, Segmented, Spin, Empty, Button, Alert } from 'antd';
import TransactionCard from '../components/TransactionCard';
import api from '../api';

const PAGE_SIZE = 20;

/* The member's own transaction history, newest first, filterable by type. */
export default function Transactions() {
  const [types, setTypes] = useState([]); // parameter text_id 'transaction-types'
  const [typeId, setTypeId] = useState('all');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get('/parameters/values', { params: { text_id: 'transaction-types' } }).then(r => setTypes(r.data)).catch(() => {});
  }, []);

  const load = useCallback(async (nextPage, replace) => {
    setLoading(true); setFailed(false);
    try {
      const { data } = await api.get('/transactions', {
        params: { page: nextPage, limit: PAGE_SIZE, transaction_type_id: typeId === 'all' ? undefined : typeId },
      });
      setRows(prev => replace ? data.data : [...prev, ...data.data]);
      setTotal(data.total);
      setPage(nextPage);
    } catch { setFailed(true); }
    finally { setLoading(false); }
  }, [typeId]);

  useEffect(() => { load(1, true); }, [load]);

  return (
    <div className="page-content">
      <Typography.Title level={5} style={{ margin: '0 0 12px' }}>My Transactions</Typography.Title>

      {types.length > 0 && (
        <Segmented
          block
          value={typeId}
          onChange={setTypeId}
          options={[{ value: 'all', label: 'All' }, ...types.map(t => ({ value: t.id, label: t.paramater_value }))]}
          style={{ marginBottom: 14 }}
        />
      )}

      {failed && <Alert type="error" showIcon message="Couldn't load transactions." style={{ marginBottom: 12 }} />}

      {!loading && !failed && rows.length === 0 && <Empty description="No transactions yet" style={{ margin: '30px 0' }} />}

      {rows.map(t => <TransactionCard key={t.id} tx={t} />)}

      {loading && <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>}

      {!loading && rows.length < total && (
        <Button block onClick={() => load(page + 1, false)} style={{ borderRadius: 8, marginTop: 4 }}>
          Load more ({total - rows.length} remaining)
        </Button>
      )}
    </div>
  );
}
