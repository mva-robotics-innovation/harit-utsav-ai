/* HARIT UTSAV AI — cache v5 */
const C = 'harit-v5';

const F = [
  './',
  'index.html',
  'styles.css',
  'upgrade.css',
  'layout-fix.css',
  'page-router.css',
  'launch.css',
  'app.js',
  'page-router.js',
  'scenes.js',
  'vision-pipeline.js',
  'i18n.js',
  'future.js',
  'fireworks-house.js',
  'launch.js',
  'diwali.js',
  'CREDITS.md',
  'manifest.webmanifest',
  'vendor/three.min.js',
  'vendor/chart.umd.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(C)
      .then(cache => cache.addAll(F))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== C).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (
    event.request.method !== 'GET' ||
    new URL(event.request.url).origin !== self.location.origin
  ) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(C).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match('index.html'));
    })
  );
});