import { useState } from 'react';
import { App, Button, Modal, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { CONFIG } from '../../config';

/* "Install" — rendered only for people who haven't installed the portal as
   an app (see usePwaInstall); renders nothing otherwise.
   `variant="header"` is the compact, icon-only white-on-gradient look for
   the top bar; the default shows the "Install" label (login page). */
export default function InstallButton({ variant = 'default', block = false }) {
  const { canInstall, mode, install } = usePwaInstall();
  const { message } = App.useApp();
  const [iosHelp, setIosHelp] = useState(false);

  if (!canInstall) return null;

  const onClick = async () => {
    if (mode === 'ios') return setIosHelp(true);
    const outcome = await install();
    if (outcome === 'accepted') message.success(`${CONFIG.appName} installed`);
  };

  const headerStyle = {
    background: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.55)',
    color: '#fff', fontWeight: 600,
  };

  // Top bar: icon only (tooltip + aria-label keep it understandable).
  // Elsewhere (login page): icon + the word "Install".
  const isHeader = variant === 'header';
  const button = (
    <Button
      icon={<DownloadOutlined />}
      onClick={onClick}
      block={block}
      size={isHeader ? 'small' : 'middle'}
      aria-label={`Install ${CONFIG.appName}`}
      style={isHeader ? headerStyle : { borderRadius: 8 }}
    >
      {isHeader ? null : 'Install'}
    </Button>
  );

  return (
    <>
      {isHeader ? <Tooltip title="Install app">{button}</Tooltip> : button}

      <Modal
        title={`Install ${CONFIG.appName}`}
        open={iosHelp}
        onCancel={() => setIosHelp(false)}
        footer={<Button type="primary" onClick={() => setIosHelp(false)}>Got it</Button>}
        centered
      >
        <ol style={{ paddingLeft: 18, margin: '8px 0 0', lineHeight: 1.9 }}>
          <li>Tap the <strong>Share</strong> button in Safari's toolbar.</li>
          <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong> — the portal opens from your home screen like an app.</li>
        </ol>
      </Modal>
    </>
  );
}
