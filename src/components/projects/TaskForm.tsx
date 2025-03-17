import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FileText, Target, Flag, CalendarDays, X, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Task, TaskStatus } from './types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TaskFormProps {
  task?: Task | null;
  onSave: (task: Partial<Task>) => void;
  onCancel: () => void;
  statuses?: { id: string; name: string }[];
  initialStatus?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  task, 
  onSave, 
  onCancel, 
  statuses, 
  initialStatus 
}) => {
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || initialStatus || 'todo',
    dueDate: task?.dueDate || format(new Date(), 'yyyy-MM-dd'),
    priority: task?.priority || 'medium',
    content: task?.content || '',
    purpose: task?.purpose || '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : new Date()
  );
  const [includeDueDate, setIncludeDueDate] = useState<boolean>(!!task?.dueDate);
  const [activeTab, setActiveTab] = useState<string>("details");

  useEffect(() => {
    if (task) {
      setNewTask({
        ...task,
        title: task.title || '',
        description: task.description || '',
        content: task.content || '',
        purpose: task.purpose || '',
        status: task.status || initialStatus || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || format(new Date(), 'yyyy-MM-dd'),
      });
      setSelectedDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setIncludeDueDate(!!task.dueDate);
    }
  }, [task, initialStatus]);

  const handleChange = (field: keyof Task, value: any) => {
    setNewTask(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const taskToSave = { ...newTask };
    if (!includeDueDate) {
      delete taskToSave.dueDate;
    }
    
    if (task?.id) {
      taskToSave.id = task.id;
    }
    
    if (task?.comments) {
      taskToSave.comments = task.comments;
    }
    
    if (task?.attachments) {
      taskToSave.attachments = task.attachments;
    }
    
    console.log("Saving task:", taskToSave);
    onSave(taskToSave);
  };

  return (
    <Card className="p-6 overflow-auto max-h-[75vh]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="task">
            <FileText className="h-4 w-4 mr-2" />
            Task
          </TabsTrigger>
          <TabsTrigger value="purpose">
            <Target className="h-4 w-4 mr-2" />
            Purpose
          </TabsTrigger>
          <TabsTrigger value="endstate">
            <Flag className="h-4 w-4 mr-2" />
            End State
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
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
              <FileText className="h-4 w-4 text-gray-500" />
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
                {statuses ? (
                  statuses.map(status => (
                    <SelectItem key={status.id} value={status.id} className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                      <span>{status.name}</span>
                    </SelectItem>
                  ))
                ) : (
                  <>
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
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <span>Due Date (Optional)</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIncludeDueDate(!includeDueDate)}
                className="text-xs h-7"
              >
                {includeDueDate ? "Remove date" : "Add date"}
              </Button>
            </div>
            
            {includeDueDate && (
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
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setActiveTab("task")} 
              className="flex items-center"
            >
              Next: Task
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="task" className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
              <FileText className="h-4 w-4 text-gray-500" />
              <span>Task Details</span>
            </div>
            <div className="text-sm text-gray-500 mb-3">
              Add specific actions and tasks needed to complete this project. What needs to be done and in what order?
            </div>
            <Textarea
              placeholder="List specific actions required to complete this project..."
              value={newTask.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>

          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("details")} 
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back: Basic Info
            </Button>
            <Button 
              onClick={() => setActiveTab("purpose")} 
              className="flex items-center"
            >
              Next: Purpose
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="purpose" className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
              <Target className="h-4 w-4 text-gray-500" />
              <span>Project Purpose</span>
            </div>
            <div className="text-sm text-gray-500 mb-3">
              Explain why this project exists. What problem does it solve? Why is it important?
            </div>
            <Textarea
              placeholder="Describe the purpose and importance of this project..."
              value={newTask.purpose || ''}
              onChange={(e) => handleChange('purpose', e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>

          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("task")} 
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back: Task
            </Button>
            <Button 
              onClick={() => setActiveTab("endstate")} 
              className="flex items-center"
            >
              Next: End State
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="endstate" className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
              <Flag className="h-4 w-4 text-gray-500" />
              <span>End State Description</span>
            </div>
            <div className="text-sm text-gray-500 mb-3">
              Describe what success looks like. How will you know when this project is complete? What is the desired outcome?
            </div>
            <Textarea
              placeholder="Describe the desired end result of this project..."
              value={newTask.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>

          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("purpose")} 
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back: Purpose
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-6 mt-6 border-t">
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
    </Card>
  );
};

export default TaskForm;
