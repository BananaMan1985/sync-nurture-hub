
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
import { Eye, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Import the same mock data used in the form component
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
];

const ReportHistory: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<typeof reportHistoryData[0] | null>(null);

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
              {format(parseISO(selectedReport.date), 'MMMM dd, yyyy')}
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
              {reportHistoryData.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{format(parseISO(report.date), 'MMM dd, yyyy')}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportHistory;
