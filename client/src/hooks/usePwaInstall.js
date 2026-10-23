import { useEffect, useState } from 'react';

/* PWA install state.
   Chromium (Chrome, Edge, Android) fires `beforeinstallprompt` only while the
   app is installable and NOT already installed — so "we hold a prompt" is
   the reliable "not installed yet" signal there. It can fire before React
   mounts, so it's captured at module load and shared with every subscriber.
   iOS Safari has no prompt at all; there we can only show instructions, and
   only outside the installed (standalone) app. */

let deferredPrompt = null;
const listeners = new Set();
const emit = () => listeners.forEach(fn => fn());

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
  window.navigator.standalone === true; // iOS home-screen app

// iPhone/iPad Safari (iPadOS reports as Mac, so also check for touch).
const isIosSafari = () => {
  const ua = window.navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return ios && !otherBrowser;
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); // keep the browser's mini-infobar from showing; we offer our own button
    deferredPrompt = e;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    emit();
  });
}

export function usePwaInstall() {
  const [, force] = useState(0);
  const [standalone, setStandalone] = useState(isStandalone);

  useEffect(() => {
    const rerender = () => force(n => n + 1);
    listeners.add(rerender);
    const mq = window.matchMedia?.('(display-mode: standalone)');
    const onMode = () => setStandalone(isStandalone());
    mq?.addEventListener?.('change', onMode);
    return () => { listeners.delete(rerender); mq?.removeEventListener?.('change', onMode); };
  }, []);

  const mode = standalone ? null : deferredPrompt ? 'prompt' : isIosSafari() ? 'ios' : null;

  // Shows the browser's install dialog; resolves to 'accepted' | 'dismissed'.
  const install = async () => {
    if (!deferredPrompt) return 'unavailable';
    const prompt = deferredPrompt;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    // A prompt can only be used once; Chromium fires a fresh one later if still installable.
    deferredPrompt = null;
    emit();
    return outcome;
  };

  return { canInstall: !!mode, mode, install };
}
