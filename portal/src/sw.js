import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Take over immediately on activate instead of waiting for all tabs with the
// old worker to close — otherwise a rebuild (e.g. renamed API routes) keeps
// serving the previous worker's cached responses/logic until a manual
// unregister, even with registerType: 'autoUpdate'.
self.skipWaiting();
clientsClaim();

// ── Web Push ──────────────────────────────────────────────────────────────────
// Every notification type (transactions recorded, registration reviews,
// ...) goes through this one
// handler, so nothing here may assume the notification is about any one of
// them specifically — the title/body already say what it's actually about.
self.addEventListener('push', event => {
  if (!event.data) return;
  const { title, body, url, tag } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title || CONFIG.appName, {
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

  // Both main-body tap and the 'view' action button go to whatever page the
  // notification links to (its `url`, set per notification type server-side).
  // Build an absolute URL so client.navigate() and openWindow() work reliably.
  const relPath = event.notification.data?.url || '/';
  const target  = self.location.origin + relPath;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // If the portal is already open, navigate it to the linked page.
      for (const client of list) {
        if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
          return client.navigate(target).then(c => c?.focus());
        }
      }
      // Otherwise open a new tab.
      return clients.openWindow(target);
    })
  );
});

// ── Precaching ────────────────────────────────────────────────────────────────
cleanupOutdatedCaches();

// Only precache content-hashed static assets (JS, CSS, fonts).
// index.html is intentionally excluded so the browser always fetches the
// latest shell from the network — prevents stale UI after deploys.
precacheAndRoute(
  (self.__WB_MANIFEST || []).filter(entry =>
    !/\.html$/.test(entry.url)
  )
);

// ── API mutations — always hit the network (one route per method) ─────────────
for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api'),
    new NetworkOnly(),
    method
  );
}

// ── API GET reads — network first, short-lived cache for offline fallback ─────
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api') && request.method === 'GET',
  new NetworkFirst({
    cacheName: 'portal-api-cache',
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 10 * 60 }),
    ],
  })
);

// ── Uploaded images — cache first (these don't change once stored) ────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/uploads'),
  new CacheFirst({
    cacheName: 'portal-uploads-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// ── Icons / fonts — stale-while-revalidate (display quickly, refresh async) ───
registerRoute(
  ({ request }) =>
    request.destination === 'font' || request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'portal-static-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);
