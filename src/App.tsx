
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ResumeProvider } from "@/contexts/ResumeContext";

// Layouts
import AppLayout from "@/layouts/AppLayout";

// Pages
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ResetPassword from "@/pages/ResetPassword";
import ResetPasswordConfirm from "@/pages/ResetPasswordConfirm";
import Dashboard from "@/pages/Dashboard";
import Resumes from "@/pages/Resumes";
import Agent from "@/pages/Agent";
import Jobs from "@/pages/Jobs";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ResumeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="resumes" element={<Resumes />} />
                <Route path="agent" element={<Agent />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ResumeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
