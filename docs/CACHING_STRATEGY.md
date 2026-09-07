# Caching Strategy

Multi-layered caching strategy for optimal performance.

## Service Worker

**Current Version:** v3.0.0

Increment `CACHE_VERSION` in `public/sw.js` when deploying changes to force cache invalidation.

## Caching Strategies

### 1. Cache-First (Static Assets)

**Used for:** Versioned static assets (JS, CSS, images, fonts in `/assets/`)

**Behavior:**
- Check cache first
- Return cached version if found
- Fetch from network and cache if not found

**Cache Duration:** 1 year (immutable)

**Example:** `/assets/index-DSdqlzfk.js`, fonts, images

### 2. Network-First (HTML/Routes)

**Used for:** HTML pages and route endpoints

**Behavior:**
- Try network first
- Cache response and return if successful
- Fallback to cached version if network fails

**Cache Duration:** 0 seconds (must-revalidate)

**Example:** `/`, `/map`, `/cases`, `/case/:id`

### 3. Stale-While-Revalidate (Dynamic Resources)

**Used for:** Non-critical dynamic resources

**Behavior:**
- Return cached version immediately
- Fetch fresh version in background
- Update cache with new version

**Cache Duration:** 1 day

### 4. Network-Only (API Calls)

**Used for:** Supabase API calls and external APIs

**Behavior:**
- Never cache
- Always fetch fresh data

**No caching applied**

## HTTP Cache Headers

### HTML Files

```
Cache-Control: public, max-age=0, must-revalidate
```

### Service Worker

```
Cache-Control: no-cache, no-store, must-revalidate
```

### Vite Build Assets (Hashed)

```
Cache-Control: public, max-age=31536000, immutable
```

### Root Level JS/CSS

```
Cache-Control: public, max-age=86400, s-maxage=31536000
```

### Images and Fonts

```
Cache-Control: public, max-age=31536000, immutable
```

## Service Worker Cache Management

### Cache Namespaces

1. **Static Cache** (`pbt-static-v3.0.0`)
   - Pre-cached critical assets
   - Icons, logos, manifest
   - Cleared only when SW version changes

2. **Dynamic Cache** (`pbt-dynamic-v3.0.0`)
   - Runtime cached pages and routes
   - Automatically populated as users browse
   - Cleared when SW version changes

### Update Mechanism

1. New SW installs in background
2. Calls `skipWaiting()` to activate immediately
3. Old caches are deleted
4. Page reloads to use new SW

### Periodic Checks

Every hour, check for SW updates (implemented in `main.tsx`)

### Manual Cache Clear

Service worker listens for `CLEAR_CACHE` message. Utility available at `/clear-cache.js`.

## Best Practices

### Appropriate TTL Values

- Static assets: 1 year (immutable)
- Dynamic content: 1 day
- HTML: 0 (must-revalidate)
- API calls: Never cache

### Client-Side Caching

- Service Worker caches static assets
- Browser cache via Cache-Control headers
- Reduces server requests significantly

### Cache Invalidation

- Version-based cache names
- Automatic old cache deletion
- Service worker update notifications

### Cache Busting

- Vite generates content hashes for assets
- Automatic when files change
- Ensures users get latest code

### Performance Monitoring

- Console logs for cache operations
- Service worker lifecycle events
- Easy debugging

## Troubleshooting

### Stale Content After Deploy

1. Increment `CACHE_VERSION` in `public/sw.js`
2. Rebuild and redeploy
3. Service worker will auto-update on next visit

### JavaScript Loading Issues

1. Verify `/assets/*.js` files have correct MIME type
2. Check browser console for cache/network errors
3. Ensure `_redirects` files aren't intercepting assets

### Service Worker Not Updating

1. Clear browser cache manually
2. Unregister service worker in DevTools
3. Hard refresh (Ctrl+Shift+R)

### Too Much Cache Usage

1. Review cached items in DevTools > Application > Cache Storage
2. Ensure old caches are being deleted
3. Verify cache quotas aren't exceeded

## Cache Clear Utility

For users experiencing caching issues:

```
https://policebrutalitytracker.co.ke/clear-cache.js
```

This will:
- Unregister all service workers
- Clear all caches
- Clear localStorage and sessionStorage
- Prompt user to refresh

## Deployment Checklist

- Increment `CACHE_VERSION` if SW logic changed
- Test caching in production mode locally
- Verify service worker updates properly
- Check Network tab for cache headers
- Test offline functionality

## Monitoring

### Cache Hit Rate

- Should be >80% for static assets
- Check in Service Worker logs

### Page Load Time

- First visit: Network dependent
- Return visits: Should be <1s with cache

### Service Worker Installation

- Check registration success rate
- Monitor update completion

## Version History

### v3.0.0 (Current)

- Three-tier caching strategy
- Automatic service worker updates
- Separated static and dynamic caches
- Proper cache invalidation
- Fixed duplicate SW registration
- Optimized HTTP cache headers

### v2.0.0 (Previous)

- Basic service worker implementation
- Simple cache-first strategy
- Manual cache management

### v1.0.0 (Initial)

- No service worker
- Browser cache only
