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
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ReportFormData {
  date: string;
  completedTasks: string;
  outstandingTasks: string;
  needFromManager: string;
  tomorrowPlans: string;
  busynessLevel: string; // Keeping this as form state name
}

export type ViewMode = 'form' | 'view';

const ReportForm: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
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
  const [hasShownRangeDialog, setHasShownRangeDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [executiveId, setExecutiveId] = useState<string | null>(null); // To store owner_id
  const [reportDates, setReportDates] = useState<Set<string>>(new Set());

  const sevenDaysAgo = subDays(startOfDay(new Date()), 7);

  // Fetch authenticated user ID and owner_id from user_metadata on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to authenticate user. Please log in again.', { duration: 3000 });
      } else if (user) {
        setUserId(user.id);
        const ownerId = user.user_metadata?.owner_id; // Extract owner_id from user_metadata
        if (ownerId) {
          setExecutiveId(ownerId);
        } else {
          console.warn('No owner_id found in user_metadata');
          toast.warning('No executive ID found. Report will be submitted without an executive ID.', { duration: 3000 });
          setExecutiveId(null);
        }
      } else {
        toast.error('No authenticated user found. Please log in.', { duration: 3000 });
      }
    };
    fetchUser();
  }, []);

  // Fetch all report dates for the user
  useEffect(() => {
    const fetchReportDates = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('reports')
          .select('date')
          .eq('assistant_id', userId);
        if (error) {
          console.error('Error fetching report dates:', error);
          toast.error('Failed to fetch report dates.', { duration: 3000 });
        } else {
          setReportDates(new Set(data.map((r) => r.date)));
        }
      }
    };
    fetchReportDates();
  }, [userId]);

  // Handle date selection and report existence check
  useEffect(() => {
    const checkExistingReport = async () => {
      if (selectedDate && userId) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('date', formattedDate)
          .eq('assistant_id', userId);

        if (error) {
          console.error('Error checking existing report:', error);
          toast.error('Failed to check existing report.', { duration: 3000 });
        } else {
          const existingReport = data?.[0];
          setReportExists(!!existingReport);

          if (existingReport && viewMode === 'view') {
            setFormData({
              date: existingReport.date,
              completedTasks: existingReport.completed_task || '',
              outstandingTasks: existingReport.outstanding_task || '',
              needFromManager: existingReport.need_from_manager || '',
              tomorrowPlans: existingReport.tomorrows_plan || '', // Corrected to tomorrows_plan
              busynessLevel: existingReport.business_level?.toString() || '5'
            });
          } else if (!existingReport) {
            resetFormData(formattedDate);
          }
        }
      }
    };
    checkExistingReport();
  }, [selectedDate, viewMode, userId]);

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
    
    if (!userId) {
      toast.error("No authenticated user found. Please log in.", { duration: 3000 });
      return;
    }

    setLoading(true);
    
    const currentDate = format(selectedDate, 'yyyy-MM-dd');
    console.log('Submitting report for date:', currentDate);
    
    const { error } = await supabase.from('reports').insert({
      date: currentDate,
      assistant_id: userId,
      executive_id: executiveId, // Use owner_id from user_metadata as executive_id
      completed_task: formData.completedTasks,
      outstanding_task: formData.outstandingTasks,
      need_from_manager: formData.needFromManager,
      tomorrows_plan: formData.tomorrowPlans, // Corrected to tomorrows_plan
      business_level: parseInt(formData.busynessLevel),
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error inserting report:', error);
      toast.error(`Failed to submit report: ${error.message}`, { duration: 3000 });
    } else {
      toast.success("Report submitted successfully", { duration: 3000 });
      setReportExists(true);
      setViewMode('view');
      // Refresh the form data with the submitted data
      setFormData(prev => ({
        ...prev,
        completedTasks: '',
        outstandingTasks: '',
        needFromManager: '',
        tomorrowPlans: ''
      }));
      // Update report dates
      setReportDates(prev => new Set(prev).add(currentDate));
    }
    
    setLoading(false);
  };

  const goToToday = () => {
    const nowDate = new Date();
    setSelectedDate(nowDate);
  };

  const moveDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const dayContent = (day: Date) => {
    const hasReport = reportDates.has(format(day, 'yyyy-MM-dd'));
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

  const isDateWithinSubmissionRange = !isBefore(selectedDate, sevenDaysAgo) && !isAfter(selectedDate, new Date());
  const isToday = isEqual(startOfDay(selectedDate), startOfDay(new Date()));
  const showFormattedDate = format(selectedDate, 'MMM dd, yyyy');

  const isViewMode = (mode: ViewMode): boolean => viewMode === mode;

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
              {isViewMode('view') ? 'Viewing report for' : 'Creating report for'} {showFormattedDate}
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

        {isViewMode('view') ? (
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
                disabled={isViewMode('view')}
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
                disabled={isViewMode('view')}
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
                disabled={isViewMode('view')}
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
                disabled={isViewMode('view')}
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
                      disabled={loading || !isDateWithinSubmissionRange || !userId}
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

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setHasShownRangeDialog(true);
        }
      }}>
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
              setHasShownRangeDialog(true);
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