// Offline support: network first, cached copy when offline.
const CACHE = 'detonatr-v3';
const FILES = ['./', 'index.html', 'manual.html', 'css/style.css', 'js/engine.js', 'js/content.js', 'js/ui.js', 'js/bomb.js', 'js/manual.js',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'manifest.webmanifest', 'manual.webmanifest'];

self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Network first so updates show immediately; cache is the offline fallback.
  e.respondWith(fetch(e.request).then((res) => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
