/**
 * CROWN & BLIGHT: THE ROYAL GAMBIT (v4.0 PWA Offline Service Worker)
 * Stale-while-revalidate asset caching for zero-latency offline & mobile play.
 */
const CACHE_NAME = 'crown-blight-v4';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './js/audio.js',
  './js/data.js',
  './js/sprites.js',
  './js/renderer.js',
  './js/game.js',
  './assets/royal-crest.png',
  './assets/battlefield-bg.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request)
        .then(networkResp => {
          if (networkResp && networkResp.status === 200 && networkResp.type === 'basic') {
            const clone = networkResp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResp;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
