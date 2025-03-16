
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, ListChecks, ClipboardList, BookOpen, Settings, Navigation } from 'lucide-react';

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ href, icon, label, active }) => (
  <Button 
    variant="link" 
    className={`px-0 py-3 mr-6 border-b-2 ${
      active 
        ? "text-foreground font-medium border-primary" 
        : "text-muted-foreground border-transparent"
    }`}
    asChild
  >
    <Link to={href}>
      {icon}
      {label}
    </Link>
  </Button>
);

const AppMenu: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { 
      href: "/voice", 
      icon: <Mic className="mr-2 h-5 w-5" />, 
      label: "Voice Tasks" 
    },
    { 
      href: "/tasks", 
      icon: <ListChecks className="mr-2 h-5 w-5" />, 
      label: "Project Board" 
    },
    { 
      href: "/navigation", 
      icon: <Navigation className="mr-2 h-5 w-5" />, 
      label: "Navigation" 
    },
    { 
      href: "/reports", 
      icon: <ClipboardList className="mr-2 h-5 w-5" />, 
      label: "End of Day Reports" 
    },
    { 
      href: "/library", 
      icon: <BookOpen className="mr-2 h-5 w-5" />, 
      label: "Reference" 
    },
    // Settings page will be added later
    { 
      href: "#", // Placeholder until Settings page is added
      icon: <Settings className="mr-2 h-5 w-5" />, 
      label: "Settings" 
    }
  ];

  return (
    <div className="flex border-b border-border/30 mb-8 overflow-x-auto">
      {menuItems.map((item) => (
        <MenuItem 
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={location.pathname === item.href}
        />
      ))}
    </div>
  );
};

export default AppMenu;
