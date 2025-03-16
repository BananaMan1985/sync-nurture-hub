
import React from 'react';
import Layout from '@/components/Layout';
import AnimatedTransition from '@/components/AnimatedTransition';
import ReportForm from '@/components/ReportForm';
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
          
          <div className="max-w-3xl mx-auto mt-8">
            <ReportForm />
          </div>
        </div>
      </AnimatedTransition>
    </Layout>
  );
};

export default Reports;
