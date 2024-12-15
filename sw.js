const CACHE_NAME = 'cosmic-defenders-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/game.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/assets/sounds/coin-collect.mp3',
  '/assets/sounds/enemy-hit.mp3',
  '/assets/sounds/power-surge.mp3',
  '/assets/sounds/background-music-1.mp3',
  '/assets/sounds/background-music-2.mp3',
  '/assets/sounds/background-music-3.mp3',
  '/assets/sounds/background-music-4.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

