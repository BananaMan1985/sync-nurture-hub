
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AppMenu from '@/components/AppMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ListChecks, Plus, Clock, CalendarDays, PaperclipIcon, MessageSquare, Trash2, Upload, Check, X, Tag, FileText, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

type TaskStatus = 'todo' | 'inprogress' | 'done';

interface Comment {
  id: string;
  text: string;
  authorName: string;
  timestamp: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: number;
  comments?: Comment[];
  order?: number; // Added order property for sorting within columns
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Prepare quarterly report',
    description: 'Compile data from Q3 for executive meeting',
    status: 'todo',
    dueDate: '2023-11-15',
    priority: 'high',
    attachments: 2,
    comments: [
      {
        id: '1-1',
        text: 'I\'ve gathered most of the data needed for this report.',
        authorName: 'Alex Murphy',
        timestamp: '2023-11-08T14:32:00Z'
      },
      {
        id: '1-2',
        text: 'Could you include the Q2 comparison data as well?',
        authorName: 'Jamie Smith',
        timestamp: '2023-11-09T09:15:00Z'
      }
    ],
  },
  {
    id: '2',
    title: 'Client follow-up',
    description: 'Send follow-up emails to clients from Monday\'s meeting',
    status: 'inprogress',
    priority: 'medium',
    dueDate: '2023-11-10',
    comments: [
      {
        id: '2-1',
        text: 'I\'ve drafted the first few emails, will finish tomorrow.',
        authorName: 'Sagan',
        timestamp: '2023-11-07T16:45:00Z'
      }
    ],
  },
  {
    id: '3',
    title: 'Update website content',
    description: 'Update the team page with new staff photos',
    status: 'todo',
    priority: 'low',
    dueDate: '2023-11-20',
    comments: [],
  },
  {
    id: '4',
    title: 'Book travel arrangements',
    description: 'Finalize travel arrangements for the conference in December',
    status: 'inprogress',
    priority: 'medium',
    dueDate: '2023-11-12',
    comments: [],
  },
  {
    id: '5',
    title: 'Review department budget',
    description: 'Review and approve department budget for next quarter',
    status: 'done',
    priority: 'high',
    dueDate: '2023-11-05',
    comments: [],
  },
];

