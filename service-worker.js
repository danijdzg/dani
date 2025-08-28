const CACHE_NAME = 'supuestos-manises-cache-v1';
const URLS_TO_CACHE = [
  '/supuestosA2/',
  '/supuestosA2/index.html',
  '/supuestosA2/icon-192x192.png', // Añadido
  '/supuestosA2/icon-512x512.png', // Añadido
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
elf.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
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