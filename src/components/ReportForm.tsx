
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Save, Send } from 'lucide-react';

interface ReportFormData {
  date: string;
  busynessLevel: number;
  completedTasks: string;
  outstandingTasks: string;
  needFromManager: string;
  tomorrowPlans: string;
}

const initialFormData: ReportFormData = {
  date: new Date().toISOString().split('T')[0],
  busynessLevel: 5,
  completedTasks: '',
  outstandingTasks: '',
  needFromManager: '',
  tomorrowPlans: ''
};

const ReportForm: React.FC = () => {
  const [formData, setFormData] = useState<ReportFormData>(initialFormData);
  const [isDraft, setIsDraft] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, busynessLevel: value[0] }));
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setIsDraft(saveAsDraft);
    toast.success(
      saveAsDraft ? "Report saved as draft" : "Report submitted successfully",
      { duration: 3000 }
    );
    setLoading(false);
    
    if (!saveAsDraft) {
      // In a real app, we would redirect or do something else after submission
      setFormData(initialFormData);
    }
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
    <motion.form
      initial="hidden"
      animate="visible"
      variants={formVariants}
      onSubmit={(e) => handleSubmit(e, false)}
      className="space-y-6 bg-white shadow-sm rounded-xl border border-border/40 p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between">
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-medium">End-of-Day Report</h3>
          <p className="text-muted-foreground mt-1">
            {isDraft ? "Draft" : "Submitted"} for {formData.date}
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="w-full md:w-auto">
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full md:w-auto"
          />
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="busynessLevel">Busyness Level: {formData.busynessLevel}</Label>
          <span className="text-sm text-muted-foreground">
            {formData.busynessLevel < 4 ? "Light" : 
             formData.busynessLevel < 7 ? "Moderate" : "Heavy"}
          </span>
        </div>
        <Slider
          id="busynessLevel" 
          defaultValue={[formData.busynessLevel]} 
          max={10} 
          step={1}
          onValueChange={handleSliderChange}
          className="py-2"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="completedTasks">Completed Tasks</Label>
        <Textarea
          id="completedTasks"
          name="completedTasks"
          value={formData.completedTasks}
          onChange={handleChange}
          placeholder="What did you accomplish today?"
          className="min-h-24 resize-none"
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
        />
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-3 pt-2"
      >
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 gap-2"
          disabled={loading}
          onClick={(e) => handleSubmit(e, true)}
        >
          <Save className="w-4 h-4" />
          Save Draft
        </Button>
        <Button 
          type="submit" 
          className="flex-1 gap-2"
          disabled={loading}
        >
          <Send className="w-4 h-4" />
          Submit Report
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default ReportForm;
