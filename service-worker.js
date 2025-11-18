// service-worker.js

// ¡¡IMPORTANTE!! Cambia esto cada vez que hagas cambios en main.js o css
const CACHE_NAME = 'DaniCtas-v4'; 

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

// Instalación
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta. Guardando ficheros...');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Activación y limpieza de caché vieja
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
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Fetch (Interceptar peticiones)
self.addEventListener('fetch', event => {
    const { request } = event;

    // Solo interceptamos peticiones GET
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    // 1. Estrategia para archivos de la App (Stale-While-Revalidate)
    // Normalizamos la URL para saber si es un archivo de la app
    let requestPath = url.pathname.substring(1);
    if (requestPath === '' || url.pathname.endsWith('/')) {
        requestPath = 'index.html';
    }
    
    const normalizedCacheUrls = URLS_TO_CACHE.map(path => path === '.' ? 'index.html' : path);
    const isAppShellResource = normalizedCacheUrls.includes(requestPath);

    // AQUÍ ESTABA EL ERROR: Faltaba este 'if'
    if (isAppShellResource) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return; // Este return finaliza la función para que no siga ejecutando lo de abajo
    }

    // 2. Estrategia para Firebase/API (Network First)
    if (request.url.includes('firestore.googleapis.com')) {
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
    }
});