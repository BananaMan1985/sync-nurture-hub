
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Task, Comment } from './types';
import TaskForm from './TaskForm';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

interface TaskEditDialogProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onAddComment: (taskId: string, comment: Omit<Comment, 'id'>) => void;
  onEditComment: (taskId: string, commentId: string, updatedComment: Comment) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ 
  isOpen, 
  task, 
  onClose, 
  onSave, 
  onDelete, 
  onAddComment, 
  onEditComment 
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      toast({
        title: "Project updated",
        description: "Your project has been successfully updated.",
      });
    }
  };

  const handleAddComment = (taskId: string, comment: Omit<Comment, 'id'>) => {
    onAddComment(taskId, comment);
  };

  const handleEditComment = (commentId: string, updatedComment: Comment) => {
    if (editedTask) {
      onEditComment(editedTask.id, commentId, updatedComment);
    }
  };

  const statusStyles = {
    todo: {
      label: 'To Do',
      color: 'bg-blue-500',
      borderColor: 'border-blue-500'
    },
    inprogress: {
      label: 'In Progress',
      color: 'bg-amber-500',
      borderColor: 'border-amber-500'
    },
    done: {
      label: 'Done',
      color: 'bg-emerald-500',
      borderColor: 'border-emerald-500'
    }
  };

  const currentStatus = statusStyles[editedTask.status];

  const handleDelete = () => {
    if (editedTask) {
      onDelete(editedTask.id);
      onClose();
      toast({
        title: "Project deleted",
        description: "Your project has been successfully deleted.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full ${currentStatus.color} mr-2`}></div>
              <DialogTitle className="text-xl">
                {editedTask.title}
              </DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive" 
              onClick={handleDelete}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
          <DialogDescription className="pt-2">
            <div className="flex space-x-8 border-b">
              <button
                className={`pb-2 pt-1 px-1 ${activeTab === 'details' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('details')}
              >
                Project Details
              </button>
              <button
                className={`pb-2 pt-1 px-1 ${activeTab === 'comments' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('comments')}
              >
                Comments {editedTask.comments && editedTask.comments.length > 0 && 
                  `(${editedTask.comments.length})`}
              </button>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {activeTab === 'details' ? (
            <TaskForm 
              task={editedTask} 
              onSave={handleSave} 
              onCancel={onClose} 
            />
          ) : (
            <div className="space-y-6">
              <CommentList 
                comments={editedTask.comments || []} 
                onEditComment={handleEditComment}
                taskId={editedTask.id}
              />
              <div className="border-t pt-4">
                <CommentForm 
                  taskId={editedTask.id} 
                  onAddComment={handleAddComment} 
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
