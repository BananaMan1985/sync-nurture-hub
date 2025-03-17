import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Eye, AlertCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { reportHistoryData, getLocalDate } from '@/data/reportData';

const ReportHistory: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<typeof reportHistoryData[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const ITEMS_PER_PAGE = 5;

  // Filter reports based on search term
  const filteredReports = reportHistoryData
    .filter(report => 
      report.date.includes(searchTerm) ||
      report.completedTasks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by date using our consistent date handling
      const dateA = getLocalDate(a.date);
      const dateB = getLocalDate(b.date);
      return dateB.getTime() - dateA.getTime();
    }); // Sort by date, newest first
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Check if there are any reports
  const hasReports = reportHistoryData.length > 0;

  const viewReport = (report: typeof reportHistoryData[0]) => {
    setSelectedReport(report);
  };

  const closeReport = () => {
    setSelectedReport(null);
  };

  const getBusynessLabel = (level: string) => {
    const levelNum = parseInt(level);
    if (levelNum <= 3) return "Light day";
    if (levelNum <= 6) return "Moderate";
    return "Very busy";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!hasReports) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center p-8 bg-background border border-border/40 rounded-xl shadow-sm"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </motion.div>
        <motion.h3 variants={itemVariants} className="text-xl font-medium mb-2">No Reports Found</motion.h3>
        <motion.p variants={itemVariants} className="text-muted-foreground">
          You haven't submitted any reports yet. Create your first report to see it here.
        </motion.p>
      </motion.div>
    );
  }

  if (selectedReport) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 bg-white shadow-sm rounded-xl border border-border/40 p-6 md:p-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <motion.h3 variants={itemVariants} className="text-xl font-medium">
              Report Details
            </motion.h3>
            <motion.p variants={itemVariants} className="text-muted-foreground">
              {format(getLocalDate(selectedReport.date), 'MMMM dd, yyyy')}
            </motion.p>
          </div>
          <motion.div variants={itemVariants}>
            <Button onClick={closeReport} variant="outline">
              Back to List
            </Button>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="space-y-2 mt-6">
          <h4 className="font-medium text-muted-foreground">Busyness Level</h4>
          <p className="text-lg">{getBusynessLabel(selectedReport.busynessLevel)}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h4 className="font-medium text-muted-foreground">Completed Tasks</h4>
          <p>{selectedReport.completedTasks}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h4 className="font-medium text-muted-foreground">Outstanding Tasks</h4>
          <p>{selectedReport.outstandingTasks}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h4 className="font-medium text-muted-foreground">Need from Manager</h4>
          <p>{selectedReport.needFromManager}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h4 className="font-medium text-muted-foreground">Tomorrow's Plans</h4>
          <p>{selectedReport.tomorrowPlans}</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white shadow-sm rounded-xl border border-border/40 overflow-hidden"
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>View all your previously submitted reports</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Busyness</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReports.length > 0 ? (
                paginatedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {format(getLocalDate(report.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'Reviewed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell>{getBusynessLabel(report.busynessLevel)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => viewReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No reports match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    // Show first page, last page, current page, and pages around current
                    let pageToShow;
                    
                    if (totalPages <= 5) {
                      // If 5 or fewer pages, show all
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      // Near start
                      if (i < 4) {
                        pageToShow = i + 1;
                      } else {
                        pageToShow = totalPages;
                      }
                    } else if (currentPage >= totalPages - 2) {
                      // Near end
                      if (i === 0) {
                        pageToShow = 1;
                      } else {
                        pageToShow = totalPages - (4 - i);
                      }
                    } else {
                      // Middle
                      if (i === 0) {
                        pageToShow = 1;
                      } else if (i === 4) {
                        pageToShow = totalPages;
                      } else {
                        pageToShow = currentPage + (i - 2);
                      }
                    }
                    
                    // Add ellipsis
                    if ((i === 1 && pageToShow !== 2) || (i === 3 && pageToShow !== totalPages - 1)) {
                      return (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={pageToShow}>
                        <PaginationLink 
                          isActive={currentPage === pageToShow}
                          onClick={() => handlePageChange(pageToShow)}
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportHistory;
