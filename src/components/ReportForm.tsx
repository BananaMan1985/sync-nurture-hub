
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Send, Calendar as CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface ReportFormData {
  date: string;
  completedTasks: string;
  outstandingTasks: string;
  needFromManager: string;
  tomorrowPlans: string;
  busynessLevel: string;
}

// Define a type for the view mode
type ViewMode = 'form' | 'view';

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

const ReportForm: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<ReportFormData>({
    date: today,
    completedTasks: '',
    outstandingTasks: '',
    needFromManager: '',
    tomorrowPlans: '',
    busynessLevel: '5'
  });
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [reportExists, setReportExists] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const existingReport = reportHistoryData.find(r => r.date === formattedDate);
      
      setReportExists(!!existingReport);
      
      if (existingReport) {
        if (viewMode === 'view') {
          setFormData({
            date: existingReport.date,
            completedTasks: existingReport.completedTasks,
            outstandingTasks: existingReport.outstandingTasks,
            needFromManager: existingReport.needFromManager,
            tomorrowPlans: existingReport.tomorrowPlans,
            busynessLevel: existingReport.busynessLevel
          });
        }
      } else if (formattedDate === today) {
        setFormData({
          date: today,
          completedTasks: '',
          outstandingTasks: '',
          needFromManager: '',
          tomorrowPlans: '',
          busynessLevel: '5'
        });
      }
    }
  }, [selectedDate, viewMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (value: number[]) => {
    let selectedValue = value[0];
    
    if (selectedValue === 7) {
      const previousValue = parseInt(formData.busynessLevel);
      selectedValue = previousValue < 7 ? 6 : 8;
    }
    
    setFormData((prev) => ({ ...prev, busynessLevel: selectedValue.toString() }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: formattedDate }));
      
      const existingReport = reportHistoryData.find(r => r.date === formattedDate);
      
      if (existingReport) {
        setViewMode('view');
      } else if (formattedDate === today) {
        setViewMode('form');
      } else {
        setDialogOpen(true);
      }
      
      setShowCalendar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const existingReport = reportHistoryData.find(r => r.date === formData.date);
    if (existingReport) {
      toast.error("A report already exists for this date", { duration: 3000 });
      setLoading(false);
      return;
    }
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    reportHistoryData.push({
      id: reportHistoryData.length + 1,
      date: formData.date,
      status: 'Pending',
      completedTasks: formData.completedTasks,
      outstandingTasks: formData.outstandingTasks,
      needFromManager: formData.needFromManager,
      tomorrowPlans: formData.tomorrowPlans,
      busynessLevel: formData.busynessLevel
    });
    
    toast.success("Report submitted successfully", { duration: 3000 });
    setLoading(false);
    setReportExists(true);
    setViewMode('view');
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setFormData(prev => ({ ...prev, date: today }));
    setViewMode(reportExists ? 'view' : 'form');
  };

  const moveDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    const formattedDate = newDate.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: formattedDate }));
    
    const existingReport = reportHistoryData.find(r => r.date === formattedDate);
    setViewMode(existingReport ? 'view' : 'form');
  };

  const dayContent = (day: Date) => {
    const hasReport = reportHistoryData.some(r => {
      const reportDate = new Date(r.date);
      return reportDate.getDate() === day.getDate() &&
             reportDate.getMonth() === day.getMonth() &&
             reportDate.getFullYear() === day.getFullYear();
    });
    
    return (
      <div className={`${hasReport ? 'font-bold' : 'font-normal'}`}>
        {day.getDate()}
      </div>
    );
  };

  const getBusynessLabel = (level: string) => {
    const levelNum = parseInt(level);
    if (levelNum <= 3) return "Light day";
    if (levelNum <= 6) return "Moderate";
    if (levelNum === 7) return null;
    return "Very busy";
  };

  const formVariants = {
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

  return (
    <>
      <motion.form
        initial="hidden"
        animate="visible"
        variants={formVariants}
        onSubmit={handleSubmit}
        className="space-y-6 bg-white shadow-sm rounded-xl border border-border/40 p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between">
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-medium">End-of-Day Report</h3>
            <p className="text-muted-foreground mt-1">
              {viewMode === 'view' ? 'Viewing report for' : 'Creating report for'} {format(selectedDate, 'MMM dd, yyyy')}
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex gap-2 items-center">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={() => moveDate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Previous day</span>
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              onClick={() => setShowCalendar(true)}
              className="flex items-center gap-2 h-9"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={goToToday}
              className="h-9"
            >
              Today
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={() => moveDate(1)}
              className="h-9 w-9"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Next day</span>
            </Button>
          </motion.div>
        </div>

        {viewMode === 'view' ? (
          <div className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-muted-foreground">Busyness Level</Label>
              <p className="text-lg font-medium">{getBusynessLabel(formData.busynessLevel) || 'Moderate'}</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-muted-foreground">Completed Tasks</Label>
              <p className="text-base">{formData.completedTasks}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-muted-foreground">Outstanding Tasks</Label>
              <p className="text-base">{formData.outstandingTasks}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-muted-foreground">Need from Manager</Label>
              <p className="text-base">{formData.needFromManager}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-muted-foreground">Tomorrow's Plans</Label>
              <p className="text-base">{formData.tomorrowPlans}</p>
            </motion.div>
            
            {formData.date === today && (
              <motion.div 
                variants={itemVariants}
                className="flex justify-end pt-2"
              >
                <Button 
                  type="button" 
                  onClick={() => setViewMode('form')}
                >
                  Edit Report
                </Button>
              </motion.div>
            )}
          </div>
        ) : (
          <>
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="completedTasks">Completed Tasks</Label>
              <Textarea
                id="completedTasks"
                name="completedTasks"
                value={formData.completedTasks}
                onChange={handleChange}
                placeholder="What did you accomplish today?"
                className="min-h-24 resize-none"
                disabled={viewMode === 'view'}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="outstandingTasks">Outstanding Tasks</Label>
              <Textarea
                id="outstandingTasks"
                name="outstandingTasks"
                value={formData.outstandingTasks}
                onChange={handleChange}
                placeholder="What tasks are still in progress or pending?"
                className="min-h-24 resize-none"
                disabled={viewMode === 'view'}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="needFromManager">Need from Manager</Label>
              <Textarea
                id="needFromManager"
                name="needFromManager"
                value={formData.needFromManager}
                onChange={handleChange}
                placeholder="What do you need from your manager to move forward?"
                className="min-h-24 resize-none"
                disabled={viewMode === 'view'}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="tomorrowPlans">Tomorrow's Plans</Label>
              <Textarea
                id="tomorrowPlans"
                name="tomorrowPlans"
                value={formData.tomorrowPlans}
                onChange={handleChange}
                placeholder="What are your priorities for tomorrow?"
                className="min-h-24 resize-none"
                disabled={viewMode === 'view'}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="space-y-2">
                <Label>Busyness Level: {formData.busynessLevel}</Label>
                <Slider
                  defaultValue={[parseInt(formData.busynessLevel)]}
                  value={[parseInt(formData.busynessLevel)]}
                  onValueChange={handleSliderChange}
                  max={10}
                  min={1}
                  step={1}
                  className="py-4"
                  disabled={viewMode === 'view'}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Light day (1)</span>
                  <span>Very busy (10)</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex justify-end pt-2"
            >
              {reportExists ? (
                <Button 
                  type="button" 
                  onClick={() => setViewMode('view')}
                >
                  Cancel
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="gap-2"
                  disabled={loading || formData.date !== today}
                >
                  <Send className="w-4 h-4" />
                  Submit Report
                </Button>
              )}
            </motion.div>
          </>
        )}
      </motion.form>

      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
            <DialogDescription>
              Choose a date to view or create a report
            </DialogDescription>
          </DialogHeader>
          <div className="p-2">
            <Calendar 
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border pointer-events-auto mx-auto"
              components={{
                DayContent: ({ date }) => dayContent(date)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>No Report Available</DialogTitle>
            <DialogDescription className="text-destructive font-medium">
              No report was submitted for {format(selectedDate, 'MMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-muted-foreground mb-4">
              Reports can only be created for the current day.
            </p>
            <Button onClick={() => {
              setDialogOpen(false);
              goToToday();
            }}>
              Go to Today
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportForm;
