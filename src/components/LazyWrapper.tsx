import { Suspense, lazy, ComponentType } from 'react';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  fallback = <div className="loading">Loading...</div>, 
  children 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Lazy load heavy components
export const LazyMapView = lazy(() => import('./MapView'));
export const LazyCaseModal = lazy(() => import('./CaseModal'));
export const LazyNewsDetailModal = lazy(() => import('./NewsDetailModal'));
export const LazyAdminDashboard = lazy(() => import('../pages/AdminDashboard'));

export default LazyWrapper;
