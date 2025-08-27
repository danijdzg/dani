const CACHE_NAME = 'cuentas-aidanai-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
  // Si tuvieras más archivos (CSS, otros JS, imágenes), los añadirías aquí.
  // Por ahora, como todo está en un solo archivo, esto es suficiente.
];

// Evento de instalación: se guarda en caché los archivos base de la app.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache abierto, añadiendo assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Evento de activación: limpia cachés antiguos.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Evento de fetch: decide si servir desde el caché o desde la red.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si el recurso está en el caché, lo devuelve. Si no, va a la red.
      return response || fetch(event.request);
    })
  );
});