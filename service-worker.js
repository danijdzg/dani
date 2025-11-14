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

// ✅ REEMPLAZO COMPLETO: TU self.addEventListener('fetch', ...) con este bloque
self.addEventListener('fetch', event => {
    const { request } = event;

    // No interceptar peticiones que no sean GET
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    // Estrategia Stale-While-Revalidate para los recursos de la App (CSS, JS, HTML, etc.)
    // Sirve desde la caché al instante y actualiza en segundo plano.
    if (URLS_TO_CACHE.some(path => url.pathname.endsWith(path.replace('./', '')))) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                    // Devuelve la respuesta de la caché si existe; si no, espera a la red.
                    return cachedResponse || fetchPromise;
                });
            })
        );
        // ⭐ CORRECCIÓN CRÍTICA: Se añade el 'return' que faltaba aquí.
        // Esto evita que la petición sea gestionada por la segunda estrategia.
        return; 
    }

    // Estrategia Network First para todo lo demás (APIs de Firebase, etc.)
    // Siempre intenta obtener los datos más frescos, con fallback a la caché si no hay red.
    event.respondWith(
        fetch(request)
            .catch(() => {
                // Si la red falla, intentamos servir desde la caché
                return caches.match(request);
            })
    );
});