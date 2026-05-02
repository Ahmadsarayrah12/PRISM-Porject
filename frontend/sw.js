const CACHE_NAME = 'prism-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.html',
  './manifest.json',
  './assets/prism-icon.svg',
  './js/main.js',
  './js/ui.js',
  './js/api.js',
  './js/i18n.js',
  './js/sidebar.js',
  './js/toolSelector.js',
  './js/settings.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return cached version if found
        }
        return fetch(event.request); // Otherwise fetch from network
      })
  );
});
