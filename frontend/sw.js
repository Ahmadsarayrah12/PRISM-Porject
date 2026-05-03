const CACHE_NAME = 'prism-v3';
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
  './js/settings.js',
  './js/historyManager.js',
  './js/pdfReport.js'
];

// Network-first للملفات القابلة للتحديث (HTML/JS) — يضمن وصول التحديثات فور النشر
const NETWORK_FIRST_PATHS = [/\.html$/, /\/js\//];

self.addEventListener('install', event => {
  // فعّل النسخة الجديدة فوراً دون انتظار إغلاق التبويبات
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // احذف caches قديمة وسيطر على كل التبويبات المفتوحة فوراً
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // تجاوز الـ SW لأي طلبات API — مهم خصوصاً للـ streaming endpoints (SSE)
  // لأن المتصفح يحتاج تمرير الـ ReadableStream مباشرة دون تخزين أو نسخ
  if (url.pathname.startsWith('/api/')) return;

  // نتعامل فقط مع طلبات GET (caches API لا تدعم POST)
  if (event.request.method !== 'GET') return;

  // Network-first للـ HTML/JS — يجلب الجديد ويتراجع للـ cache عند فشل الشبكة
  const isUpdatable = NETWORK_FIRST_PATHS.some(re => re.test(url.pathname));
  if (isUpdatable) {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy)).catch(() => {});
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first لباقي الموارد (الأيقونات والـ manifest)
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});
