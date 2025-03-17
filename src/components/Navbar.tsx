
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mic, ListChecks, ClipboardList, BookOpen, Settings, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { 
      href: "/voice", 
      icon: <Mic className="h-4 w-4 mr-1" />, 
      label: "Voice Input" 
    },
    { 
      href: "/projects", 
      icon: <ListChecks className="h-4 w-4 mr-1" />, 
      label: "Project Board" 
    },
    { 
      href: "/reports", 
      icon: <ClipboardList className="h-4 w-4 mr-1" />, 
      label: "Reports" 
    },
    { 
      href: "/library", 
      icon: <BookOpen className="h-4 w-4 mr-1" />, 
      label: "Reference" 
    },
    { 
      href: "/settings", 
      icon: <Settings className="h-4 w-4 mr-1" />, 
      label: "Settings" 
    }
  ];

  // For demo purposes, we'll assume the user is not logged in
  const isLoggedIn = false;

  return (
    <nav className="bg-background border-b border-border/30 py-2 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-medium text-lg">Sagan Command Center</Link>
        <div className="flex items-center">
          <div className="flex space-x-1 mr-4">
            {menuItems.map((item) => (
              <Button 
                key={item.href}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center",
                  location.pathname === item.href && "bg-accent text-accent-foreground"
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
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/login')}
            className="flex items-center"
          >
            <LogIn className="h-4 w-4 mr-1" />
            <span>Login</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
