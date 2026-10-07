import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import Index from "./pages/Index";
import InjuryPrediction from "./pages/InjuryPrediction";
import MarketValue from "./pages/MarketValue";
import VideoAnalysis from "./pages/VideoAnalysis";
import Players from "./pages/Players";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Lazy load admin pages to prevent breaking the app if there's an error
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminActivityLogs = lazy(() => import("./pages/admin/ActivityLogs"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected routes with MainLayout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/injury"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <InjuryPrediction />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/market-value"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MarketValue />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/video"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <VideoAnalysis />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/players"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Players />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* Admin routes - specific routes first */}
            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="p-6">Loading...</div>}>
                      <AdminAnalytics />
                    </Suspense>
                  </MainLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="p-6">Loading...</div>}>
                      <AdminSettings />
                    </Suspense>
                  </MainLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/activity-logs"
              element={
                <AdminRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="p-6">Loading...</div>}>
                      <AdminActivityLogs />
                    </Suspense>
                  </MainLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="p-6">Loading...</div>}>
                      <AdminReports />
                    </Suspense>
                  </MainLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <MainLayout>
                    <Admin />
                  </MainLayout>
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
