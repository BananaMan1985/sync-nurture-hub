
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CalendarDays, Eye } from 'lucide-react';
import { Button } from './ui/button';

// Sample data for demonstration
const reportHistoryData = [
  { id: 1, date: '2023-06-15', status: 'Reviewed' },
  { id: 2, date: '2023-06-14', status: 'Reviewed' },
  { id: 3, date: '2023-06-13', status: 'Reviewed' },
  { id: 4, date: '2023-06-12', status: 'Pending' },
  { id: 5, date: '2023-06-11', status: 'Reviewed' },
  { id: 6, date: '2023-06-10', status: 'Reviewed' },
  { id: 7, date: '2023-06-09', status: 'Reviewed' },
  { id: 8, date: '2023-06-08', status: 'Reviewed' },
];

const ReportHistory: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;
  
  // Calculate page counts
  const totalPages = Math.ceil(reportHistoryData.length / reportsPerPage);
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reportHistoryData.slice(indexOfFirstReport, indexOfLastReport);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {new Date(report.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
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
    </motion.div>
  );
};

export default ReportHistory;
