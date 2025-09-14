
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PerformanceOptimizations from "./components/PerformanceOptimizations";
import SEOAnalytics from "./components/SEOAnalytics";
import LazyWrapper, { LazyAdminDashboard } from "./components/LazyWrapper";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import AllNewsPage from "./pages/AllCasesPage";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";

// Lazy load heavy components
const LazyMapView = lazy(() => import("./components/MapView"));
const LazyCaseModal = lazy(() => import("./components/CaseModal"));
const LazyNewsDetailModal = lazy(() => import("./components/NewsDetailModal"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <PerformanceOptimizations />
        <SEOAnalytics />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/cases" element={<AllNewsPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <LazyWrapper>
                    <LazyAdminDashboard />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
