import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  Mic,
  ListChecks,
  ClipboardList,
  BookOpen,
  Settings,
  LogIn,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Initialize Supabase client safely with environment variables
const supabase = (() => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        "Supabase credentials missing. Auth features will be disabled."
      );
      return null;
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
})();

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Private menu items (visible only when logged in)
  const privateMenuItems = [
    {
      href: "/voice",
      icon: <Mic className="h-4 w-4 mr-1" />,
      label: "Voice Input",
    },
    {
      href: "/projects",
      icon: <ListChecks className="h-4 w-4 mr-1" />,
      label: "Project Board",
    },
    {
      href: "/reports",
      icon: <ClipboardList className="h-4 w-4 mr-1" />,
      label: "Reports",
    },
    {
      href: "/library",
      icon: <BookOpen className="h-4 w-4 mr-1" />,
      label: "Reference",
    },
    {
      href: "/settings",
      icon: <Settings className="h-4 w-4 mr-1" />,
      label: "Settings",
    },
  ];

  // Check authentication state on mount and listen for changes if Supabase is available
  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setIsLoggedIn(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkSession();

    // Only set up listener if Supabase is initialized
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setIsLoggedIn(!!session);
          console.log("Auth event:", event, "Session:", session);
        }
      );

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    if (!supabase) {
      console.warn("Supabase not initialized, cannot logout");
      navigate("/login");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      navigate("/login");
    }
  };

  // Handle login navigation
  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <nav className="bg-background border-b border-border/30 py-2 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-medium text-lg">
          Sagan Command Center
        </Link>
        <div className="flex items-center">
          <div className="flex space-x-1 mr-4">
            {/* Private menu items (visible only when logged in) */}
            {isLoggedIn &&
              privateMenuItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center",
                    location.pathname === item.href &&
                      "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
          </div>
          {!isLoggedIn && (
            <a href="/assistant-signup">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center px-2 mx-2"
              >
                <span>Assistant Signup</span>
              </Button>
            </a>
          )}

          {/* Public Login button (converts to Logout when logged in) */}
          <Button
            variant="outline"
            size="sm"
            onClick={isLoggedIn ? handleLogout : handleLogin}
            className="flex items-center mx-2"
          >
            {isLoggedIn ? (
              <>
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-1" />
                <span>Login / Signup</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
