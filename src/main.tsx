import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/critical.css'
import './index.css'

// Register service worker with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[App] Service worker registered successfully');
        
        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is installed, show update notification
                console.log('[App] New version available! Refreshing...');
                
                // Tell the service worker to skip waiting
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                
                // Reload the page to use new service worker after a short delay
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.error('[App] Service worker registration failed:', registrationError);
      });

    // Listen for controller change and reload page
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[App] Controller changed, reloading...');
        window.location.reload();
      }
    });
  });
}

const rootElement = document.getElementById("root")!;

// Use hydration if the content is already rendered by react-snap
// Suppress hydration warnings for known mismatches (browser APIs, timestamps, etc.)
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, <App />, {
    onRecoverableError: (error) => {
      // Log hydration errors but don't crash the app
      console.warn('Hydration error recovered:', error);
    }
  });
} else {
  createRoot(rootElement).render(<App />);
}
