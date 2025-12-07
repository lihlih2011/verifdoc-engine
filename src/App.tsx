import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AnalyzeDocument from "./pages/AnalyzeDocument";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/login"; // New import
import SignupPage from "./pages/auth/signup"; // New import
import ResetPasswordPage from "./pages/auth/reset-password"; // New import
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthProvider } from "./context/AuthContext"; // New import
import { ProtectedRoute } from "./components/ProtectedRoute"; // New import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider> {/* Wrap with AuthProvider */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout><Index /></MainLayout>} />
              <Route path="/pricing" element={<MainLayout><Pricing /></MainLayout>} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Routes */}
              <Route
                path="/analyze"
                element={
                  <ProtectedRoute>
                    <MainLayout><AnalyzeDocument /></MainLayout>
                  </ProtectedRoute>
                }
              />
              {/* Add other protected routes here, e.g., /dashboard */}

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