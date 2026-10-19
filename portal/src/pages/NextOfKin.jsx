import { useEffect, useState } from 'react';
import { Typography, Card, Tag, Spin, Empty, Alert } from 'antd';
import { PhoneOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import api from '../api';

/* The member's next of kin as recorded by staff — read-only here. */
export default function NextOfKin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get('/next-of-kin')
      .then(r => setRows(r.data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <div className="page-content">
      <Typography.Title level={5} style={{ margin: '0 0 4px' }}>My Next of Kin</Typography.Title>
      <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 14 }}>
        To add or change next of kin, please contact the office.
      </Typography.Text>

      {failed && <Alert type="error" showIcon message="Couldn't load next of kin." />}
      {!failed && rows.length === 0 && <Empty description="No next of kin recorded" style={{ margin: '30px 0' }} />}

      {rows.map(k => (
        <Card key={k.id} size="small" style={styles.card} styles={{ body: { padding: '12px 14px' } }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{k.kin_name}</div>
            {k.relationship_name && <Tag color="blue" style={{ margin: 0 }}>{k.relationship_name}</Tag>}
          </div>
          <div style={styles.lines}>
            {k.id_number && <div><IdcardOutlined style={styles.icon} />{k.id_number}</div>}
            {k.phone && <div><PhoneOutlined style={styles.icon} /><a href={`tel:${k.phone}`}>{k.phone}</a></div>}
            {k.email && <div><MailOutlined style={styles.icon} /><a href={`mailto:${k.email}`}>{k.email}</a></div>}
          </div>
        </Card>
      ))}
    </div>
  );
}

const styles = {
  card: { borderRadius: 10, marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  lines: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: '#595959' },
  icon: { color: '#8c8c8c', marginRight: 8 },
};
