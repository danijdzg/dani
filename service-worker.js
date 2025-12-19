// service-worker.js

const CACHE_NAME = 'DaniCtas';
const URLS_TO_CACHE = [
  '.',
  'index.html',
  'style.css',
  'main.js',
  'manifest.json',
  'aiDANaI.webp',
  'icons/android-chrome-192x192.png',
  'icons/android-chrome-512x512.png'
];

// Evento 'install': Se dispara cuando el Service Worker se instala por primera vez.
self.addEventListener('install', event => {
  // skipWaiting() fuerza al nuevo Service Worker a activarse inmediatamente.
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta. Guardando ficheros de la app...');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento 'activate': Se dispara cuando el Service Worker se activa.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (CACHE_NAME !== cacheName) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de las páginas abiertas.
  );
});

// REEMPLAZA TU self.addEventListener('fetch', ...) con este bloque
self.addEventListener('fetch', event => {
    const { request } = event;

    // No interceptar peticiones que no sean GET
    if (request.method !== 'GET') {
        return;
    }

    // Estrategia para los recursos de la App (CSS, JS, HTML, imágenes)
    // Stale-While-Revalidate: Sirve desde la caché al instante, y actualiza en segundo plano.
    if (URLS_TO_CACHE.includes(new URL(request.url).pathname)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                    // Devuelve la respuesta de la caché si existe, si no, espera a la red.
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Estrategia para datos de Firebase (Network First)
    // Siempre intenta obtener los datos más frescos, con fallback a la caché si no hay red.
    event.respondWith(
        fetch(request)
            .then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});