const TaskCard: React.FC<{ 
  task: Task; 
  onClick: () => void;
  index: number;
  onDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onDragEnter: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
}> = ({ 
  task, 
  onClick, 
  index,
  onDragStart,
  onDragEnter,
  isDragging
}) => {

  const statusColors = {
    todo: 'bg-slate-50 border-l-slate-400',
    inprogress: 'bg-slate-50 border-l-amber-400',
    done: 'bg-slate-50 border-l-teal-400'
  };

  return (
    <Card 
      className={`mb-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 border-l-4 ${
        statusColors[task.status]
      } ${isDragging ? 'opacity-50' : ''}`}
      draggable 
      onDragStart={(e) => onDragStart(e, task, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragOver={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
        <CardDescription className="mt-1 line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
        
        {(task.attachments || task.comments) && (
          <div className="flex items-center mt-2 space-x-4">
            {task.attachments && (
              <div className="flex items-center text-xs text-muted-foreground">
                <PaperclipIcon className="mr-1 h-3 w-3" />
                <span>{task.attachments}</span>
              </div>
            )}
            {task.comments && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MessageSquare className="mr-1 h-3 w-3" />
                <span>{task.comments}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TaskColumn: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  tasks: Task[]; 
  status: TaskStatus; 
  isLoading: boolean;
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onReorderTasks: (draggedTaskId: string, targetIndex: number, status: TaskStatus) => void;
  draggedTaskId: string | null;
  onDragOver: (e: React.DragEvent, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
}> = ({
  title,
  icon,
  tasks,
  status,
  isLoading,
  onDrop,
  onTaskClick,
  onReorderTasks,
  draggedTaskId,
  onDragOver,
  onAddTask,
}) => {
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    onDragOver(e, status);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceStatus = e.dataTransfer.getData('sourceStatus') as TaskStatus;
    
    if (sourceStatus === status && draggedIndex !== null) {
      // If we're dragging within the same column
      onReorderTasks(taskId, dropPreviewIndex !== null ? dropPreviewIndex : tasks.length, status);
    } else {
      // If we're dragging between columns
      onDrop(taskId, status);
    }
    
    setDraggedIndex(null);
    setDropPreviewIndex(null);
  };

  const handleDragStart = (e: React.DragEvent, task: Task, index: number) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('sourceStatus', task.status);
    e.dataTransfer.setData('sourceIndex', index.toString());
    setDraggedIndex(index);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropPreviewIndex(index);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // Check if we're leaving the column area
    const relatedTarget = e.relatedTarget as Element;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDropPreviewIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropPreviewIndex(null);
  };

  // Add indicator if the column is empty and something is being dragged
  const shouldShowEmptyColumnIndicator = tasks.length === 0 && draggedTaskId !== null;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return 0;
  });

  return (
    <div 
      className="rounded-xl p-4 min-w-[300px] w-full bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 shadow-sm relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-center mb-5">
        <div className={`p-2 rounded-full bg-slate-100`}>
          <div className="text-slate-600">
            {icon}
          </div>
        </div>
        <h3 className="font-medium ml-2 text-lg">{title}</h3>
        <div className="ml-2 bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
          {tasks.length}
        </div>
      </div>
      
      {isLoading ? (
        <>
          <Skeleton className="h-[120px] mb-4" />
          <Skeleton className="h-[120px] mb-4" />
        </>
      ) : (
        <ScrollArea className="h-[calc(100vh-240px)]">
          <div className="space-y-3 pr-3">
            {shouldShowEmptyColumnIndicator && (
              <div 
                className="h-2 w-full bg-slate-200 rounded-full mb-2 transform transition-all duration-200 animate-pulse"
              />
            )}
            
            {sortedTasks.map((task, index) => (
              <React.Fragment key={task.id}>
                {dropPreviewIndex === index && (
                  <div 
                    className="h-1 w-full bg-slate-300 rounded-full mb-2 transform transition-all duration-200 animate-pulse"
                  />
                )}
                <TaskCard 
                  task={task} 
                  index={index}
                  onClick={() => onTaskClick(task)}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  isDragging={draggedTaskId === task.id}
                />
                {index === sortedTasks.length - 1 && dropPreviewIndex === sortedTasks.length && (
                  <div 
                    className="h-1 w-full bg-slate-300 rounded-full mt-2 transform transition-all duration-200 animate-pulse"
                  />
                )}
              </React.Fragment>
            ))}
            
            {tasks.length > 0 && dropPreviewIndex === tasks.length && (
              <div 
                className="h-1 w-full bg-slate-300 rounded-full mt-2 transform transition-all duration-200 animate-pulse"
              />
            )}
          </div>
        </ScrollArea>
      )}
      
      <Button 
        variant="outline" 
        className="w-full mt-4 border border-dashed border-slate-300 hover:bg-slate-50"
        onClick={() => onAddTask(status)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    </div>
  );
};

interface CommentFormProps {
  taskId: string;
  onAddComment: (taskId: string, comment: Omit<Comment, 'id'>) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ taskId, onAddComment }) => {
  const form = useForm({
    defaultValues: {
      comment: '',
    },
  });
  
  const handleSubmit = form.handleSubmit((data) => {
    onAddComment(taskId, {
      text: data.comment,
      authorName: 'Sagan', // In a real app, this would be the logged-in user's name
      timestamp: new Date().toISOString()
    });
    form.reset();
  });
  
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea 
                  placeholder="Add a comment..." 
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          size="sm" 
          className="mb-1"
          disabled={!form.getValues().comment.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.authorName}`} />
            <AvatarFallback className="text-xs">
              {comment.authorName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{comment.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.timestamp).toLocaleString()}
              </p>
            </div>
            <p className="mt-1 text-sm">{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

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
          <span>Task Title</span>
        </div>
        <Input
          value={newTask.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Task title"
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
          {task ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </div>
  );
};

const TaskEditDialog: React.FC<{
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onAddComment: (taskId: string, comment: Omit<Comment, 'id'>) => void;
}> = ({ isOpen, task, onClose, onSave, onDelete, onAddComment }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const { toast } = useToast();

  React.useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setSelectedDate(task.dueDate ? new Date(task.dueDate) : undefined);
    }
  }, [task]);

  if (!editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated.",
      });
    }
  };

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const statusStyles = {
    todo: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700'
    },
    inprogress: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700'
    },
    done: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-700'
    }
  };

  const comments = editedTask.comments || [];

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden rounded-xl bg-white">
        <div className={`sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b ${statusStyles[editedTask.status].border}`}>
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex justify-between items-center mb-1">
              <DialogTitle className="text-xl">Task Details</DialogTitle>
              <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${statusStyles[editedTask.status].bg} ${statusStyles[editedTask.status].text}`}>
                {editedTask.status === 'todo' ? 'To Do' : 
                 editedTask.status === 'inprogress' ? 'In Progress' : 'Completed'}
              </span>
            </div>
            <DialogDescription className="text-muted-foreground">
              {editedTask.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex border-b px-6">
            <button
              className={`py-2 px-4 font-medium text-sm relative ${
                activeTab === 'details' 
                  ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm relative flex items-center ${
                activeTab === 'comments' 
                  ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Comments
              {comments.length > 0 && (
                <span className="ml-2 bg-slate-200 text-xs rounded-full px-2 py-0.5">
                  {comments.length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        <div className="p-6 pt-4 overflow-y-auto max-h-[70vh]">
          {activeTab === 'details' ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Task Title</span>
                </div>
                <Input
                  value={editedTask.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Task title"
                  className="text-lg font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span>Status</span>
                </div>
                <Select 
                  defaultValue={editedTask.status}
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
                  value={editedTask.description}
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
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                  <PaperclipIcon className="h-4 w-4 text-gray-500" />
                  <span>Attachments</span>
                </div>
                <div className="border rounded-lg p-6 bg-gray-50 text-center">
                  <div className="mb-2">
                    <Button variant="outline" className="w-auto">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop files or click to browse
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <ScrollArea className="pr-4 max-h-[400px]">
                <CommentList comments={comments} />
              </ScrollArea>
              
              <div className="pt-4 border-t">
                <CommentForm 
                  taskId={editedTask.id} 
                  onAddComment={onAddComment} 
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="bg-gray-50 px-6 py-4 gap-2 border-t flex items-center justify-between">
          <Button variant="destructive" size="sm" onClick={() => onDelete(editedTask.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" className="bg-[#2D3B22] hover:bg-[#3c4f2d] text-white">
              <Check className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddTaskDialog: React.FC<{
  isOpen: boolean;
  initialStatus: TaskStatus;
  onClose: () => void;
  onAddTask: (task: Partial<Task>) => void;
}> = ({ isOpen, initialStatus, onClose, onAddTask }) => {
  const handleSave = (taskData: Partial<Task>) => {
    onAddTask({ ...taskData, status: initialStatus });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-6 rounded-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task in the {initialStatus === 'todo' ? 'To Do' : 
              initialStatus === 'inprogress' ? 'In Progress' : 'Completed'} column.
          </DialogDescription>
        </DialogHeader>
        
        <TaskForm 
          task={{ 
            id: '', 
            title: '', 
            description: '', 
            status: initialStatus, 
            dueDate: format(new Date(), 'yyyy-MM-dd'),
            priority: 'medium', 
            comments: [] 
          }}
          onSave={handleSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

const Tasks: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(mockTasks.map((task, index) => ({
    ...task,
    order: index
  })));
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addDialogStatus, setAddDialogStatus] = useState<TaskStatus>('todo');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const { toast } = useToast();
  
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'inprogress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => 
      prev.map(task => {
        if (task.id === taskId) {
          const columnTasks = prev.filter(t => t.status === newStatus);
          const highestOrder = Math.max(...columnTasks.map(t => t.order || 0), 0);
          return { ...task, status: newStatus, order: highestOrder + 1 };
        }
        return task;
      })
    );
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleReorderTasks = (draggedTaskId: string, targetIndex: number, status: TaskStatus) => {
    console.log(`Reordering task ${draggedTaskId} to index ${targetIndex} in ${status}`);
    
    setTasks(prev => {
      // Find the task being dragged
      const draggedTask = prev.find(t => t.id === draggedTaskId);
      if (!draggedTask) return prev;
      
      // Get the current column tasks in order
      const columnTasks = [...prev.filter(t => t.status === status)]
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Get tasks not in the current column
      const otherTasks = prev.filter(t => t.status !== status);
      
      // Remove the dragged task if it's already in this column
      const tasksWithoutDragged = columnTasks.filter(t => t.id !== draggedTaskId);
      
      // Create a new array with the task inserted at the target position
      const reorderedTasks = [...tasksWithoutDragged];
      
      // Calculate the correct insertion index
      const insertIndex = Math.min(targetIndex, tasksWithoutDragged.length);
      
      // Update task status if coming from another column
      const updatedDraggedTask = {
        ...draggedTask,
        status: status
      };
      
      // Insert the task at the target position
      reorderedTasks.splice(insertIndex, 0, updatedDraggedTask);
      
      // Reassign order numbers
      const tasksWithNewOrders = reorderedTasks.map((task, idx) => ({
        ...task,
        order: idx
      }));
      
      // Combine with tasks from other columns
      return [...otherTasks, ...tasksWithNewOrders];
    });
    
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleTaskSave = (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    setIsEditDialogOpen(false);
    setSelectedTask(null);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setIsEditDialogOpen(false);
    setSelectedTask(null);
    toast({
      title: "Task deleted",
      description: "The task has been permanently removed."
    });
  };

  const handleAddTask = (newTaskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskData.title || 'Untitled Task',
      description: newTaskData.description || '',
      status: newTaskData.status || 'todo',
      dueDate: newTaskData.dueDate || format(new Date(), 'yyyy-MM-dd'),
      priority: newTaskData.priority || 'medium',
      comments: [],
      order: tasks.filter(t => t.status === newTaskData.status).length
    };
    
    setTasks(prev => [...prev, newTask]);
    toast({
      title: "Task created",
      description: "New task has been successfully added."
    });
  };

  const handleColumnAddTask = (status: TaskStatus) => {
    setAddDialogStatus(status);
    setIsAddDialogOpen(true);
  };

  const handleAddComment = (taskId: string, comment: Omit<Comment, 'id'>) => {
    setTasks(prev => 
      prev.map(task => {
        if (task.id === taskId) {
          const newComment = {
            id: `comment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            ...comment
          };
          
          const updatedComments = [...(task.comments || []), newComment];
          return { ...task, comments: updatedComments };
        }
        return task;
      })
    );
    
    toast({
      title: "Comment added",
      description: "Your comment has been posted."
    });
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(columnStatus);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 md:px-6"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Project Tracker</h1>
        </div>

        <AppMenu />

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Current Tasks</h2>
            <p className="text-muted-foreground">Track and manage your projects</p>
          </div>
          <Button 
            className="bg-slate-800 hover:bg-slate-700 text-white"
            onClick={() => {
              setAddDialogStatus('todo');
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
          <TaskColumn
            title="To Do"
            icon={<ListChecks className="h-5 w-5" />}
            tasks={todoTasks}
            status="todo"
            isLoading={isLoading}
            onDrop={handleTaskMove}
            onTaskClick={handleTaskClick}
            onReorderTasks={handleReorderTasks}
            draggedTaskId={draggedTaskId}
            onDragOver={handleDragOver}
            onAddTask={handleColumnAddTask}
          />
          <TaskColumn
            title="In Progress"
            icon={<Clock className="h-5 w-5" />}
            tasks={inProgressTasks}
            status="inprogress"
            isLoading={isLoading}
            onDrop={handleTaskMove}
            onTaskClick={handleTaskClick}
            onReorderTasks={handleReorderTasks}
            draggedTaskId={draggedTaskId}
            onDragOver={handleDragOver}
            onAddTask={handleColumnAddTask}
          />
          <TaskColumn
            title="Completed"
            icon={<Check className="h-5 w-5" />}
            tasks={doneTasks}
            status="done"
            isLoading={isLoading}
            onDrop={handleTaskMove}
            onTaskClick={handleTaskClick}
            onReorderTasks={handleReorderTasks}
            draggedTaskId={draggedTaskId}
            onDragOver={handleDragOver}
            onAddTask={handleColumnAddTask}
          />
        </div>

        <TaskEditDialog
          isOpen={isEditDialogOpen}
          task={selectedTask}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          onAddComment={handleAddComment}
        />

        <AddTaskDialog
          isOpen={isAddDialogOpen}
          initialStatus={addDialogStatus}
          onClose={() => setIsAddDialogOpen(false)}
          onAddTask={handleAddTask}
        />

        <div className="text-xs text-center text-muted-foreground mt-12 pb-6">
          Built by Sagan
        </div>
      </motion.div>
    </Layout>
  );
};

export default Tasks;
