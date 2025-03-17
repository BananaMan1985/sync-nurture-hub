
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AnimatedTransition from '@/components/AnimatedTransition';
import ReportForm from '@/components/ReportForm';
import AppMenu from '@/components/AppMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportHistory from '@/components/ReportHistory';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("create");

  return (
    <Layout>
      <AnimatedTransition>
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="mb-4 text-4xl font-medium tracking-tight">End-of-Day Reports</h1>
            <p className="text-muted-foreground text-lg">
              Summarize your day, stay aligned, and plan effectively.
              <br />
              <span className="text-sm font-medium mt-1 inline-block">
                Reports can be viewed for any date but can only be submitted for the current day and up to 7 days in the past.
                <span className="text-destructive ml-1">All fields are required.</span>
              </span>
            </p>
          </div>
          
          <AppMenu />
          
          <div className="max-w-3xl mx-auto mt-8">
            <Tabs defaultValue="create" className="mb-6" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
                <TabsTrigger value="create">Create Report</TabsTrigger>
                <TabsTrigger value="history">Report History</TabsTrigger>
              </TabsList>
              <TabsContent value="create" className="mt-6">
                <ReportForm key={`form-${activeTab}`} />
              </TabsContent>
              <TabsContent value="history" className="mt-6">
                <ReportHistory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AnimatedTransition>
    </Layout>
  );
};

export default Reports;
