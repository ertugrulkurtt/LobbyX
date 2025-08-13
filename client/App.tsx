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
import { systemHealthCheck } from "./lib/systemHealthCheck";
import { cleanupAllSubscriptions } from "./lib/subscriptionManager";
import { testFirebaseConnection } from "./lib/firebase";

// Layout
import { Layout } from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import FirebaseErrorNotification from "./components/FirebaseErrorNotification";
import FirebaseRulesNotification from "./components/FirebaseRulesNotification";
import NetworkErrorNotification from "./components/NetworkErrorNotification";

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
  const [showRulesNotification, setShowRulesNotification] = React.useState(false);
  const [showNetworkError, setShowNetworkError] = React.useState(false);
  const [networkErrorCount, setNetworkErrorCount] = React.useState(0);

  // Initialize services when app starts
  useEffect(() => {
    // Initialize core services
    initFileCleanupService();

    // Test Firebase connection
    testFirebaseConnection().then((success) => {
      console.log("Firebase connection:", success ? "OK" : "Failed");
    });

    // Run simple health check
    setTimeout(() => {
      systemHealthCheck
        .runHealthCheck()
        .then(() => {
          systemHealthCheck.createHealthIndicator();
        })
        .catch((error) => {
          console.warn("Health check failed:", error);
        });
    }, 1000);

    // Listen for global Firebase permission errors
    const handleGlobalError = (event: any) => {
      const error = event.detail || event.reason;
      if (
        error &&
        (error.message?.includes("permission") ||
          error.code === "permission-denied")
      ) {
        setShowFirebaseError(true);
      }
    };

    // Listen for Firebase rules-related permission errors
    const handleRulesError = (event: any) => {
      const error = event.detail || event.reason;
      if (
        error &&
        error.code === "permission-denied" &&
        (error.message?.includes("notifications") ||
          error.message?.includes("userStats") ||
          error.message?.includes("messageStats") ||
          error.message?.includes("dailyActivity"))
      ) {
        setShowRulesNotification(true);
      }
    };

    // Listen for Firebase network errors
    const handleNetworkError = (event: any) => {
      const { error, context, errorCount } = event.detail || {};
      console.warn("Firebase network error detected:", error, context);
      setNetworkErrorCount(errorCount || 1);

      // Show error notification if there are multiple network errors
      if (errorCount >= 2) {
        setShowNetworkError(true);
      }
    };

    window.addEventListener("firebase-permission-error", handleGlobalError);
    window.addEventListener("firebase-rules-error", handleRulesError);
    window.addEventListener("firebase-network-error", handleNetworkError);
    return () => {
      window.removeEventListener(
        "firebase-permission-error",
        handleGlobalError,
      );
      window.removeEventListener("firebase-rules-error", handleRulesError);
      window.removeEventListener("firebase-network-error", handleNetworkError);
      // Clean up all Firebase subscriptions on app unmount
      cleanupAllSubscriptions();
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {showFirebaseError && (
        <FirebaseErrorNotification
          onClose={() => setShowFirebaseError(false)}
        />
      )}
      {showRulesNotification && (
        <FirebaseRulesNotification
          onClose={() => setShowRulesNotification(false)}
        />
      )}
      {showNetworkError && (
        <NetworkErrorNotification
          onClose={() => setShowNetworkError(false)}
          onRetry={() => {
            setShowNetworkError(false);
            setNetworkErrorCount(0);
            window.location.reload();
          }}
        />
      )}
      <Routes>
        {/* Public routes - only accessible when NOT logged in */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected routes - only accessible when logged in */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/servers"
          element={
            <ProtectedRoute>
              <Servers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
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
