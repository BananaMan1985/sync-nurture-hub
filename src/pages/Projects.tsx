import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ListChecks, Plus, Clock, ClipboardList, Timer, FileText, Archive, Inbox, Kanban, Grid } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import TaskColumn from '@/components/projects/TaskColumn';
import TaskForm from '@/components/projects/TaskForm';
import TaskEditDialog from '@/components/projects/TaskEditDialog';
import ColumnCarousel from '@/components/projects/ColumnCarousel';
import { Task, TaskStatus, mockTasks, Comment as TaskComment, Column, defaultColumns } from '@/components/projects/types';
import ProjectsGrid from '@/components/projects/ProjectsGrid';

const Projects = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [columns] = useState<Column[]>(defaultColumns);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('inbox');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('kanban');
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
    
    const columnTitle = columns.find(col => col.id === newStatus)?.title || newStatus;
    
    toast({
      title: "Project moved",
      description: `Project moved to ${columnTitle}.`,
    });
  };

  const handleReorderTasks = (draggedTaskId: string, targetIndex: number, status: TaskStatus) => {
    const statusTasks = [...getTasksByStatus(status)];
    const draggedTaskIndex = statusTasks.findIndex(task => task.id === draggedTaskId);
    
    if (draggedTaskIndex === -1) return;
    
    const draggedTask = statusTasks[draggedTaskIndex];
    statusTasks.splice(draggedTaskIndex, 1);
    statusTasks.splice(targetIndex, 0, draggedTask);
    
    const updatedTasks = statusTasks.map((task, index) => ({
      ...task,
      order: index
    }));
    
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
    console.log("Saving updated task in main component:", updatedTask);
    
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    
    if (selectedTask && selectedTask.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
    
    setIsTaskDialogOpen(false);
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
      comments: [],
      content: newTask.content || '',
      purpose: newTask.purpose || '',
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

  const handleDeleteComment = (taskId: string, commentId: string) => {
    setTasks(prev => {
      return prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            comments: task.comments?.filter(comment => comment.id !== commentId)
          };
        }
        return task;
      });
    });
    
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments?.filter(comment => comment.id !== commentId)
        };
      });
    }
    
    toast({
      title: "Comment deleted",
      description: "Your comment has been removed from the project.",
    });
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
  };

  const handleEditColumnTitle = (id: string, newTitle: string) => {
    toast({
      title: "Column names are fixed",
      description: "Column names cannot be changed in this version.",
    });
  };

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'inbox':
        return <Inbox className="h-5 w-5" />;
      case 'confirmedreceived':
        return <ClipboardList className="h-5 w-5" />;
      case 'inprogress':
        return <Clock className="h-5 w-5" />;
      case 'waiting':
        return <Timer className="h-5 w-5" />;
      case 'review':
        return <FileText className="h-5 w-5" />;
      case 'archive':
        return <Archive className="h-5 w-5" />;
      default:
        return <ListChecks className="h-5 w-5" />;
    }
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
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsNewTaskDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add New Project
            </Button>
          </div>
        </div>

        <Tabs defaultValue="kanban" value={activeView} onValueChange={setActiveView} className="w-full mb-6">
          <TabsList className="grid w-[400px] grid-cols-2 mx-auto">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              Kanban Board
            </TabsTrigger>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Grid View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban" className="mt-4">
            <ColumnCarousel>
              {columns.map(column => (
                <div 
                  key={column.id} 
                  className="min-w-[300px] w-[350px] max-w-md flex-shrink-0"
                >
                  <TaskColumn
                    title={column.title}
                    icon={getColumnIcon(column.id)}
                    tasks={getTasksByStatus(column.id)}
                    status={column.id}
                    isLoading={isLoading}
                    onDrop={handleDrop}
                    onTaskClick={handleTaskClick}
                    onReorderTasks={handleReorderTasks}
                    draggedTaskId={draggedTaskId}
                    onDragOver={handleDragOver}
                    onAddTask={handleAddTask}
                    onEditColumnTitle={(newTitle) => handleEditColumnTitle(column.id, newTitle)}
                    isEditing={editingColumnId === column.id}
                    setIsEditing={(isEditing) => setEditingColumnId(isEditing ? column.id : null)}
                  />
                </div>
              ))}
            </ColumnCarousel>
          </TabsContent>
          
          <TabsContent value="grid" className="mt-4">
            <ProjectsGrid 
              tasks={tasks}
              columns={columns}
              onTaskClick={handleTaskClick}
              onAddTask={() => setIsNewTaskDialogOpen(true)}
            />
          </TabsContent>
        </Tabs>
        
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
            onDeleteComment={handleDeleteComment}
          />
        )}
        
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
              statuses={columns.map(col => ({ id: col.id, name: col.title }))}
              initialStatus={newTaskStatus}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
};

export default Projects;
