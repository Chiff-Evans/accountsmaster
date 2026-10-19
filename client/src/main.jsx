import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntApp, notification } from 'antd';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

// Show a notification when a new version is available and auto-update
registerSW({
  onNeedRefresh() {
    notification.info({
      message: 'Update available',
      description: 'A new version of ' + CONFIG.appName + ' is ready. Refreshing…',
      placement: 'bottomRight',
      duration: 3,
      onClose: () => window.location.reload(),
    });
    setTimeout(() => window.location.reload(), 3500);
  },
  onOfflineReady() {
    notification.success({
      message: 'Ready to use as a separate app',
      description: CONFIG.appName + ' is now available for installation.',
      placement: 'bottomRight',
      duration: 4,
    });
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#22c55e',
        colorLink: '#4c8dff',
        colorInfo: '#22c55e',
        borderRadius: 10,
      },
    }}
  >
    <AntApp>
      <App />
    </AntApp>
  </ConfigProvider>
);
