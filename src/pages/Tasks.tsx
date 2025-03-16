
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AppMenu from '@/components/AppMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ListChecks, Plus, Clock, CalendarDays, PaperclipIcon, MessageSquare, Trash2, Upload, Check, X, Tag, FileText } from 'lucide-react';
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

type TaskStatus = 'todo' | 'inprogress' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: number;
  comments?: number;
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
    comments: 3,
  },
  {
    id: '2',
    title: 'Client follow-up',
    description: 'Send follow-up emails to clients from Monday\'s meeting',
    status: 'inprogress',
    priority: 'medium',
    dueDate: '2023-11-10',
    comments: 1,
  },
  {
    id: '3',
    title: 'Update website content',
    description: 'Update the team page with new staff photos',
    status: 'todo',
    priority: 'low',
    dueDate: '2023-11-20',
  },
  {
    id: '4',
    title: 'Book travel arrangements',
    description: 'Finalize travel arrangements for the conference in December',
    status: 'inprogress',
    priority: 'medium',
    dueDate: '2023-11-12',
  },
  {
    id: '5',
    title: 'Review department budget',
    description: 'Review and approve department budget for next quarter',
    status: 'done',
    priority: 'high',
    dueDate: '2023-11-05',
  },
];

const TaskCard: React.FC<{ task: Task; onClick: () => void }> = ({ task, onClick }) => {
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if not dragging
    if (!e.currentTarget.classList.contains('dragging')) {
      onClick();
    }
  };

  // Status colors for visual indicators
  const statusColors = {
    todo: 'bg-blue-100',
    inprogress: 'bg-amber-100',
    done: 'bg-emerald-100'
  };

  return (
    <Card 
      className={`mb-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 border-l-4 ${
        task.status === 'todo' ? 'border-l-blue-400' : 
        task.status === 'inprogress' ? 'border-l-amber-400' : 'border-l-emerald-400'
      } ${statusColors[task.status]} bg-opacity-30`}
      draggable 
      onDragStart={(e) => handleDragStart(e, task.id)}
      onClick={handleClick}
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
}> = ({
  title,
  icon,
  tasks,
  status,
  isLoading,
  onDrop,
  onTaskClick,
}) => {
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onDrop(taskId, status);
  };

  // Column styling based on status
  const columnStyle = {
    todo: 'from-blue-50 to-blue-100 border-blue-200',
    inprogress: 'from-amber-50 to-amber-100 border-amber-200',
    done: 'from-emerald-50 to-emerald-100 border-emerald-200'
  };

  // Icon colors based on status
  const iconColor = {
    todo: 'text-blue-600',
    inprogress: 'text-amber-600',
    done: 'text-emerald-600'
  };

  return (
    <div 
      className={`rounded-xl p-4 min-w-[300px] w-full bg-gradient-to-b ${columnStyle[status]} border shadow-sm`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center mb-5">
        <div className={`p-2 rounded-full ${status === 'todo' ? 'bg-blue-100' : status === 'inprogress' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
          <div className={`${iconColor[status]}`}>
            {icon}
          </div>
        </div>
        <h3 className="font-medium ml-2 text-lg">{title}</h3>
        <div className={`ml-2 ${status === 'todo' ? 'bg-blue-200' : status === 'inprogress' ? 'bg-amber-200' : 'bg-emerald-200'} rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium`}>
          {tasks.length}
        </div>
      </div>
      
      {isLoading ? (
        <>
          <Skeleton className="h-[120px] mb-4" />
          <Skeleton className="h-[120px] mb-4" />
        </>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      )}
      
      <Button 
        variant="outline" 
        className={`w-full mt-4 border border-dashed ${
          status === 'todo' ? 'border-blue-300 hover:bg-blue-50' : 
          status === 'inprogress' ? 'border-amber-300 hover:bg-amber-50' : 
          'border-emerald-300 hover:bg-emerald-50'
        }`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    </div>
  );
};

const TaskEditDialog: React.FC<{
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
}> = ({ isOpen, task, onClose, onSave, onDelete }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
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

  // Status styling
  const statusStyles = {
    todo: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700'
    },
    inprogress: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700'
    },
    done: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700'
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden rounded-xl bg-white">
        <div className={`sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b ${statusStyles[editedTask.status].border}`}>
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex justify-between items-center mb-1">
              <DialogTitle className="text-xl">Edit Task</DialogTitle>
              <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${statusStyles[editedTask.status].bg} ${statusStyles[editedTask.status].text}`}>
                {editedTask.status === 'todo' ? 'To Do' : 
                 editedTask.status === 'inprogress' ? 'In Progress' : 'Completed'}
              </span>
            </div>
            <DialogDescription className="text-muted-foreground">
              Update the details of this task to keep your project organized.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 pt-2 overflow-y-auto max-h-[70vh] space-y-5">
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

const Tasks: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'inprogress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
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
          <Button className="bg-gradient-to-r from-[#2D3B22] to-[#3c4f2d] hover:from-[#3c4f2d] hover:to-[#4a613a] text-white">
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
          />
          <TaskColumn
            title="In Progress"
            icon={<Clock className="h-5 w-5" />}
            tasks={inProgressTasks}
            status="inprogress"
            isLoading={isLoading}
            onDrop={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="Completed"
            icon={<Check className="h-5 w-5" />}
            tasks={doneTasks}
            status="done"
            isLoading={isLoading}
            onDrop={handleTaskMove}
            onTaskClick={handleTaskClick}
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
        />

        <div className="text-xs text-center text-muted-foreground mt-12 pb-6">
          Built by Sagan
        </div>
      </motion.div>
    </Layout>
  );
};

export default Tasks;
