import { useEffect, useState } from 'react';
import { Layout, Menu, Drawer, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import * as Icons from '@ant-design/icons';

const { Sider } = Layout;

function getIcon(name) {
  if (!name) return null;
  const Icon = Icons[name];
  return Icon ? <Icon /> : null;
}

function buildAntMenuItems(nodes) {
  return nodes
    .filter(n => n.is_visible && n.can_view)
    .map(n => {
      const hasChildren = n.children && n.children.length > 0;
      return {
        key: n.view_path || `menu-${n.id}`,
        icon: getIcon(n.icon),
        label: n.menu_name,
        children: hasChildren ? buildAntMenuItems(n.children) : undefined,
      };
    });
}

function SiderMenu({ collapsed, onClose }) {
  const { menus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  const items = buildAntMenuItems(menus);
  const rootKeys = items.map(i => i.key);

  const onOpenChange = keys => {
    const newlyOpened = keys.find(k => !openKeys.includes(k));
    if (newlyOpened && rootKeys.includes(newlyOpened)) {
      setOpenKeys([newlyOpened]);
    } else {
      setOpenKeys(keys);
    }
  };

  const handleSelect = ({ key }) => {
    if (key && key.startsWith('/')) {
      navigate(key);
      onClose?.();
    }
  };

  return (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[location.pathname]}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      onSelect={handleSelect}
      items={items}
      style={{ borderRight: 0 }}
      inlineCollapsed={collapsed}
    />
  );
}

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const isMobile = useIsMobile();

  const siderStyle = {
    overflow: 'hidden',
    height: '100vh',
    position: 'fixed',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
  };

  const brand = (
    <div style={{
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'flex-start',
      padding: collapsed ? 0 : '0 16px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      color: '#fff',
      fontWeight: 700,
      fontSize: collapsed ? 18 : 16,
      letterSpacing: 1,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    }}>
      {collapsed ? 'AM' : 'Accounts Master'}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onClose}
        width={240}
        closable={false}
        styles={{
          body:   { padding: 0, background: '#001529' },
          header: { background: '#001529', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0 12px' },
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>Accounts Master</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              style={{ color: '#fff', fontSize: 14 }}
            />
          </div>
        }
      >
        <SiderMenu collapsed={false} onClose={onClose} />
      </Drawer>
    );
  }

  return (
    <Sider
      width={220}
      collapsedWidth={80}
      collapsed={collapsed}
      style={siderStyle}
      theme="dark"
    >
      {brand}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin' }}>
        <SiderMenu collapsed={collapsed} />
      </div>
    </Sider>
  );
}
