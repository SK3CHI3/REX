// Service Worker for REX Kenya
// Version updated: Increment this when deploying changes
const CACHE_VERSION = 'v3.0.0';
const CACHE_NAME = `rex-kenya-${CACHE_VERSION}`;
const CACHE_NAME_STATIC = `rex-kenya-static-${CACHE_VERSION}`;
const CACHE_NAME_DYNAMIC = `rex-kenya-dynamic-${CACHE_VERSION}`;

// Static assets that rarely change - cache-first strategy
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.svg',
  '/favicon-16x16.svg',
  '/favicon-32x32.svg',
  '/logo.svg',
  '/logo.png',
  '/og-image.svg',
  '/placeholder.svg'
];

// Routes/pages - network-first strategy
const ROUTES = [
  '/',
  '/map',
  '/cases',
  '/case',
  '/cases-index'
];

// Max age for different cache types (in seconds)
const MAX_AGE = {
  STATIC: 365 * 24 * 60 * 60, // 1 year for static assets
  DYNAMIC: 24 * 60 * 60,      // 1 day for dynamic content
  API: 5 * 60                 // 5 minutes for API responses
};

// Install event - pre-cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME_STATIC).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
    ]).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match current version
          if (cacheName.startsWith('rex-kenya-') && !cacheName.includes(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip Supabase API calls - always get fresh data
  if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')) {
    return;
  }

  // Strategy 1: Cache-first for static assets (CSS, JS, images, fonts)
  if (request.url.includes('/assets/') || 
      /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_NAME_STATIC));
    return;
  }

  // Strategy 2: Network-first for HTML pages and routes
  if (request.headers.get('accept')?.includes('text/html') || 
      ROUTES.some(route => url.pathname === route || url.pathname.startsWith(route + '/'))) {
    event.respondWith(networkFirst(request, CACHE_NAME_DYNAMIC));
    return;
  }

  // Strategy 3: Stale-while-revalidate for other requests
  event.respondWith(staleWhileRevalidate(request, CACHE_NAME_DYNAMIC));
});

// Cache-first strategy: Try cache first, fallback to network
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    
    // Fallback responses for different asset types
    if (request.url.includes('.js')) {
      return new Response('console.log("Asset failed to load");', {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    if (request.url.includes('.css')) {
      return new Response('', { 
        headers: { 'Content-Type': 'text/css' } 
      });
    }
    
    return new Response('Resource not available', { status: 404 });
  }
}

// Network-first strategy: Try network first, fallback to cache
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful HTML responses
    if (networkResponse.ok && networkResponse.headers.get('content-type')?.includes('text/html')) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network-first failed, using cache:', error);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to root if available
    const rootCache = await caches.match('/');
    if (rootCache) {
      return rootCache;
    }
    
    return new Response('Offline - Page not available', { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Stale-while-revalidate: Return cache immediately, update cache in background
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
