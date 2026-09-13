const CACHE_NAME = 'tbpg-elearning-shell-v3';
const BASE = '/e-learning/';
const SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // index/config her zaman önce ağdan gelsin.
  if (req.mode === 'navigate' || url.pathname.endsWith('/config.js')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() =>
        req.mode === 'navigate'
          ? caches.match(BASE + 'index.html')
          : caches.match(req)
      )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
