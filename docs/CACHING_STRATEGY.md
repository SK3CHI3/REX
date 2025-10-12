# Caching Strategy Documentation

## Overview

REX uses a multi-layered caching strategy following web performance best practices to ensure fast load times while maintaining data freshness.

## Service Worker Version

**Current Version:** v3.0.0

When deploying changes, increment the `CACHE_VERSION` constant in `public/sw.js` to force cache invalidation.

## Caching Strategies

### 1. Cache-First Strategy (Static Assets)

**Used for:** Versioned static assets (JS, CSS, images, fonts in `/assets/`)

**Behavior:**
- Check cache first
- If found, return cached version immediately
- If not found, fetch from network and cache
- Best for: Hashed/versioned files that never change

**Cache Duration:** 1 year (immutable)

**Example Files:**
- `/assets/index-DSdqlzfk.js`
- `/assets/index-BiZNOzuU.css`
- Fonts (`.woff2`, `.ttf`, etc.)
- Images (`.png`, `.jpg`, `.svg`, etc.)

### 2. Network-First Strategy (HTML/Routes)

**Used for:** HTML pages and route endpoints

**Behavior:**
- Try network first
- If network succeeds, cache response and return
- If network fails, fallback to cached version
- Best for: Content that changes frequently

**Cache Duration:** 0 seconds (must-revalidate)

**Example Routes:**
- `/` (homepage)
- `/map`
- `/cases`
- `/case/:id`

### 3. Stale-While-Revalidate (Other Resources)

**Used for:** Non-critical dynamic resources

**Behavior:**
- Return cached version immediately if available
- Fetch fresh version in background and update cache
- Best for: Resources that benefit from fast response but need updates

**Cache Duration:** 1 day for dynamic content

### 4. Network-Only (API Calls)

**Used for:** Supabase API calls and other external APIs

**Behavior:**
- Never cache
- Always fetch fresh data from network
- Best for: Real-time data that must be current

**No caching applied**

## HTTP Cache Headers

### HTML Files
```
Cache-Control: public, max-age=0, must-revalidate
```
- Always check with server for updates
- Can be cached but must revalidate

### Service Worker
```
Cache-Control: no-cache, no-store, must-revalidate
```
- Never cache the service worker itself
- Ensures users always get latest SW version

### Vite Build Assets (Hashed)
```
Cache-Control: public, max-age=31536000, immutable
```
- Cache for 1 year
- Immutable flag tells browser file will never change
- Safe because Vite uses content hashes in filenames

### Root Level JS/CSS
```
Cache-Control: public, max-age=86400, s-maxage=31536000
```
- Browser cache: 1 day
- CDN cache: 1 year
- Allows CDN to cache longer while browsers check daily

### Images and Fonts
```
Cache-Control: public, max-age=31536000, immutable
```
- Long-term caching (1 year)
- Marked immutable for maximum efficiency

## Service Worker Cache Management

### Cache Namespaces

1. **Static Cache** (`rex-kenya-static-v3.0.0`)
   - Pre-cached critical assets
   - Icons, logos, manifest
   - Cleared only when SW version changes

2. **Dynamic Cache** (`rex-kenya-dynamic-v3.0.0`)
   - Runtime cached pages and routes
   - Automatically populated as users browse
   - Cleared when SW version changes

### Update Mechanism

1. **On SW Update:**
   - New SW installs in background
   - Calls `skipWaiting()` to activate immediately
   - Old caches are deleted
   - Page reloads to use new SW

2. **Periodic Checks:**
   - Every hour, check for SW updates
   - Implemented in `main.tsx`

3. **Manual Cache Clear:**
   - Service worker listens for `CLEAR_CACHE` message
   - Utility script available at `/clear-cache.js`

## Best Practices Implemented

### ✅ Appropriate TTL Values
- Static assets: Long cache (1 year)
- Dynamic content: Short cache (1 day)
- HTML: No cache, must revalidate
- API calls: No cache

### ✅ Client-Side Caching
- Service Worker caches static assets
- Browser cache via Cache-Control headers
- Reduces server requests significantly

### ✅ Cache Invalidation
- Version-based cache names
- Automatic old cache deletion
- Service worker update notifications

### ✅ Cache Busting
- Vite generates content hashes for assets
- Automatic when files change
- Ensures users get latest code

### ✅ Performance Monitoring
- Console logs for cache operations
- Service worker lifecycle events logged
- Easy debugging of cache behavior

## Troubleshooting

### Problem: Stale Content After Deploy

**Solution:**
1. Increment `CACHE_VERSION` in `public/sw.js`
2. Rebuild and redeploy
3. Service worker will auto-update on next visit

### Problem: JavaScript Loading Issues

**Check:**
1. Verify `/assets/*.js` files have correct MIME type
2. Check browser console for cache/network errors
3. Ensure `_redirects` files aren't intercepting asset requests

### Problem: Service Worker Not Updating

**Solution:**
1. Clear browser cache manually
2. Unregister service worker in DevTools
3. Hard refresh (Ctrl+Shift+R)

### Problem: Too Much Cache Usage

**Check:**
1. Review cached items in DevTools > Application > Cache Storage
2. Ensure old caches are being deleted
3. Verify cache quotas aren't exceeded

## Cache Clear Utility

For users experiencing caching issues, direct them to:

```
https://rextracker.online/clear-cache.js
```

Or add to HTML:
```html
<script src="/clear-cache.js"></script>
```

This will:
- Unregister all service workers
- Clear all caches
- Clear localStorage and sessionStorage
- Prompt user to refresh

## Deployment Checklist

Before deploying:

- [ ] Increment `CACHE_VERSION` if SW logic changed
- [ ] Test caching in production mode locally (`npm run build && npm run preview`)
- [ ] Verify service worker updates properly
- [ ] Check Network tab in DevTools for cache headers
- [ ] Test offline functionality
- [ ] Verify no `_redirects` files in dist

## Monitoring

Monitor these metrics:

1. **Cache Hit Rate**
   - Should be >80% for static assets
   - Check in Service Worker logs

2. **Page Load Time**
   - First visit: Network dependent
   - Return visits: Should be <1s with cache

3. **Service Worker Installation Success**
   - Check registration success rate
   - Monitor update completion

## References

- [MDN: Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Google: Service Worker Caching Strategies](https://web.dev/offline-cookbook/)
- [MDN: HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Web.dev: Cache Control Best Practices](https://web.dev/http-cache/)

## Version History

### v3.0.0 (Current)
- Implemented three-tier caching strategy
- Added automatic service worker updates
- Separated static and dynamic caches
- Added proper cache invalidation
- Fixed duplicate SW registration
- Optimized HTTP cache headers

### v2.0.0 (Previous)
- Basic service worker implementation
- Simple cache-first strategy
- Manual cache management

### v1.0.0 (Initial)
- No service worker
- Browser cache only

