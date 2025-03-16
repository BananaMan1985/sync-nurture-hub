
import React from 'react';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import AnimatedTransition from '@/components/AnimatedTransition';
import { ClipboardList, BookOpen, LayoutKanban, Mic } from 'lucide-react';

const features = [
  {
    icon: ClipboardList,
    title: "End-of-Day Reports",
    description: "Structured daily check-ins to keep everyone aligned on priorities, progress, and needs.",
    href: "/reports"
  },
  {
    icon: BookOpen,
    title: "Reference Library",
    description: "A shared knowledge base for quick access to critical information and processes.",
    href: "/library"
  },
  {
    icon: LayoutKanban,
    title: "Project Tracker",
    description: "Visual task management with customizable Kanban-style workflows.",
    href: "/tasks"
  },
  {
    icon: Mic,
    title: "Voice Task Upload",
    description: "Record, transcribe, and transform voice notes into actionable tasks.",
    href: "/voice"
  }
];

const Index: React.FC = () => {
  return (
    <Layout>
      <AnimatedTransition>
        <Hero />
        
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="mb-4">Streamlined Features</h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to collaborate efficiently, with no unnecessary complexity.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.1}
                  href={feature.href}
                />
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl overflow-hidden border border-border/50">
              <div className="p-8 md:p-12">
                <h2 className="mb-4 text-center">Why This App?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">No Bloat</h3>
                      <p className="text-muted-foreground">Just essential features, without unnecessary complexity.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Real-time Collaboration</h3>
                      <p className="text-muted-foreground">Built for seamless EA-boss workflows and communication.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Centralized Information</h3>
                      <p className="text-muted-foreground">All tasks, reports, and information in one accessible place.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Beautiful Design</h3>
                      <p className="text-muted-foreground">Elegant, minimalist interface inspired by Apple's design principles.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedTransition>
    </Layout>
  );
};

export default Index;
