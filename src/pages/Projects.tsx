import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AppMenu from '@/components/AppMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ListChecks, Plus, Clock, CalendarDays, Check, Settings, Edit, X, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Import the components with explicit type imports
import TaskColumn from '@/components/projects/TaskColumn';
import TaskForm from '@/components/projects/TaskForm';
import TaskEditDialog from '@/components/projects/TaskEditDialog';
import ColumnCarousel from '@/components/projects/ColumnCarousel';
import { Task, TaskStatus, mockTasks, Comment as TaskComment, Column, defaultColumns } from '@/components/projects/types';

const Projects = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const { toast } = useToast();

  // Sort columns by order property
  const sortedColumns = [...columns].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 0;
    const orderB = b.order !== undefined ? b.order : 0;
    return orderA - orderB;
  });

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
    
    // Also update selectedTask if it's the same task
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

  // Column management functions
  const handleEditColumnTitle = (id: string, newTitle: string) => {
    setColumns(prev => prev.map(col => 
      col.id === id ? { ...col, title: newTitle } : col
    ));
    setEditingColumnId(null);
    
    toast({
      title: "Column updated",
      description: `Column name changed to "${newTitle}".`,
    });
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      toast({
        title: "Error",
        description: "Column name cannot be empty.",
        variant: "destructive"
      });
      return;
    }
    
    const newColumnId = `column-${Date.now()}`;
    const maxOrder = columns.reduce((max, col) => {
      const colOrder = col.order !== undefined ? col.order : 0;
      return colOrder > max ? colOrder : max;
    }, 0);
    
    setColumns(prev => [...prev, { 
      id: newColumnId, 
      title: newColumnTitle,
      order: maxOrder + 1
    }]);
    setNewColumnTitle('');
    setIsColumnDialogOpen(false);
    
    toast({
      title: "Column added",
      description: `New column "${newColumnTitle}" has been added.`,
    });
  };

  const handleDeleteColumn = (id: string) => {
    const hasTasksInColumn = tasks.some(task => task.status === id);
    
    if (hasTasksInColumn) {
      toast({
        title: "Cannot delete column",
        description: "This column contains projects. Move them to another column first.",
        variant: "destructive"
      });
      return;
    }
    
    setColumns(prev => prev.filter(col => col.id !== id));
    
    toast({
      title: "Column deleted",
      description: "The column has been removed.",
    });
  };

  // Column reordering functions
  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    e.dataTransfer.setData('columnId', columnId);
    setDraggedColumnId(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('columnId')) {
      e.preventDefault();
    }
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const sourceColumnId = e.dataTransfer.getData('columnId');
    
    if (!sourceColumnId || !e.dataTransfer.types.includes('columnId')) return;
    
    if (sourceColumnId === targetColumnId || !draggedColumnId) return;
    
    const sourceColumn = columns.find(col => col.id === sourceColumnId);
    const targetColumn = columns.find(col => col.id === targetColumnId);
    
    if (!sourceColumn || !targetColumn) return;
    
    setColumns(prev => {
      const updated = prev.map(col => {
        if (col.id === sourceColumnId) {
          return { ...col, order: targetColumn.order };
        }
        if (col.id === targetColumnId) {
          return { ...col, order: sourceColumn.order };
        }
        return col;
      });
      return updated;
    });
    
    setDraggedColumnId(null);
    
    toast({
      title: "Columns reordered",
      description: "Column order has been updated.",
    });
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnId(null);
  };

  // Function to get the appropriate icon for a column
  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return <ListChecks className="h-5 w-5" />;
      case 'inprogress':
        return <Clock className="h-5 w-5" />;
      case 'done':
        return <Check className="h-5 w-5" />;
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
              onClick={() => setIsColumnDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Column
            </Button>
            <AppMenu />
          </div>
        </div>

        <ColumnCarousel>
          {sortedColumns.map(column => (
            <div 
              key={column.id} 
              className="min-w-[300px] w-[350px] max-w-md flex-shrink-0"
              onDragOver={handleColumnDragOver}
              onDrop={(e) => handleColumnDrop(e, column.id)}
              style={{ opacity: draggedColumnId === column.id ? 0.6 : 1 }}
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
                onDeleteColumn={() => handleDeleteColumn(column.id)}
                isEditing={editingColumnId === column.id}
                setIsEditing={(isEditing) => setEditingColumnId(isEditing ? column.id : null)}
                isDraggable={true}
              />
            </div>
          ))}
        </ColumnCarousel>
        
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
            onDeleteComment={handleDeleteComment}
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
              statuses={columns.map(col => ({ id: col.id, name: col.title }))}
              initialStatus={newTaskStatus}
            />
          </DialogContent>
        </Dialog>

        {/* Add Column Dialog */}
        <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Column</DialogTitle>
              <DialogDescription>
                Create a new column for your projects board.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="columnTitle" className="text-sm font-medium">
                  Column Name
                </label>
                <Input
                  id="columnTitle"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Enter column name"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsColumnDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddColumn}>
                  Add Column
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
};

export default Projects;
