import { useEffect, useState } from 'react';
import { Input, Button, Typography } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Sits below the Email field. Sends a one-time code to the entered address
   and confirms it before `onVerified(email)` is called — the parent form
   compares that value against the current email to know whether it's still
   valid (an edit to the email after verifying re-locks it). */
export default function EmailVerification({ api, email, verified, onVerified }) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState(null);

  useEffect(() => { setSent(false); setCode(''); setMsg(null); }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email || !EMAIL_RE.test(email)) return null;

  if (verified) {
    return (
      <Typography.Text style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
        <CheckCircleFilled /> Email verified
      </Typography.Text>
    );
  }

  const sendCode = async () => {
    setSending(true); setMsg(null);
    try {
      await api.post('/auth/send-verification-code', { email });
      setSent(true);
      setCooldown(60);
      setMsg({ type: 'success', text: 'Code sent — check your inbox.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send code' });
    } finally { setSending(false); }
  };

  const confirmCode = async () => {
    if (!code) return;
    setVerifying(true); setMsg(null);
    try {
      await api.post('/auth/verify-code', { email, code });
      onVerified(email);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Incorrect code' });
    } finally { setVerifying(false); }
  };

  return (
    <div style={{ marginTop: 6 }}>
      {!sent ? (
        <Button size="small" onClick={sendCode} loading={sending}>Verify Email</Button>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Enter code"
            value={code}
            maxLength={6}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            style={{ width: 110 }}
          />
          <Button size="small" type="primary" onClick={confirmCode} loading={verifying} disabled={!code}>
            Confirm
          </Button>
          <Button size="small" type="link" onClick={sendCode} disabled={cooldown > 0} loading={sending}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </Button>
        </div>
      )}
      {msg && (
        <div style={{ fontSize: 12, marginTop: 4, color: msg.type === 'error' ? '#ff4d4f' : '#22c55e' }}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
