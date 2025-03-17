
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash, Check, X } from 'lucide-react';
import TaskCard from './TaskCard';
import CollapsibleTaskCard from './CollapsibleTaskCard';
import { Task, TaskStatus } from './types';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TaskColumnProps {
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
  onEditColumnTitle?: (newTitle: string) => void;
  onDeleteColumn?: () => void;
  isEditing?: boolean;
  setIsEditing?: (isEditing: boolean) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
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
  onEditColumnTitle,
  onDeleteColumn,
  isEditing = false,
  setIsEditing,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    onDragOver(e, status);
    setIsDraggedOver(true);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(false);
    
    // Try to get the taskId and other data
    const taskId = e.dataTransfer.getData('taskId');
    
    // Only proceed if we have a taskId
    if (!taskId) return;
    
    const sourceStatus = e.dataTransfer.getData('sourceStatus') as TaskStatus;
    
    if (sourceStatus === status && dropPreviewIndex !== null) {
      // If we're dragging within the same column, reorder tasks
      onReorderTasks(taskId, dropPreviewIndex, status);
    } else {
      // If we're dragging between columns, change status
      onDrop(taskId, status);
    }
    
    setDraggedIndex(null);
    setDropPreviewIndex(null);
  };

  const handleDragStart = (e: React.DragEvent, task: Task, index: number) => {
    e.stopPropagation();
    setDraggedIndex(index);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set the drop preview if we have a task being dragged
    if (e.dataTransfer.types.includes('taskId')) {
      setDropPreviewIndex(index);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // Check if we're leaving the column area
    const relatedTarget = e.relatedTarget as Element;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDropPreviewIndex(null);
      setIsDraggedOver(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropPreviewIndex(null);
    setIsDraggedOver(false);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && onEditColumnTitle) {
      onEditColumnTitle(editedTitle);
    }
    if (setIsEditing) {
      setIsEditing(false);
    }
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
      className={`rounded-lg h-full flex flex-col overflow-hidden shadow-sm bg-white border border-slate-200 transition-all duration-200 hover:shadow-md ${isDraggedOver ? 'border-2 border-primary ring-4 ring-primary/20' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
    >
      <div className={`flex items-center p-4 border-b border-slate-100 ${isDraggedOver ? 'bg-primary/10' : ''}`}>
        <div className="p-1.5 rounded-full bg-slate-100">
          <div className="text-slate-600">
            {icon}
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex items-center ml-2 gap-1 flex-1">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleSaveTitle}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                setEditedTitle(title);
                if (setIsEditing) setIsEditing(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <h3 className="font-medium ml-2 text-base flex-1 truncate">{title}</h3>
            <div className="ml-2 bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium text-slate-600">
              {tasks.length}
            </div>

            {onEditColumnTitle && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 ml-1">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="flex flex-col gap-1">
                    {onEditColumnTitle && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start"
                        onClick={() => setIsEditing && setIsEditing(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit name
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </>
        )}
      </div>
      
      {isLoading ? (
        <div className="p-4 space-y-3">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
      ) : (
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3 pr-1">
            {shouldShowEmptyColumnIndicator && (
              <div 
                className="h-2 w-full bg-slate-200 rounded-full mb-2 transform transition-all duration-200 animate-pulse"
              />
            )}
            
            {sortedTasks.map((task, index) => (
              <React.Fragment key={task.id}>
                {dropPreviewIndex === index && (
                  <div 
                    className="h-1 w-full bg-primary rounded-full mb-2 transform transition-all duration-200 animate-pulse"
                  />
                )}
                
                {status === 'archive' ? (
                  <CollapsibleTaskCard
                    task={task}
                    index={index}
                    onClick={() => onTaskClick(task)}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    isDragging={draggedTaskId === task.id}
                  />
                ) : (
                  <TaskCard 
                    task={task} 
                    index={index}
                    onClick={() => onTaskClick(task)}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    isDragging={draggedTaskId === task.id}
                  />
                )}
                
                {dropPreviewIndex === sortedTasks.length && index === sortedTasks.length - 1 && (
                  <div 
                    className="h-1 w-full bg-primary rounded-full mt-2 transform transition-all duration-200 animate-pulse"
                  />
                )}
              </React.Fragment>
            ))}
            
            {tasks.length === 0 && dropPreviewIndex === 0 && (
              <div 
                className="h-1 w-full bg-primary rounded-full mt-2 transform transition-all duration-200 animate-pulse"
              />
            )}
          </div>
        </ScrollArea>
      )}
      
      <div className="p-3 border-t border-slate-100">
        <Button 
          variant="outline" 
          className="w-full border border-dashed border-slate-300 hover:bg-slate-50"
          onClick={() => onAddTask(status)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>
    </div>
  );
};

export default TaskColumn;
