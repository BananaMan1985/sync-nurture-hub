
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { CalendarDays, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<typeof reportHistoryData[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const reportsPerPage = 5;
  
  // Calculate page counts
  const totalPages = Math.ceil(reportHistoryData.length / reportsPerPage);
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reportHistoryData.slice(indexOfFirstReport, indexOfLastReport);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleViewReport = (report: typeof reportHistoryData[0]) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)} 
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return pageNumbers;
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
    if (levelNum <= 7) return "Moderate";
    return "Very busy";
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
            {currentReports.length > 0 ? (
              <>
                <div className="space-y-3">
                  {currentReports.map((report) => (
                    <div 
                      key={report.id} 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium">
                          {formatDate(report.date)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Busyness: {getBusynessLabel(report.busynessLevel)}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                      </PaginationItem>
                    )}
                    
                    {renderPageNumbers()}
                    
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No reports found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[610px]">
          <DialogHeader>
            <DialogTitle>
              Report for {selectedReport ? formatDate(selectedReport.date) : ''}
            </DialogTitle>
            <DialogDescription>
              Busyness level: {selectedReport ? getBusynessLabel(selectedReport.busynessLevel) : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
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
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ReportHistory;
