// service-worker.js
// Versión: 3.1 (Sin caché de Firestore)

const CACHE_NAME = 'aiDANaI-ctas';
const URLS_TO_CACHE = [
  '.',
  'index.html',
  'calculadora.html',
  'style.css',
  'main.js',
  'manifest.json',
  'icons/android-chrome-192x192.png',
  'icons/android-chrome-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando app shell...');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (CACHE_NAME !== cacheName) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
    const { request } = event;

    // 1. REGLA DE ORO: Ignorar completamente Firestore
    // Dejamos que el SDK de Firebase gestione su propia caché interna (IndexedDB)
    // Esto arregla el problema de datos obsoletos y conflictos de escritura.
    if (request.url.includes('firestore.googleapis.com') || request.url.includes('google.com')) {
        return; 
    }

    // 2. Solo gestionamos peticiones GET para recursos de la interfaz
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    // Normalización de index.html para PWA
    const resourcePath = url.pathname.endsWith('/') ? '/index.html' : url.pathname;
    
    // Comprobamos si es un recurso estático que queremos controlar
    const isAppShellResource = URLS_TO_CACHE.some(path => path.endsWith(resourcePath.replace(/^\//, '')));

    if (isAppShellResource) {
        // Estrategia Stale-While-Revalidate: Rapidez + Actualización
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    }).catch(err => console.log('Fallo red SW (no crítico si hay caché)', err));
                    
                    return cachedResponse || fetchPromise;
                });
            })
        );
    }
});