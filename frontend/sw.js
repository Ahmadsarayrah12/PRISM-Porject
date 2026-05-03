const CACHE_NAME = 'prism-v2';
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
  const url = new URL(event.request.url);

  // تجاوز الـ SW لأي طلبات API — مهم خصوصاً للـ streaming endpoints (SSE)
  // لأن المتصفح يحتاج تمرير الـ ReadableStream مباشرة دون تخزين أو نسخ
  if (url.pathname.startsWith('/api/')) return;

  // نُخزِّن فقط طلبات GET (caches API لا تدعم POST)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
