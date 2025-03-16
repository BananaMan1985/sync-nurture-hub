
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash, Check, X } from 'lucide-react';
import TaskCard from './TaskCard';
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
            <h3 className="font-medium ml-2 text-lg flex-1">{title}</h3>
            <div className="ml-2 bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
              {tasks.length}
            </div>

            {(onEditColumnTitle || onDeleteColumn) && (
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
                    {onDeleteColumn && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={onDeleteColumn}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete column
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
        Add Project
      </Button>
    </div>
  );
};

export default TaskColumn;
