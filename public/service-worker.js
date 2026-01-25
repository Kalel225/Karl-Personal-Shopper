const CACHE_NAME = 'karl-cache-v1';
const ASSETS = [
  '/dashboard.html',
  'assets/css/style-dashboard.css',
  'assets/js/dashboard.js',
  'assets/images/logo.png',
  'assets/images/bg-couple.jpg'
];

// Installation : Mise en cache des fichiers
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Stratégie : Répondre avec le cache, puis mettre à jour (Stale-while-revalidate)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
