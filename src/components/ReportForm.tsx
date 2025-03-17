
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
import { Send, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { format, isAfter, isBefore, subDays, startOfDay, isEqual } from 'date-fns';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate the earliest date for submission (7 days ago)
  const sevenDaysAgo = subDays(startOfDay(new Date()), 7);

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
      } else {
        // Reset form data for new reports
        resetFormData(formattedDate);
      }
    }
  }, [selectedDate, viewMode]);

  // Function to reset form data
  const resetFormData = (date: string) => {
    setFormData({
      date: date,
      completedTasks: '',
      outstandingTasks: '',
      needFromManager: '',
      tomorrowPlans: '',
      busynessLevel: '5'
    });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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
      
      const existingReport = reportHistoryData.find(r => r.date === formattedDate);
      
      if (existingReport) {
        setViewMode('view');
        setFormData({
          date: existingReport.date,
          completedTasks: existingReport.completedTasks,
          outstandingTasks: existingReport.outstandingTasks,
          needFromManager: existingReport.needFromManager,
          tomorrowPlans: existingReport.tomorrowPlans,
          busynessLevel: existingReport.busynessLevel
        });
      } else {
        // Reset form data for new reports
        resetFormData(formattedDate);
        
        // Check if date is within allowed range for submission
        const isWithinSubmissionRange = !isBefore(date, sevenDaysAgo) && !isAfter(date, new Date());
        
        if (isWithinSubmissionRange) {
          setViewMode('form');
        } else {
          // For dates outside submission range, show dialog but stay in form mode
          setDialogOpen(true);
          setViewMode('form');
        }
      }
      
      setShowCalendar(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.completedTasks.trim()) {
      newErrors.completedTasks = 'Completed tasks is required';
    }
    
    if (!formData.outstandingTasks.trim()) {
      newErrors.outstandingTasks = 'Outstanding tasks is required';
    }
    
    if (!formData.needFromManager.trim()) {
      newErrors.needFromManager = 'Need from manager is required';
    }
    
    if (!formData.tomorrowPlans.trim()) {
      newErrors.tomorrowPlans = 'Tomorrow\'s plans is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields", { duration: 3000 });
      return;
    }
    
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
    const todayDate = new Date().toISOString().split('T')[0];
    
    const existingReport = reportHistoryData.find(r => r.date === todayDate);
    if (existingReport) {
      setViewMode('view');
      setFormData({
        date: existingReport.date,
        completedTasks: existingReport.completedTasks,
        outstandingTasks: existingReport.outstandingTasks,
        needFromManager: existingReport.needFromManager,
        tomorrowPlans: existingReport.tomorrowPlans,
        busynessLevel: existingReport.busynessLevel
      });
    } else {
      resetFormData(todayDate);
      setViewMode('form');
    }
  };

  const moveDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    const formattedDate = newDate.toISOString().split('T')[0];
    
    const existingReport = reportHistoryData.find(r => r.date === formattedDate);
    
    if (existingReport) {
      setViewMode('view');
      setFormData({
        date: existingReport.date,
        completedTasks: existingReport.completedTasks,
        outstandingTasks: existingReport.outstandingTasks,
        needFromManager: existingReport.needFromManager,
        tomorrowPlans: existingReport.tomorrowPlans,
        busynessLevel: existingReport.busynessLevel
      });
    } else {
      // Reset form data for the new date
      resetFormData(formattedDate);
      
      // Always set to form mode but disable submission if needed based on date
      setViewMode('form');
      
      // If outside submission range, show dialog to inform user
      const isWithinSubmissionRange = !isBefore(newDate, sevenDaysAgo) && !isAfter(newDate, new Date());
      if (!isWithinSubmissionRange) {
        setDialogOpen(true);
      }
    }
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

  // Check if selected date is within submission range
  const isDateWithinSubmissionRange = !isBefore(selectedDate, sevenDaysAgo) && !isAfter(selectedDate, new Date());
  const isToday = isEqual(startOfDay(selectedDate), startOfDay(new Date()));
  const showFormattedDate = format(selectedDate, 'MMM dd, yyyy');

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
              {viewMode === 'view' ? 'Viewing report for' : 'Creating report for'} {showFormattedDate}
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
            
            {isDateWithinSubmissionRange && (
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
              <Label htmlFor="completedTasks" className="flex items-center">
                Completed Tasks <span className="text-destructive ml-1">*</span>
              </Label>
              <Textarea
                id="completedTasks"
                name="completedTasks"
                value={formData.completedTasks}
                onChange={handleChange}
                placeholder="What did you accomplish today?"
                className={`min-h-24 resize-none ${errors.completedTasks ? 'border-destructive' : ''}`}
                disabled={viewMode === 'view'}
                required
              />
              {errors.completedTasks && (
                <p className="text-destructive text-sm">{errors.completedTasks}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="outstandingTasks" className="flex items-center">
                Outstanding Tasks <span className="text-destructive ml-1">*</span>
              </Label>
              <Textarea
                id="outstandingTasks"
                name="outstandingTasks"
                value={formData.outstandingTasks}
                onChange={handleChange}
                placeholder="What tasks are still in progress or pending?"
                className={`min-h-24 resize-none ${errors.outstandingTasks ? 'border-destructive' : ''}`}
                disabled={viewMode === 'view'}
                required
              />
              {errors.outstandingTasks && (
                <p className="text-destructive text-sm">{errors.outstandingTasks}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="needFromManager" className="flex items-center">
                Need from Manager <span className="text-destructive ml-1">*</span>
              </Label>
              <Textarea
                id="needFromManager"
                name="needFromManager"
                value={formData.needFromManager}
                onChange={handleChange}
                placeholder="What do you need from your manager to move forward?"
                className={`min-h-24 resize-none ${errors.needFromManager ? 'border-destructive' : ''}`}
                disabled={viewMode === 'view'}
                required
              />
              {errors.needFromManager && (
                <p className="text-destructive text-sm">{errors.needFromManager}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="tomorrowPlans" className="flex items-center">
                Tomorrow's Plans <span className="text-destructive ml-1">*</span>
              </Label>
              <Textarea
                id="tomorrowPlans"
                name="tomorrowPlans"
                value={formData.tomorrowPlans}
                onChange={handleChange}
                placeholder="What are your priorities for tomorrow?"
                className={`min-h-24 resize-none ${errors.tomorrowPlans ? 'border-destructive' : ''}`}
                disabled={viewMode === 'view'}
                required
              />
              {errors.tomorrowPlans && (
                <p className="text-destructive text-sm">{errors.tomorrowPlans}</p>
              )}
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
                <div className="flex flex-col gap-2 w-full">
                  {!isDateWithinSubmissionRange && (
                    <div className="flex items-center gap-2 text-muted-foreground bg-accent p-2 rounded mb-2 w-full">
                      <Info className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">Reports can only be submitted for dates within the last 7 days</span>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="gap-2"
                      disabled={loading || !isDateWithinSubmissionRange}
                    >
                      <Send className="w-4 h-4" />
                      Submit Report
                    </Button>
                  </div>
                </div>
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
            <DialogTitle>Date Out of Range</DialogTitle>
            <DialogDescription>
              Reports can only be submitted for dates within the last 7 days
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-muted-foreground mb-4">
              You can view reports for any date, but new reports can only be submitted for dates within the last 7 days.
            </p>
            <Button onClick={() => {
              setDialogOpen(false);
            }}>
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportForm;
