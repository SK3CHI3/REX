// Cache clearing utility for REX Kenya
// This script helps clear browser cache when users experience loading issues

(function() {
  'use strict';
  
  // Clear service worker cache
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // Clear browser cache
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    });
  }
  
  // Clear localStorage and sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.log('Could not clear storage:', e);
  }
  
  console.log('Cache cleared successfully. Please refresh the page.');
})();
