import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NewAnalyse from "./pages/dashboard/NewAnalyse";
import Pricing from "./pages/pricing";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import ResetPasswordPage from "./pages/auth/reset-password";
import HistoryPage from "./pages/dashboard/history";
import AnalysisDetailPage from "./pages/dashboard/analysis/[id]";
import DashboardHome from "./pages/dashboard/DashboardHome";
import SecurityPage from "./pages/SecurityPage";
import ReportViewer from "./pages/report/ReportViewer"; // NEW IMPORT
import { ThemeProvider } from "@/components/ThemeProvider";
import { MainLayout } from "@/layouts/MainLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout><Index /></MainLayout>} />
              <Route path="/pricing" element={<MainLayout><Pricing /></MainLayout>} />
              <Route path="/security" element={<MainLayout><SecurityPage /></MainLayout>} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/report/:id" element={<MainLayout><ReportViewer /></MainLayout>} /> {/* NEW ROUTE */}

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><DashboardHome /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyze"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><NewAnalyse /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/history"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><HistoryPage /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/analysis/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><AnalysisDetailPage /></DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;