
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AppMenu from '@/components/AppMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ListChecks, Plus, Clock, CalendarDays, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Import the components with explicit type imports
import TaskColumn from '@/components/projects/TaskColumn';
import TaskForm from '@/components/projects/TaskForm';
import TaskEditDialog from '@/components/projects/TaskEditDialog';
import { Task, TaskStatus, mockTasks, Comment as TaskComment } from '@/components/projects/types';

const Projects = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus } 
        : task
    ));
    setDraggedTaskId(null);
    
    toast({
      title: "Project moved",
      description: `Project moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'inprogress' ? 'In Progress' : 'Done'}.`,
    });
  };

  const handleReorderTasks = (draggedTaskId: string, targetIndex: number, status: TaskStatus) => {
    const statusTasks = [...getTasksByStatus(status)];
    const draggedTaskIndex = statusTasks.findIndex(task => task.id === draggedTaskId);
    
    if (draggedTaskIndex === -1) return;
    
    // Reorder the tasks
    const draggedTask = statusTasks[draggedTaskIndex];
    statusTasks.splice(draggedTaskIndex, 1);
    statusTasks.splice(targetIndex, 0, draggedTask);
    
    // Update the orders
    const updatedTasks = statusTasks.map((task, index) => ({
      ...task,
      order: index
    }));
    
    // Merge with tasks of other statuses
    setTasks(prev => {
      const otherTasks = prev.filter(task => task.status !== status);
      return [...otherTasks, ...updatedTasks];
    });
    
    setDraggedTaskId(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id 
        ? { ...updatedTask } 
        : task
    ));
    setIsTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleAddTask = (status: TaskStatus) => {
    setNewTaskStatus(status);
    setIsNewTaskDialogOpen(true);
  };

  const handleCreateTask = (newTask: Partial<Task>) => {
    const taskToAdd: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title || 'Untitled Project',
      description: newTask.description || '',
      status: newTask.status || newTaskStatus,
      dueDate: newTask.dueDate || format(new Date(), 'yyyy-MM-dd'),
      priority: newTask.priority || 'medium',
      comments: [],
      order: getTasksByStatus(newTask.status || newTaskStatus).length
    };
    
    setTasks(prev => [...prev, taskToAdd]);
    setIsNewTaskDialogOpen(false);
    
    toast({
      title: "Project created",
      description: "Your new project has been created.",
    });
  };

  const handleAddComment = (taskId: string, comment: Omit<TaskComment, 'id'>) => {
    const newComment: TaskComment = {
      id: `comment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...comment
    };
    
    console.log("Adding comment:", newComment, "to task:", taskId);
    
    setTasks(prev => {
      return prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            comments: [...(task.comments || []), newComment]
          };
        }
        return task;
      });
    });
    
    // Update the selectedTask if it's the one we're adding a comment to
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...(prev.comments || []), newComment]
        };
      });
    }
    
    toast({
      title: "Comment added",
      description: "Your comment has been added to the project.",
    });
  };

  const handleEditComment = (taskId: string, commentId: string, updatedComment: TaskComment) => {
    setTasks(prev => {
      return prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            comments: task.comments?.map(comment => 
              comment.id === commentId ? updatedComment : comment
            )
          };
        }
        return task;
      });
    });
    
    // Also update selectedTask if it's the same task
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments?.map(comment => 
            comment.id === commentId ? updatedComment : comment
          )
        };
      });
    }
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    // Prevent default to allow drop
    e.preventDefault();
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 py-6"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center">
            <ListChecks className="mr-2 h-6 w-6" />
            Projects Board
          </h1>
          <AppMenu />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn
            title="To Do"
            icon={<ListChecks className="h-5 w-5" />}
            tasks={getTasksByStatus('todo')}
            status="todo"
            isLoading={isLoading}
            onDrop={handleDrop}
            onTaskClick={handleTaskClick}
            onReorderTasks={handleReorderTasks}
            draggedTaskId={draggedTaskId}
            onDragOver={handleDragOver}
            onAddTask={handleAddTask}
          />
          
          <TaskColumn
            title="In Progress"
            icon={<Clock className="h-5 w-5" />}
            tasks={getTasksByStatus('inprogress')}
            status="inprogress"
            isLoading={isLoading}
            onDrop={handleDrop}
            onTaskClick={handleTaskClick}
            onReorderTasks={handleReorderTasks}
            draggedTaskId={draggedTaskId}
            onDragOver={handleDragOver}
            onAddTask={handleAddTask}
          />
          
          <TaskColumn
            title="Done"
            icon={<Check className="h-5 w-5" />}
            tasks={getTasksByStatus('done')}
            status="done"
            isLoading={isLoading}
            onDrop={handleDrop}
            onTaskClick={handleTaskClick}
            onReorderTasks={handleReorderTasks}
            draggedTaskId={draggedTaskId}
            onDragOver={handleDragOver}
            onAddTask={handleAddTask}
          />
        </div>
        
        {/* Project Edit Dialog */}
        {selectedTask && (
          <TaskEditDialog
            isOpen={isTaskDialogOpen}
            task={selectedTask}
            onClose={() => {
              setIsTaskDialogOpen(false);
              setSelectedTask(null);
            }}
            onSave={handleSaveTask}
            onDelete={handleDeleteTask}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
          />
        )}
        
        {/* New Project Dialog */}
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the details for your new project.
              </DialogDescription>
            </DialogHeader>
            
            <TaskForm 
              onSave={handleCreateTask} 
              onCancel={() => setIsNewTaskDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
};

export default Projects;
