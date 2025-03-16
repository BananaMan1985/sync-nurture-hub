
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FileText, Tag, MessageSquare, CalendarDays, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, TaskStatus } from './types';
import { Card } from '@/components/ui/card';

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
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : new Date()
  );
  const [includeDueDate, setIncludeDueDate] = useState<boolean>(!!task?.dueDate);
  const [currentSection, setCurrentSection] = useState<'details' | 'description' | 'content'>('details');

  const handleChange = (field: keyof Task, value: any) => {
    setNewTask(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // If due date is not included, remove it from the task
    const taskToSave = { ...newTask };
    if (!includeDueDate) {
      delete taskToSave.dueDate;
    }
    onSave(taskToSave);
  };

  const renderNavigation = () => (
    <div className="flex items-center justify-between mb-6 border-b pb-4">
      <div className="flex space-x-1">
        <Button 
          variant={currentSection === 'details' ? 'default' : 'ghost'} 
          size="sm"
          onClick={() => setCurrentSection('details')}
          className={currentSection === 'details' ? 'bg-[#2D3B22] text-white' : ''}
        >
          Basic Info
        </Button>
        <Button 
          variant={currentSection === 'description' ? 'default' : 'ghost'} 
          size="sm"
          onClick={() => setCurrentSection('description')}
          className={currentSection === 'description' ? 'bg-[#2D3B22] text-white' : ''}
        >
          End State
        </Button>
        <Button 
          variant={currentSection === 'content' ? 'default' : 'ghost'} 
          size="sm"
          onClick={() => setCurrentSection('content')}
          className={currentSection === 'content' ? 'bg-[#2D3B22] text-white' : ''}
        >
          Details
        </Button>
      </div>
      
      <div className="flex space-x-1">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentSection === 'details'}
          onClick={() => {
            if (currentSection === 'description') setCurrentSection('details');
            else if (currentSection === 'content') setCurrentSection('description');
          }}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          disabled={currentSection === 'content'}
          onClick={() => {
            if (currentSection === 'details') setCurrentSection('description');
            else if (currentSection === 'description') setCurrentSection('content');
          }}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="p-6 overflow-auto max-h-[75vh]">
      {renderNavigation()}
      
      <div className="space-y-6">
        {currentSection === 'details' && (
          <>
            {/* Project Title */}
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
            
            {/* Status */}
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
            
            {/* Optional Due Date */}
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
          </>
        )}
        
        {currentSection === 'description' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <span>End State Description</span>
            </div>
            <Textarea
              placeholder="Describe the end state of this project..."
              value={newTask.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
        )}
        
        {currentSection === 'content' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
              <FileText className="h-4 w-4 text-gray-500" />
              <span>Project Details</span>
            </div>
            <Textarea
              placeholder="Add detailed information about this project..."
              value={newTask.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
        )}
      </div>
      
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
