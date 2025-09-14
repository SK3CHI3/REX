import { useEffect } from 'react';

const PerformanceOptimizations = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload critical fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
      fontLink.as = 'style';
      document.head.appendChild(fontLink);

      // Preload critical images
      const criticalImages = [
        '/og-image.jpg',
        '/logo.png',
        '/favicon.svg'
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = 'image';
        document.head.appendChild(link);
      });
    };

    // Optimize images with lazy loading
    const optimizeImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    };

    // Add performance monitoring
    const addPerformanceMonitoring = () => {
      // Monitor page load time
      window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
      });

      // Monitor Core Web Vitals with native APIs
      if ('PerformanceObserver' in window) {
        // LCP (Largest Contentful Paint)
        try {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.log('LCP monitoring not supported');
        }

        // FID (First Input Delay)
        try {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry: any) => {
              console.log('FID:', entry.processingStart - entry.startTime);
            });
          }).observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.log('FID monitoring not supported');
        }

        // CLS (Cumulative Layout Shift)
        try {
          let clsValue = 0;
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            console.log('CLS:', clsValue);
          }).observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.log('CLS monitoring not supported');
        }
      }
    };

    // Add service worker for caching
    const registerServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('SW registered'))
          .catch(error => console.log('SW registration failed'));
      }
    };

    // Initialize optimizations
    preloadCriticalResources();
    optimizeImages();
    addPerformanceMonitoring();
    registerServiceWorker();

    // Cleanup
    return () => {
      // Cleanup any observers or listeners if needed
    };
  }, []);

  return null;
};

export default PerformanceOptimizations;
