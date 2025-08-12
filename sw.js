/* eslint-disable no-undef */
// ====== Service Worker con Workbox ======
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');

workbox.setConfig({debug: false});

// Precarga básica (puedes ampliar esta lista si quieres cache más agresivo)
const PRECACHE = [
  './',
  './index.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];
// Si usas GitHub Pages en subruta, los paths relativos funcionan bien.

workbox.precaching.precacheAndRoute(PRECACHE.map(url => ({url, revision: null})));

// Estrategias:
// 1) Navegación HTML → NetworkFirst (para ver siempre lo último, con fallback a caché)
workbox.routing.registerRoute(
  ({request}) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'html-pages',
    networkTimeoutSeconds: 4,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]}),
      new workbox.expiration.ExpirationPlugin({maxEntries: 20, purgeOnQuotaError: true}),
    ],
  })
);

// 2) JS y CSS → StaleWhileRevalidate (rápido, y luego actualiza)
workbox.routing.registerRoute(
  ({request}) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'assets-static',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]}),
      new workbox.expiration.ExpirationPlugin({maxEntries: 40, maxAgeSeconds: 7*24*3600}),
    ],
  })
);

// 3) Imágenes → CacheFirst con caducidad
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]}),
      new workbox.expiration.ExpirationPlugin({maxEntries: 50, maxAgeSeconds: 30*24*3600}),
    ],
  })
);

// Mensaje para activar actualización bajo demanda (banner “Actualizar”)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activación: tomar control de clientes cuando el SW ya es activo
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
