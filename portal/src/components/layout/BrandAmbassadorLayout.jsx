import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SoundOutlined, UserOutlined } from '@ant-design/icons';
import { useBrandAmbassadorAuth } from '../../contexts/BrandAmbassadorAuthContext';
import brandAmbassadorApi from '../../brandAmbassadorApi';
import NotificationBell from '../common/NotificationBell';

const NAV = [
  { path: '/brand-ambassador/campaigns', icon: SoundOutlined, label: 'Campaigns' },
  { path: '/brand-ambassador/profile',   icon: UserOutlined,  label: 'Profile' },
];

export default function BrandAmbassadorLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { brandAmbassador } = useBrandAmbassadorAuth();
  const firstName = (brandAmbassador?.full_name || '').trim().split(' ')[0] || '';
  const initials = (brandAmbassador?.full_name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const [businessName, setBusinessName] = useState('Accounts Master');

  useEffect(() => {
    brandAmbassadorApi.get('/business-info')
      .then(({ data }) => { if (data?.business_name) setBusinessName(data.business_name); })
      .catch(() => {});
  }, []);

  return (
    <div className="portal-frame">
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(135deg, #14418f 0%, #0f7a6e 55%, #22c55e 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      }}>
        <div style={{ padding: '0 16px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: 0.5, lineHeight: 1.2 }}>{businessName}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 0.3 }}>Brand Ambassador Portal</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <NotificationBell api={brandAmbassadorApi} />
          <button
            onClick={() => navigate('/brand-ambassador/profile')}
            style={{
              border: 'none', cursor: 'pointer', padding: 0, background: 'none',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
                {firstName}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10 }}>
                {brandAmbassador?.brand_ambassador_ref_no}
              </div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: pathname === '/brand-ambassador/profile' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)',
              border: pathname === '/brand-ambassador/profile' ? '2.5px solid rgba(255,255,255,0.95)' : '2.5px solid rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14, fontWeight: 800, flexShrink: 0,
              transition: 'all 0.15s',
            }}>
              {initials || '?'}
            </div>
          </button>
          </div>
        </div>
      </div>
      <div>{children}</div>

      {/* Bottom tab bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: '#fff', borderTop: '1px solid #f0f0f0',
        display: 'flex', boxShadow: '0 -2px 10px rgba(0,0,0,0.06)', height: 60,
      }}>
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || pathname.startsWith(path + '/');
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                flex: 1, border: 'none', background: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 2, padding: '4px 0',
                color: active ? '#22c55e' : '#8c8c8c', transition: 'color 0.15s',
              }}
            >
              <Icon style={{ fontSize: 20 }} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
