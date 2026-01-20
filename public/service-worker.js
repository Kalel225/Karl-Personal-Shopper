const CACHE_NAME = 'karl-admin-cache-v1';

// Liste des fichiers à mettre en cache pour le Dashboard
const ASSETS_TO_CACHE = [
  '/dashboard.html',
  '/css/style.css',
  '/js/dashboard.js',
  '/js/app-pwa.js',
  '/images/icons/icon-192.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
];

// 1. Installation : On télécharge les fichiers dans le cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache Admin ouvert');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activation : Nettoyage des anciens caches si on change de version
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Stratégie de Fetch : On sert le cache d'abord, puis le réseau
self.addEventListener('fetch', (event) => {
  // On ne met PAS en cache les appels à l'API (les commandes changent tout le temps)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si le fichier est en cache, on le donne, sinon on va sur le réseau
      return response || fetch(event.request);
    })
  );
});
