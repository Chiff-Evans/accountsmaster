import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOutlined, SettingOutlined, CheckOutlined } from '@ant-design/icons';
import { Popover, Badge, Empty, Switch, Spin, Button, Modal, List, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useIsMobile } from '../../hooks/useIsMobile';

dayjs.extend(relativeTime);

export default function NotificationBell({ api }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState([]);
  const [prefsLoading, setPrefsLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications', { params: { limit: 15 } });
      setItems(data.rows || []);
      setUnread(data.unread || 0);
    } catch { /* ignore */ }
  }, [api]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const handleClickItem = async item => {
    if (!item.is_read) {
      try { await api.post(`/notifications/${item.id}/read`); } catch { /* ignore */ }
      setItems(prev => prev.map(n => (n.id === item.id ? { ...n, is_read: 1 } : n)));
      setUnread(u => Math.max(0, u - 1));
    }
    setOpen(false);
    if (item.url) navigate(item.url);
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setItems(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnread(0);
    } catch { /* ignore */ }
  };

  const openPrefs = async () => {
    setPrefsOpen(true);
    setPrefsLoading(true);
    try {
      const { data } = await api.get('/notification-preferences');
      setPrefs(data || []);
    } catch { /* ignore */ } finally { setPrefsLoading(false); }
  };

  const togglePref = async (type, updates) => {
    setPrefs(prev => prev.map(p => (p.key === type ? { ...p, ...updates } : p)));
    try { await api.put('/notification-preferences', { type, ...updates }); } catch { /* ignore */ }
  };

  const content = (
    <div style={{ width: isMobile ? '100%' : 320, maxHeight: isMobile ? '100%' : 420, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>
        <Typography.Text strong>Notifications</Typography.Text>
        <div style={{ display: 'flex', gap: 4 }}>
          <Button type="text" size="small" icon={<CheckOutlined />} onClick={markAllRead} disabled={!unread}>
            Mark all read
          </Button>
          <Button type="text" size="small" icon={<SettingOutlined />} onClick={openPrefs} style={{ marginLeft: 8 }} />
        </div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 8px 8px' }}>
        {items.length === 0 ? (
          <Empty description="No notifications" style={{ padding: '24px 0' }} />
        ) : (
          <List
            size="small"
            dataSource={items}
            renderItem={item => (
              <List.Item
                onClick={() => handleClickItem(item)}
                style={{
                  cursor: 'pointer', padding: '8px 8px', borderRadius: 6,
                  background: item.is_read ? 'transparent' : '#e6f7ff',
                }}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <Typography.Text strong={!item.is_read} style={{ fontSize: 13 }}>{item.title}</Typography.Text>
                    {!item.is_read && (
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1677ff', flexShrink: 0, marginTop: 5 }} />
                    )}
                  </div>
                  {item.body && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{item.body}</div>}
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{dayjs(item.created_on).fromNow()}</div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  const bell = (
    <Badge count={unread} size="small" offset={[-2, 2]}>
      <BellOutlined style={{ fontSize: 20, color: '#fff', cursor: 'pointer' }} />
    </Badge>
  );

  return (
    <>
      {isMobile ? (
        <>
          <span onClick={() => setOpen(o => !o)}>{bell}</span>
          {open && (
            <>
              <div
                onClick={() => setOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.15)' }}
              />
              <div
                style={{
                  position: 'fixed', top: 66, left: 8, right: 8, zIndex: 1000,
                  background: '#fff', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
                  maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}
              >
                {content}
              </div>
            </>
          )}
        </>
      ) : (
        <Popover content={content} open={open} onOpenChange={setOpen} trigger="click" placement="bottomRight">
          {bell}
        </Popover>
      )}

      <Modal title="Notification Preferences" open={prefsOpen} onCancel={() => setPrefsOpen(false)} footer={null} width={420}>
        <Spin spinning={prefsLoading}>
          <List
            dataSource={prefs}
            renderItem={p => (
              <List.Item
                actions={[
                  <div key="enabled" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>In-app</div>
                    <Switch size="small" checked={p.enabled} onChange={v => togglePref(p.key, { enabled: v })} />
                  </div>,
                  <div key="push" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>Push</div>
                    <Switch size="small" checked={p.push_enabled} disabled={!p.enabled} onChange={v => togglePref(p.key, { push_enabled: v })} />
                  </div>,
                ]}
              >
                <List.Item.Meta title={p.label} description={p.description} />
              </List.Item>
            )}
          />
        </Spin>
      </Modal>
    </>
  );
}
