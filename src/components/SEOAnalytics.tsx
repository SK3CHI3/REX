import { useEffect } from 'react';

const SEOAnalytics = () => {
  useEffect(() => {
    // Google Analytics 4 (replace with your GA4 measurement ID)
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with actual ID
    
    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Track page views
    const trackPageView = () => {
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    };

    // Track page view on load
    trackPageView();

    // Track page view on route change (for SPA)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(trackPageView, 100);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(trackPageView, 100);
    };

    window.addEventListener('popstate', () => {
      setTimeout(trackPageView, 100);
    });

    // Track custom events
    const trackCustomEvent = (eventName: string, parameters: Record<string, any> = {}) => {
      gtag('event', eventName, parameters);
    };

    // Track map interactions
    const trackMapInteraction = (action: string, details: string) => {
      trackCustomEvent('map_interaction', {
        action,
        details,
        page: window.location.pathname,
      });
    };

    // Track case submissions
    const trackCaseSubmission = (county: string, caseType: string) => {
      trackCustomEvent('case_submission', {
        county,
        case_type: caseType,
        page: window.location.pathname,
      });
    };

    // Track search queries
    const trackSearch = (query: string, results: number) => {
      trackCustomEvent('search', {
        search_term: query,
        results_count: results,
        page: window.location.pathname,
      });
    };

    // Expose tracking functions globally for use in components
    (window as any).trackMapInteraction = trackMapInteraction;
    (window as any).trackCaseSubmission = trackCaseSubmission;
    (window as any).trackSearch = trackSearch;

    // Track Core Web Vitals
    const trackWebVitals = () => {
      if ('PerformanceObserver' in window) {
        // LCP (Largest Contentful Paint)
        try {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            gtag('event', 'web_vitals', {
              metric_name: 'LCP',
              metric_value: Math.round(lastEntry.startTime),
              metric_rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs_improvement' : 'poor',
            });
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.log('LCP tracking not supported');
        }

        // FID (First Input Delay)
        try {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry: any) => {
              gtag('event', 'web_vitals', {
                metric_name: 'FID',
                metric_value: Math.round(entry.processingStart - entry.startTime),
                metric_rating: entry.processingStart - entry.startTime < 100 ? 'good' : entry.processingStart - entry.startTime < 300 ? 'needs_improvement' : 'poor',
              });
            });
          }).observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.log('FID tracking not supported');
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
            gtag('event', 'web_vitals', {
              metric_name: 'CLS',
              metric_value: Math.round(clsValue * 1000),
              metric_rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs_improvement' : 'poor',
            });
          }).observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.log('CLS tracking not supported');
        }
      }
    };

    trackWebVitals();

    // Cleanup
    return () => {
      // Remove global tracking functions
      delete (window as any).trackMapInteraction;
      delete (window as any).trackCaseSubmission;
      delete (window as any).trackSearch;
    };
  }, []);

  return null;
};

export default SEOAnalytics;
