import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Take over immediately on activate instead of waiting for all tabs with the
// old worker to close — otherwise a redeploy (e.g. this icon fix) keeps
// serving the previous worker's stale code until every open instance of the
// app is fully closed, not just refreshed.
self.skipWaiting();
clientsClaim();

// ── Web Push ──────────────────────────────────────────────────────────────────
// Every notification type (new member registrations, ...) goes through
// this one handler, so nothing here may assume what the
// notification is about — the title/body already say that.
self.addEventListener('push', event => {
  if (!event.data) return;
  const { title, body, url, tag } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title || 'Accounts Master', {
      body:     body || '',
      // Android/Chrome notifications don't reliably rasterize SVG — that's
      // why this showed up blank/white on mobile. PNGs render correctly.
      icon:     '/notification-icon.png',
      badge:    '/notification-badge.png',
      data:     { url },
      tag:      tag || 'sm-update',
      renotify: true,
      vibrate:  [200, 100, 200],
      actions:  [{ action: 'view', title: 'View' }],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const relPath = event.notification.data?.url || '/';
  const target  = self.location.origin + relPath;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
          return client.navigate(target).then(c => c?.focus());
        }
      }
      return clients.openWindow(target);
    })
  );
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// API calls — network first, fall back to cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/api'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

// Uploaded images — cache first
registerRoute(
  ({ url }) => url.pathname.startsWith('/uploads'),
  new CacheFirst({
    cacheName: 'uploads-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);
