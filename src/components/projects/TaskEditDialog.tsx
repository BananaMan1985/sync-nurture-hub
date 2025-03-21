
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  onDeleteComment: (taskId: string, commentId: string) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ 
  isOpen, 
  task, 
  onClose, 
  onSave, 
  onDelete, 
  onAddComment, 
  onEditComment,
  onDeleteComment
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      // Make a deep copy to prevent mutations
      setEditedTask(JSON.parse(JSON.stringify(task)));
    }
  }, [task]);

  if (!editedTask) return null;

  const handleSave = (updatedTask: Partial<Task>) => {
    if (editedTask) {
      // Create a complete updated task by merging the edited task with the new changes
      const fullUpdatedTask: Task = {
        ...editedTask,
        ...updatedTask,
        // Ensure id is preserved
        id: editedTask.id
      };

      console.log("Saving complete edited task:", fullUpdatedTask);
      onSave(fullUpdatedTask);
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

  const handleDeleteComment = (commentId: string) => {
    if (editedTask) {
      onDeleteComment(editedTask.id, commentId);
    }
  };

  // Fix status styles to include all possible statuses from our columns
  const statusStyles = {
    todo: {
      label: 'To Do',
      color: 'bg-blue-500',
      borderColor: 'border-blue-500'
    },
    inbox: {
      label: 'Inbox',
      color: 'bg-slate-500',
      borderColor: 'border-slate-500'
    },
    confirmedreceived: {
      label: 'Confirmed/Received',
      color: 'bg-green-500',
      borderColor: 'border-green-500'
    },
    inprogress: {
      label: 'In Progress',
      color: 'bg-amber-500',
      borderColor: 'border-amber-500'
    },
    waiting: {
      label: 'Waiting',
      color: 'bg-orange-500',
      borderColor: 'border-orange-500'
    },
    review: {
      label: 'Ready for Review',
      color: 'bg-purple-500',
      borderColor: 'border-purple-500'
    },
    archive: {
      label: 'Archive',
      color: 'bg-gray-500',
      borderColor: 'border-gray-500'
    },
    done: {
      label: 'Done',
      color: 'bg-emerald-500',
      borderColor: 'border-emerald-500'
    }
  };

  // Get color based on status with fallback
  const getStatusStyle = () => {
    return statusStyles[editedTask.status] || {
      label: editedTask.status,
      color: 'bg-slate-500',
      borderColor: 'border-slate-500'
    };
  };

  const currentStatus = getStatusStyle();

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

  // Function to navigate between tabs with keyboard arrows
  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' && activeTab === 'details') {
      setActiveTab('comments');
    } else if (e.key === 'ArrowLeft' && activeTab === 'comments') {
      setActiveTab('details');
    }
  };

  
//   <button
//   className={`pb-2 pt-1 px-3 flex items-center ${activeTab === 'comments' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
//   onClick={() => setActiveTab('comments')}
// >
//   Comments {editedTask.comments && editedTask.comments.length > 0 && 
//     <span className="ml-1.5 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium text-slate-600">
//       {editedTask.comments.length}
//     </span>}
// </button>
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto" onKeyDown={handleKeyNavigation}>
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
            <div className="flex items-center border-b">
              <div className="flex-1 flex space-x-2">
                <button
                  className={`pb-2 pt-1 px-3 flex items-center ${activeTab === 'details' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Project Details
                </button>

              </div>

                    
              
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setActiveTab('details')}
                  disabled={activeTab === 'details'}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setActiveTab('comments')}
                  disabled={activeTab === 'comments'}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {activeTab === 'details' ? (
            <TaskForm 
              task={editedTask} 
              onSave={handleSave} 
              onCancel={onClose} 
              statuses={Object.keys(statusStyles).map(id => ({ id, name: statusStyles[id].label }))}
            />
          ) : (
            <div className="space-y-6">
              <CommentList 
                comments={editedTask.comments || []} 
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
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
