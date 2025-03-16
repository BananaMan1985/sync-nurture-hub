
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface ReportFormData {
  date: string;
  completedTasks: string;
  outstandingTasks: string;
  needFromManager: string;
  tomorrowPlans: string;
  busynessLevel: string;
}

const initialFormData: ReportFormData = {
  date: new Date().toISOString().split('T')[0],
  completedTasks: '',
  outstandingTasks: '',
  needFromManager: '',
  tomorrowPlans: '',
  busynessLevel: '5'
};

const ReportForm: React.FC = () => {
  const [formData, setFormData] = useState<ReportFormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (value: number[]) => {
    let selectedValue = value[0];
    
    // Skip the value 7
    if (selectedValue === 7) {
      // If coming from a lower value, go to 6, otherwise go to 8
      const previousValue = parseInt(formData.busynessLevel);
      selectedValue = previousValue < 7 ? 6 : 8;
    }
    
    setFormData((prev) => ({ ...prev, busynessLevel: selectedValue.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    toast.success("Report submitted successfully", { duration: 3000 });
    setLoading(false);
    setFormData(initialFormData);
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
      onSubmit={handleSubmit}
      className="space-y-6 bg-white shadow-sm rounded-xl border border-border/40 p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between">
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-medium">End-of-Day Report</h3>
          <p className="text-muted-foreground mt-1">
            For {formData.date}
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
        <Button 
          type="submit" 
          className="gap-2"
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
