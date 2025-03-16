
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { CalendarDays, Eye } from 'lucide-react';
import { format } from 'date-fns';

// Sample data for demonstration
const reportHistoryData = [
  { 
    id: 1, 
    date: '2023-06-15', 
    status: 'Reviewed',
    completedTasks: 'Completed the UI design for the dashboard.',
    outstandingTasks: 'Need to finish the user profile section.',
    needFromManager: 'Feedback on the new layout design.',
    tomorrowPlans: 'Start implementing the feedback system.',
    busynessLevel: '5'
  },
  { 
    id: 2, 
    date: '2023-06-14', 
    status: 'Reviewed',
    completedTasks: 'Fixed bugs in the login flow.',
    outstandingTasks: 'Authentication edge cases need handling.',
    needFromManager: 'Access to the production error logs.',
    tomorrowPlans: 'Implement error tracking system.',
    busynessLevel: '4'
  },
  { 
    id: 3, 
    date: '2023-06-13', 
    status: 'Reviewed',
    completedTasks: 'Set up project repositories and CI/CD.',
    outstandingTasks: 'Documentation needs to be completed.',
    needFromManager: 'DevOps team coordination.',
    tomorrowPlans: 'Finish documentation and onboarding guides.',
    busynessLevel: '3'
  },
  { 
    id: 4, 
    date: '2023-06-12', 
    status: 'Pending',
    completedTasks: 'User research and competitor analysis.',
    outstandingTasks: 'Creating presentation of findings.',
    needFromManager: 'Schedule meeting with stakeholders.',
    tomorrowPlans: 'Prepare presentation and key insights.',
    busynessLevel: '2'
  },
  { 
    id: 5, 
    date: '2023-06-11', 
    status: 'Reviewed',
    completedTasks: 'Client meeting and requirement gathering.',
    outstandingTasks: 'Scope document needs review.',
    needFromManager: 'Budget approval for new tools.',
    tomorrowPlans: 'Create project timeline and milestones.',
    busynessLevel: '6'
  },
  { 
    id: 6, 
    date: '2023-06-10', 
    status: 'Reviewed',
    completedTasks: 'Sprint planning and task assignment.',
    outstandingTasks: 'Resource allocation for new sprint.',
    needFromManager: 'Team capacity discussion.',
    tomorrowPlans: 'Kick off new sprint and daily stand-ups.',
    busynessLevel: '3'
  },
  { 
    id: 7, 
    date: '2023-06-09', 
    status: 'Reviewed',
    completedTasks: 'Performance optimization across the platform.',
    outstandingTasks: 'Mobile performance still needs work.',
    needFromManager: 'Decision on browser support matrix.',
    tomorrowPlans: 'Address mobile-specific optimizations.',
    busynessLevel: '5'
  },
  { 
    id: 8, 
    date: '2023-06-08', 
    status: 'Reviewed',
    completedTasks: 'Accessibility audit and initial fixes.',
    outstandingTasks: 'WCAG AA compliance work ongoing.',
    needFromManager: 'Budget for accessibility testing.',
    tomorrowPlans: 'Implement keyboard navigation improvements.',
    busynessLevel: '4'
  },
];

const ReportHistory: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedReport, setSelectedReport] = useState<typeof reportHistoryData[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Convert report dates to Date objects for comparison
  const reportDates = reportHistoryData.map(report => new Date(report.date));
  
  // Handle date selection in calendar
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      const report = reportHistoryData.find(r => r.date === formattedDate);
      
      if (report) {
        setSelectedReport(report);
        setDialogOpen(true);
      } else {
        // Show "No report submitted" message if there's no report for the selected date
        setSelectedReport(null);
        setDialogOpen(true);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getBusynessLabel = (level: string) => {
    const levelNum = parseInt(level);
    if (levelNum <= 3) return "Light day";
    if (levelNum <= 6) return "Moderate";
    if (levelNum === 7) return null; // Skip 7
    return "Very busy";
  };

  // Custom day cell renderer to bold dates with reports
  const dayContent = (day: Date) => {
    const hasReport = isDayWithReport(day);
    return (
      <div className={`${hasReport ? 'font-bold' : 'font-normal'}`}>
        {day.getDate()}
      </div>
    );
  };

  // Function to check if a day has a report
  const isDayWithReport = (date: Date) => {
    return reportDates.some(reportDate => 
      reportDate.getDate() === date.getDate() && 
      reportDate.getMonth() === date.getMonth() && 
      reportDate.getFullYear() === date.getFullYear()
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Report History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Calendar 
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border pointer-events-auto"
              components={{
                DayContent: ({ date }) => dayContent(date)
              }}
              modifiers={{
                hasReport: isDayWithReport
              }}
              modifiersStyles={{
                hasReport: { 
                  backgroundColor: 'var(--primary-50)',
                  border: '1px solid var(--primary)'
                }
              }}
            />
            <p className="text-sm text-muted-foreground text-center">
              Click on a date to view or check report status
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[610px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? (
                `Report for ${format(selectedDate, 'MMM dd, yyyy')}`
              ) : ''}
            </DialogTitle>
            {selectedReport ? (
              <DialogDescription>
                Busyness level: {getBusynessLabel(selectedReport.busynessLevel)}
              </DialogDescription>
            ) : (
              <DialogDescription className="text-destructive font-medium">
                No report submitted for this date
              </DialogDescription>
            )}
          </DialogHeader>
          
          {selectedReport ? (
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Completed Tasks</h4>
                <p className="text-sm">{selectedReport.completedTasks}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Outstanding Tasks</h4>
                <p className="text-sm">{selectedReport.outstandingTasks}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Need from Manager</h4>
                <p className="text-sm">{selectedReport.needFromManager}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Tomorrow's Plans</h4>
                <p className="text-sm">{selectedReport.tomorrowPlans}</p>
              </div>
            </div>
          ) : selectedDate ? (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">
                No report has been submitted for this date.
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ReportHistory;
