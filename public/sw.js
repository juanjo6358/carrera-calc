self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          return caches.delete(cache);
        })
      );
    }).then(() => {
      self.registration.unregister();
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Do nothing, let the browser handle it. This effectively disables the old PWA caching.
});
