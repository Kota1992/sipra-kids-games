/* SiPra Games — offline cache (bump CACHE_VERSION when shipping updates) */
'use strict';

const CACHE_VERSION = 'sipra-games-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './style.css',
  './assets/logo.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './games/_kit/games-shared.css',
  './games/_kit/game-kit.js',
  './games/shape-matching/style.css',
  './games/shape-matching/game.js',
  './games/color-sorting/style.css',
  './games/color-sorting/game.js',
  './games/color-splash/style.css',
  './games/color-splash/game.js',
  './games/missing-shape/style.css',
  './games/missing-shape/game.js',
  './games/guess-animal/style.css',
  './games/guess-animal/game.js',
  './games/feed-animals/style.css',
  './games/feed-animals/game.js',
  './games/bubble-pop/style.css',
  './games/bubble-pop/game.js',
  './games/butterfly-garden/style.css',
  './games/butterfly-garden/game.js',
  './games/jigsaw/style.css',
  './games/jigsaw/game.js',
  './games/count-objects/style.css',
  './games/count-objects/game.js',
  './games/shadow-match/style.css',
  './games/shadow-match/game.js',
  './games/memory/style.css',
  './games/memory/game.js',
  './games/balloon-pop/style.css',
  './games/balloon-pop/game.js',
  './games/magic-coloring/style.css',
  './games/magic-coloring/game.js',
  './games/car-wash/style.css',
  './games/car-wash/game.js',
  './js/core.js',
  './js/app.js'
];

function isSameOrigin(request) {
  try {
    return new URL(request.url).origin === self.location.origin;
  } catch (_) {
    return false;
  }
}

function isStaticAsset(pathname) {
  return /\.(css|js|png|svg|webp|ico|webmanifest)$/i.test(pathname);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !isSameOrigin(event.request)) return;

  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put('./index.html', copy));
          }
          return response;
        })
        .catch(() => caches.match('./index.html') || caches.match('./'))
    );
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      return cached || fetch(event.request).catch(() => undefined);
    })
  );
});