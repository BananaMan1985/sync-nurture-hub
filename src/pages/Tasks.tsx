import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AppMenu from '@/components/AppMenu';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ListChecks, Plus, Clock, CalendarDays, PaperclipIcon, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const priorityColor = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }[task.priority];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  return (
    <Card 
      className="mb-4 cursor-move hover:shadow-md transition-shadow" 
      draggable 
      onDragStart={(e) => handleDragStart(e, task.id)}
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
      <CardFooter className="flex justify-between pt-0">
        <Button variant="ghost" size="sm">Edit</Button>
        <Button variant="outline" size="sm">Open</Button>
      </CardFooter>
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
}> = ({
  title,
  icon,
  tasks,
  status,
  isLoading,
  onDrop,
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
            <TaskCard key={task.id} task={task} />
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

const Tasks: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  
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
          />
          <TaskColumn
            title="In Progress"
            icon={<Clock className="h-5 w-5 text-yellow-600" />}
            tasks={inProgressTasks}
            status="inprogress"
            isLoading={isLoading}
            onDrop={handleTaskMove}
          />
          <TaskColumn
            title="Completed"
            icon={<ListChecks className="h-5 w-5 text-green-600" />}
            tasks={doneTasks}
            status="done"
            isLoading={isLoading}
            onDrop={handleTaskMove}
          />
        </div>

        <div className="text-xs text-center text-muted-foreground mt-12 pb-6">
          Built by Sagan
        </div>
      </motion.div>
    </Layout>
  );
};

export default Tasks;
