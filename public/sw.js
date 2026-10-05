// Nombre del caché (cambiarlo al publicar cambios en los archivos estáticos)
const CACHE_NAME = 'v2_cache';

// Archivos/Recursos que queremos tener disponibles sin conexión
const urlsToCache = [
    '/',
    '/css/home.css',
    '/css/header.css',
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg'
];

// Rutas privadas o dinámicas que nunca deben guardarse en caché
const RUTAS_SIN_CACHE = ['/home', '/almacen', '/compras', '/lista', '/ofertas', '/inicio', '/productos'];

// Instalar SW
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activar SW y eliminar cachés antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

const guardarEnCache = (request, response) => {
    if (response && response.status === 200 && response.type === 'basic') {
        const copia = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copia));
    }
    return response;
};

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Solo GET del mismo origen y fuera de las rutas privadas/dinámicas
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;
    if (RUTAS_SIN_CACHE.some(ruta => url.pathname === ruta || url.pathname.startsWith(ruta + '/'))) return;

    if (request.mode === 'navigate') {
        // Páginas: primero la red (contenido actualizado); la caché solo si no hay conexión
        event.respondWith(
            fetch(request)
                .then(response => guardarEnCache(request, response))
                .catch(() => caches.match(request).then(r => r || caches.match('/')))
        );
        return;
    }

    // Archivos estáticos: se responde desde la caché y se actualiza en segundo plano
    event.respondWith(
        caches.match(request).then(cached => {
            const network = fetch(request)
                .then(response => guardarEnCache(request, response))
                .catch(() => cached);
            return cached || network;
        })
    );
});
