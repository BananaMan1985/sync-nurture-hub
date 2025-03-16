
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FileText, Tag, MessageSquare, CalendarDays, X, Check } from 'lucide-react';
import { Task, TaskStatus } from './types';

interface TaskFormProps {
  task?: Task | null;
  onSave: (task: Partial<Task>) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    dueDate: task?.dueDate || format(new Date(), 'yyyy-MM-dd'),
    priority: task?.priority || 'medium',
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : new Date()
  );

  const handleChange = (field: keyof Task, value: any) => {
    setNewTask(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(newTask);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4 text-gray-500" />
          <span>Project Title</span>
        </div>
        <Input
          value={newTask.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Project title"
          className="text-lg font-medium"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
          <Tag className="h-4 w-4 text-gray-500" />
          <span>Status</span>
        </div>
        <Select 
          defaultValue={newTask.status}
          onValueChange={(value) => handleChange('status', value as TaskStatus)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectItem value="todo" className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
              <span>To Do</span>
            </SelectItem>
            <SelectItem value="inprogress" className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
              <span>In Progress</span>
            </SelectItem>
            <SelectItem value="done" className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Done</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <span>Description</span>
        </div>
        <Textarea
          placeholder="Add a detailed description..."
          value={newTask.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="min-h-[120px] resize-none"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <span>Due Date</span>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                if (date) {
                  handleChange('dueDate', format(date, 'yyyy-MM-dd'));
                }
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} size="sm">
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          size="sm" 
          className="bg-[#2D3B22] hover:bg-[#3c4f2d] text-white"
          disabled={!newTask.title?.trim()}
        >
          <Check className="h-4 w-4 mr-1" />
          {task ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </div>
  );
};

export default TaskForm;
