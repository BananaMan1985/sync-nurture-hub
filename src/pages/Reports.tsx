
import React from 'react';
import Layout from '@/components/Layout';
import AnimatedTransition from '@/components/AnimatedTransition';
import ReportForm from '@/components/ReportForm';
import AppMenu from '@/components/AppMenu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, CheckCircle2, Clock } from 'lucide-react';

const reportHistory = [
  { 
    id: 1, 
    date: '2023-06-15', 
    busynessLevel: 8, 
    status: 'Reviewed'
  },
  { 
    id: 2, 
    date: '2023-06-14', 
    busynessLevel: 6, 
    status: 'Reviewed'
  },
  { 
    id: 3, 
    date: '2023-06-13', 
    busynessLevel: 7, 
    status: 'Reviewed'
  },
  { 
    id: 4, 
    date: '2023-06-12', 
    busynessLevel: 5, 
    status: 'Pending'
  },
];

const Reports: React.FC = () => {
  return (
    <Layout>
      <AnimatedTransition>
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
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
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Your submission history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportHistory.map((report) => (
                      <div 
                        key={report.id} 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            report.busynessLevel < 4 ? "bg-green-100 text-green-600" :
                            report.busynessLevel < 7 ? "bg-amber-100 text-amber-600" :
                            "bg-red-100 text-red-600"
                          }`}>
                            {report.busynessLevel}
                          </div>
                          <div>
                            <div className="font-medium">
                              {new Date(report.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              {report.status === 'Reviewed' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  Reviewed
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  Pending Review
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">View</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Tips</CardTitle>
                  <CardDescription>For effective reporting</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      <span className="text-sm">Be specific about completed tasks and achievements.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      <span className="text-sm">Clearly articulate what you need from your manager.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      <span className="text-sm">Use the busyness level to indicate capacity and workload.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">4</span>
                      </div>
                      <span className="text-sm">Set realistic priorities for tomorrow's plans.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AnimatedTransition>
    </Layout>
  );
};

export default Reports;
