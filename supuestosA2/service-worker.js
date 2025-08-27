const CACHE_NAME = 'supuestos-manises-cache-v1';
const URLS_TO_CACHE = [
  './',
  './SupuestosA2.html',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap'
];

// Evento de instalación: se abre la caché y se guardan los archivos principales.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de "fetch": intercepta las peticiones.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la petición está en la caché, la devuelve.
        if (response) {
          return response;
        }
        // Si no, la busca en la red.
        return fetch(event.request);
      })
  );
});