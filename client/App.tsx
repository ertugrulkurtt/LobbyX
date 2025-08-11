import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect } from "react";

// Contexts
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Services
import { initFileCleanupService } from "./lib/fileCleanupService";
import { initializeConnectionMonitoring } from "./lib/firebaseConnectionMonitor";
import { initializeErrorHandler } from "./lib/unifiedErrorHandler";
import "./lib/firebaseDebugUtils"; // Initialize debug utilities
import "./lib/callSystemTest"; // Initialize call system tests
import { systemHealthCheck } from "./lib/systemHealthCheck";
import { initializePerformanceMonitoring } from "./lib/performanceOptimizations";
import { initializeAuthAwareFirebaseTest } from "./lib/authAwareFirebaseTest";


// Layout
import { Layout } from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import FirebaseErrorNotification from "./components/FirebaseErrorNotification";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Dashboard from "./pages/Dashboard";
import Servers from "./pages/Servers";
import Groups from "./pages/Groups";
import Chat from "./pages/Chat";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gaming-bg flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        <p className="text-gaming-muted">Yükleniyor...</p>
      </div>
    </div>
  );
}

// Protected Route component - only for authenticated users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

// Public Route component - only for non-authenticated users
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Main App Router
function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showFirebaseError, setShowFirebaseError] = React.useState(false);

  // Initialize services when app starts
  useEffect(() => {
    // Initialize performance monitoring first
    initializePerformanceMonitoring();

    // Initialize core services
    initFileCleanupService();
    initializeConnectionMonitoring();
    initializeErrorHandler();

    // Initialize authentication-aware Firebase testing
    initializeAuthAwareFirebaseTest();

    // Run health check after services are initialized
    setTimeout(() => {
      systemHealthCheck.runHealthCheck().then(() => {
        systemHealthCheck.createHealthIndicator();
      }).catch((error) => {
        if (error.message?.includes('permission') || error.code === 'permission-denied') {
          setShowFirebaseError(true);
        }
      });
    }, 2000);

    // Listen for global Firebase permission errors
    const handleGlobalError = (event: any) => {
      const error = event.detail || event.reason;
      if (error && (error.message?.includes('permission') || error.code === 'permission-denied')) {
        setShowFirebaseError(true);
      }
    };

    window.addEventListener('firebase-permission-error', handleGlobalError);
    return () => {
      window.removeEventListener('firebase-permission-error', handleGlobalError);
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {showFirebaseError && (
        <FirebaseErrorNotification onClose={() => setShowFirebaseError(false)} />
      )}
      <Routes>
      {/* Public routes - only accessible when NOT logged in */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      {/* Protected routes - only accessible when logged in */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/servers" element={
        <ProtectedRoute>
          <Servers />
        </ProtectedRoute>
      } />
      <Route path="/groups" element={
        <ProtectedRoute>
          <Groups />
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/friends" element={
        <ProtectedRoute>
          <Friends />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={
        isAuthenticated ? (
          <ProtectedRoute>
            <NotFound />
          </ProtectedRoute>
        ) : (
          <Navigate to="/" replace />
        )
      } />
      </Routes>
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppRouter />
                </BrowserRouter>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
