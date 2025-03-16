
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AppMenu from '@/components/AppMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ListChecks, Plus, Clock, CalendarDays, PaperclipIcon, MessageSquare, Trash2, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const priorityColor = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }[task.priority];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if not dragging
    if (!e.currentTarget.classList.contains('dragging')) {
      onClick();
    }
  };

  return (
    <Card 
      className="mb-4 cursor-pointer hover:shadow-md transition-shadow" 
      draggable 
      onDragStart={(e) => handleDragStart(e, task.id)}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
            {task.priority}
          </span>
        </div>
        <CardDescription className="mt-1">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
        
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

  return (
    <div 
      className="bg-secondary/40 rounded-lg p-4 min-w-[300px] w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="font-medium ml-2">{title}</h3>
        <div className="ml-2 bg-secondary rounded-full w-6 h-6 flex items-center justify-center text-xs">
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
      
      <Button variant="ghost" className="w-full mt-3 border border-dashed border-muted-foreground/50">
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
    }
  };

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of this task.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-md font-medium">Task</h3>
            <Input
              value={editedTask.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Task title"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-md font-medium">End State</h3>
            <Input
              placeholder="What does done look like?"
              value={editedTask.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-md font-medium">Details</h3>
            <Textarea
              placeholder="Additional details"
              value={editedTask.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-md font-medium">Status</h3>
            <Select 
              defaultValue={editedTask.status}
              onValueChange={(value) => handleChange('status', value as TaskStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-md font-medium">Attachments</h3>
            <div className="border rounded-md p-2">
              <Button variant="outline" className="w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                Upload documents, images, or other files
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-md font-medium">Due Date (Optional)</h3>
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
                  {selectedDate ? format(selectedDate, "PP") : "mm/dd/yyyy"}
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
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="destructive" onClick={() => onDelete(editedTask.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Task
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-[#2D3B22] hover:bg-[#3c4f2d] text-white">
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
          <Button className="bg-[#2D3B22] hover:bg-[#3c4f2d] text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
          <TaskColumn
            title="To Do"
            icon={<ListChecks className="h-5 w-5 text-blue-600" />}
            tasks={todoTasks}
            status="todo"
            isLoading={isLoading}
            onDrop={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="In Progress"
            icon={<Clock className="h-5 w-5 text-yellow-600" />}
            tasks={inProgressTasks}
            status="inprogress"
            isLoading={isLoading}
            onDrop={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="Completed"
            icon={<ListChecks className="h-5 w-5 text-green-600" />}
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
