import { useState } from 'react';
import { App, Button, Modal, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { CONFIG } from '../../config';

/* "Install" — rendered only for people who haven't installed the app (see
   usePwaInstall); renders nothing otherwise. Same behaviour as the portal's.
   `variant="header"` is the compact, icon-only top-bar look (`dark` for the
   navy mobile header); the default shows the "Install" label (login page). */
export default function InstallButton({ variant = 'default', block = false, dark = false }) {
  const { canInstall, mode, install } = usePwaInstall();
  const { message } = App.useApp();
  const [iosHelp, setIosHelp] = useState(false);

  if (!canInstall) return null;

  const onClick = async () => {
    if (mode === 'ios') return setIosHelp(true);
    const outcome = await install();
    if (outcome === 'accepted') message.success(`${CONFIG.appName} installed`);
  };

  // Top bar: icon only (tooltip + aria-label keep it understandable).
  // Elsewhere (login page): icon + the word "Install".
  const isHeader = variant === 'header';
  const headerStyle = dark
    ? { background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.45)', color: '#fff' }
    : { color: '#1677ff', borderColor: '#91caff' };

  const button = (
    <Button
      icon={<DownloadOutlined />}
      onClick={onClick}
      block={block}
      size={isHeader ? 'small' : 'large'}
      aria-label={`Install ${CONFIG.appName}`}
      style={isHeader ? headerStyle : undefined}
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
          <li>Tap <strong>Add</strong> — the app opens from your home screen like any other.</li>
        </ol>
      </Modal>
    </>
  );
}
