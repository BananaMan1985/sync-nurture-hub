
import React from 'react';
import Layout from '@/components/Layout';
import AnimatedTransition from '@/components/AnimatedTransition';
import ReportForm from '@/components/ReportForm';
import ReportHistory from '@/components/ReportHistory';
import AppMenu from '@/components/AppMenu';

const Reports: React.FC = () => {
  return (
    <Layout>
      <AnimatedTransition>
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="mb-4 text-4xl font-medium tracking-tight">End-of-Day Reports</h1>
            <p className="text-muted-foreground text-lg">
              Summarize your day, stay aligned, and plan effectively.
            </p>
          </div>
          
          <AppMenu />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <ReportForm />
            </div>
            
            <div>
              <ReportHistory />
            </div>
          </div>
        </div>
      </AnimatedTransition>
    </Layout>
  );
};

export default Reports;
