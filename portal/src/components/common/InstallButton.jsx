import { useState } from 'react';
import { App, Button, Modal } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { CONFIG } from '../../config';

/* "Install" — rendered only for people who haven't installed the portal as
   an app (see usePwaInstall); renders nothing otherwise.
   `variant="header"` is the compact white-on-gradient look for the top bar. */
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

  return (
    <>
      <Button
        icon={<DownloadOutlined />}
        onClick={onClick}
        block={block}
        size={variant === 'header' ? 'small' : 'middle'}
        style={variant === 'header' ? headerStyle : { borderRadius: 8 }}
      >
      </Button>

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
