const CACHE_NAME = 'carrera-calc-v2';
const APP_SHELL = ['./','./index.html','./manifest.webmanifest?v=2','./sw.js','./icons/icon-192.png?v=2','./icons/icon-512.png', './icons/apple-touch-icon.png?v=2'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(()=>{});
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
