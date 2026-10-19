import { useCallback, useEffect, useRef, useState } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// `api` is the axios instance to use — member and brand ambassador each
// have their own, with their own auth token and push-subscription records.
export function usePushNotifications(api, recipientId) {
  const subscribed = useRef(false);
  const [status, setStatus] = useState('idle'); // idle | subscribing | active | denied | unsupported | error

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }
    if (subscribed.current) return;

    setStatus('subscribing');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await api.post('/push/subscribe', existing.toJSON());
        subscribed.current = true;
        setStatus('active');
        return;
      }

      const { data } = await api.get('/push/vapid-key');
      const appServerKey = urlBase64ToUint8Array(data.publicKey);

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: appServerKey,
      });

      await api.post('/push/subscribe', sub.toJSON());
      subscribed.current = true;
      setStatus('active');
    } catch (err) {
      console.error('Push subscription failed:', err);
      setStatus('error');
    }
  }, [api]);

  const unsubscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.delete('/push/unsubscribe', { data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      subscribed.current = false;
      setStatus('idle');
    } catch (err) {
      console.error('Push unsubscribe failed:', err);
    }
  }, [api]);

  useEffect(() => {
    if (recipientId) subscribe();
  }, [recipientId, subscribe]);

  return { subscribe, unsubscribe, status };
}
