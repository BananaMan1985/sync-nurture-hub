import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js"; // Import Supabase client
import Index from "./pages/Index";
import Reports from "./pages/Reports";
import Library from "./pages/Library";
import Voice from "./pages/Voice";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import AssistantSignup from "./pages/AssistantSignup";
import UpdatePassword from "./pages/UpdatePassword";

// Initialize Supabase client (replace with your credentials)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const queryClient = new QueryClient();

// PrivateRoute component to protect authenticated routes
const PrivateRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true/false = auth state

  // Check auth status on mount and listen for changes
  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session); // Set true if session exists, false if not
    };
    getSession();

    // Listen for auth state changes (e.g., login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Show a loading state while checking auth
  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Replace with a proper loading component if desired
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <Login />
              }
            />
            <Route path="/assistant-signup/:user_id" element={<AssistantSignup />} />
            {/* Protected routes */}
            <Route
              path="/reports"
              element={
                <PrivateRoute
                  element={<Reports />}
                  isAuthenticated={isAuthenticated}
                />
              }
            />
            <Route
              path="/library"
              element={
                <PrivateRoute
                  element={<Library />}
                  isAuthenticated={isAuthenticated}
                />
              }
            />
            <Route
              path="/voice"
              element={
                <PrivateRoute
                  element={<Voice />}
                  isAuthenticated={isAuthenticated}
                />
              }
            />
            <Route
              path="/projects"
              element={
                <PrivateRoute
                  element={<Projects />}
                  isAuthenticated={isAuthenticated}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute
                  element={<Settings />}
                  isAuthenticated={isAuthenticated}
                />
              }
            />
            <Route
              path="/reset-password/login"
              element={<PrivateRoute
                element={<UpdatePassword />}
                isAuthenticated={isAuthenticated}
              />}
            />
            <Route
              path="/tasks"
              element={<Navigate to="/projects" replace />}
            />
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
