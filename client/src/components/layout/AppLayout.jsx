import { useState, useEffect } from 'react';
import { Layout, theme, Spin } from 'antd';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import PermissionGuard from '../common/PermissionGuard';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Content } = Layout;

export default function AppLayout({ children }) {
  const { loadMenus, menus } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { token } = theme.useToken();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Initial load
  useEffect(() => { loadMenus(); }, []);

  // Re-fetch permissions on every navigation so revoked rights take effect immediately
  useEffect(() => { loadMenus(); }, [location.pathname]);

  if (!menus) return <Spin fullscreen />;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Layout style={{ marginInlineStart: isMobile ? 0 : (collapsed ? 80 : 220), transition: 'all 0.2s' }}>
        <AppHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          onMobileToggle={() => setMobileOpen(o => !o)}
        />
        <Content
          style={{
            marginTop: 80,
            marginRight: isMobile ? 8 : 16,
            marginBottom: isMobile ? 8 : 16,
            marginLeft: isMobile ? 8 : 16,
            padding: isMobile ? '8px' : '16px',
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <PermissionGuard>
            {children}
          </PermissionGuard>
        </Content>
      </Layout>
    </Layout>
  );
}
