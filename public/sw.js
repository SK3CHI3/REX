// Service Worker for REX Kenya
const CACHE_NAME = 'rex-kenya-v2';
const urlsToCache = [
  '/',
  '/map',
  '/cases',
  '/manifest.json',
  '/favicon.svg',
  '/favicon-16x16.svg',
  '/favicon-32x32.svg',
  '/logo.svg',
  '/og-image.svg'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // For JS/CSS assets, try to fetch from network
        if (event.request.url.includes('/assets/')) {
          return fetch(event.request).catch(() => {
            // If network fails, return a basic response to prevent white screen
            if (event.request.url.includes('.js')) {
              return new Response('console.log("Asset failed to load");', {
                headers: { 'Content-Type': 'application/javascript' }
              });
            }
            return new Response('', { headers: { 'Content-Type': 'text/css' } });
          });
        }

        // For other requests, fetch from network
        return fetch(event.request);
      })
      .catch(() => {
        // Fallback for critical resources
        if (event.request.url.includes('index.html')) {
          return caches.match('/');
        }
        return new Response('Resource not available', { status: 404 });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
