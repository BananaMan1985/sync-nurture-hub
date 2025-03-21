
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, PaperclipIcon, MessageSquare } from 'lucide-react';
import { Task } from './types';

interface TaskCardProps {
  task: Task; 
  onClick: () => void;
  index: number;
  onDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onDragEnter: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
  className?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onClick, 
  index,
  onDragStart,
  onDragEnter,
  isDragging,
  className = ''
}) => {
  const statusColors = {
    inbox: 'bg-slate-50 border-l-slate-400',
    confirmed: 'bg-slate-50 border-l-green-400',
    confirmedreceived: 'bg-slate-50 border-l-green-400',
    received: 'bg-slate-50 border-l-blue-400',
    inprogress: 'bg-slate-50 border-l-amber-400',
    waiting: 'bg-slate-50 border-l-orange-400',
    review: 'bg-slate-50 border-l-purple-400',
    archive: 'bg-slate-50 border-l-gray-400',
    todo: 'bg-slate-50 border-l-slate-400',
    done: 'bg-slate-50 border-l-teal-400'
  };

  const getColor = () => {
    return statusColors[task.status] || 'bg-slate-50 border-l-slate-400';
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('sourceStatus', task.status);
    e.dataTransfer.setData('sourceIndex', index.toString());
    
    onDragStart(e, task, index);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDragEnter(e, index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <Card 
      className={`mb-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 border-l-4 ${
        getColor()
      } ${isDragging ? 'opacity-50' : ''} ${className}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
        <CardDescription className="mt-2 line-clamp-3">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        {task.dueDate && (
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        
        {(task.attachments || task.comments?.length) && (
          <div className="flex items-center mt-2 space-x-4">
            {task.attachments && (
              <div className="flex items-center text-xs text-muted-foreground">
                <PaperclipIcon className="mr-1 h-3 w-3" />
                <span>{task.attachments}</span>
              </div>
            )}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MessageSquare className="mr-1 h-3 w-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
