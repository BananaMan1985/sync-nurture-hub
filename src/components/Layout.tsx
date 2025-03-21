
import React, { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-6 pb-24"> {/* Increased bottom padding further */}
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
      <footer className="py-6 border-t border-border/30 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Sagan Command Center</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
