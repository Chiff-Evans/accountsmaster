import dayjs from 'dayjs';

export const money = v => `KES ${Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtDate = v => v ? dayjs(v).format('D MMM YYYY') : '—';

// Deposits read as money in, withdrawals as money out; anything else is neutral.
export const typeTone = name => {
  const n = (name || '').toLowerCase();
  if (n.startsWith('deposit'))  return { color: '#16a34a', sign: '+', tag: 'green' };
  if (n.startsWith('withdraw')) return { color: '#ea580c', sign: '−', tag: 'orange' };
  return { color: '#141414', sign: '', tag: 'default' };
};
