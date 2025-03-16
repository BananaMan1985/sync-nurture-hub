
import React, { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import AppMenu from '@/components/AppMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ListChecks, Plus, Clock, CalendarDays, PaperclipIcon, MessageSquare, Trash2, Upload, Check, X, Tag, FileText, Send, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

type TaskStatus = 'todo' | 'inprogress' | 'done';

interface CommentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Comment {
  id: string;
  text: string;
  authorName: string;
  timestamp: string;
  attachments?: CommentAttachment[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: number;
  comments?: Comment[];
  order?: number;
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
    comments: [
      {
        id: '1-1',
        text: 'I\'ve gathered most of the data needed for this report.',
        authorName: 'Alex Murphy',
        timestamp: '2023-11-08T14:32:00Z'
      },
      {
        id: '1-2',
        text: 'Could you include the Q2 comparison data as well?',
        authorName: 'Jamie Smith',
        timestamp: '2023-11-09T09:15:00Z'
      }
    ],
  },
  {
    id: '2',
    title: 'Client follow-up',
    description: 'Send follow-up emails to clients from Monday\'s meeting',
    status: 'inprogress',
    priority: 'medium',
    dueDate: '2023-11-10',
    comments: [
      {
        id: '2-1',
        text: 'I\'ve drafted the first few emails, will finish tomorrow.',
        authorName: 'Sagan',
        timestamp: '2023-11-07T16:45:00Z'
      }
    ],
  },
  {
    id: '3',
    title: 'Update website content',
    description: 'Update the team page with new staff photos',
    status: 'todo',
    priority: 'low',
    dueDate: '2023-11-20',
    comments: [],
  },
  {
    id: '4',
    title: 'Book travel arrangements',
    description: 'Finalize travel arrangements for the conference in December',
    status: 'inprogress',
    priority: 'medium',
    dueDate: '2023-11-12',
    comments: [],
  },
  {
    id: '5',
    title: 'Review department budget',
    description: 'Review and approve department budget for next quarter',
    status: 'done',
    priority: 'high',
    dueDate: '2023-11-05',
    comments: [],
  },
];

const TaskCard: React.FC<{ 
  task: Task; 
  onClick: () => void;
  index: number;
  onDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onDragEnter: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
}> = ({ 
  task, 
  onClick, 
  index,
  onDragStart,
  onDragEnter,
  isDragging
}) => {

  const statusColors = {
    todo: 'bg-slate-50 border-l-slate-400',
    inprogress: 'bg-slate-50 border-l-amber-400',
    done: 'bg-slate-50 border-l-teal-400'
  };

  return (
    <Card 
      className={`mb-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 border-l-4 ${
        statusColors[task.status]
      } ${isDragging ? 'opacity-50' : ''}`}
      draggable 
      onDragStart={(e) => onDragStart(e, task, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragOver={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
        <CardDescription className="mt-1 line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
        
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

const TaskColumn: React.FC<{ 
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
}> = ({
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
}) => {
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null);

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
        <h3 className="font-medium ml-2 text-lg">{title}</h3>
        <div className="ml-2 bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
          {tasks.length}
        </div>
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
        Add Task
      </Button>
    </div>
  );
};

interface CommentFormProps {
  taskId: string;
  onAddComment: (taskId: string, comment: Omit<Comment, 'id'>) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ taskId, onAddComment }) => {
  const [attachments, setAttachments] = useState<CommentAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      comment: '',
    },
  });
  
  const handleSubmit = form.handleSubmit((data) => {
    onAddComment(taskId, {
      text: data.comment,
      authorName: 'Sagan', // In a real app, this would be the logged-in user's name
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined
    });
    form.reset();
    setAttachments([]);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: CommentAttachment[] = [];
    
    Array.from(files).forEach(file => {
      // Create object URL for preview (in a real app, you would upload to a server)
      const fileUrl = URL.createObjectURL(file);
      
      newAttachments.push({
        id: `attachment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl
      });
    });
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };
  
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea 
                  placeholder="Add a comment..." 
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Attachments</p>
            <div className="space-y-2">
              {attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
                  <div className="flex items-center">
                    <PaperclipIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="truncate max-w-[200px]">{attachment.name}</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500"
          >
            <PaperclipIcon className="h-4 w-4 mr-1" />
            Attach files
          </Button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
            multiple 
          />
          
          <Button 
            type="submit" 
            size="sm"
            disabled={!form.getValues().comment.trim() && attachments.length === 0}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
};

interface CommentEditFormProps {
  comment: Comment;
  onSave: (updatedComment: Comment) => void;
  onCancel: () => void;
}

const CommentEditForm: React.FC<CommentEditFormProps> = ({ 
  comment, 
  onSave, 
  onCancel 
}) => {
  const [text, setText] = useState(comment.text);
  const [attachments, setAttachments] = useState<CommentAttachment[]>(comment.attachments || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSave({
        ...comment,
        text,
        attachments: attachments.length > 0 ? attachments : undefined
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: CommentAttachment[] = [];
    
    Array.from(files).forEach(file => {
      // Create object URL for preview (in a real app, you would upload to a server)
      const fileUrl = URL.createObjectURL(file);
      
      newAttachments.push({
        id: `attachment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl
      });
    });
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[80px] resize-none"
      />
      
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Attachments</p>
          <div className="space-y-2">
            {attachments.map(attachment => (
              <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
                <div className="flex items-center">
                  <PaperclipIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="truncate max-w-[200px]">{attachment.name}</span>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => removeAttachment(attachment.id)}
                  >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-500"
        >
          <PaperclipIcon className="h-4 w-4 mr-1" />
          Attach files
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
          multiple 
        />
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            size="sm"
            disabled={!text.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    </form>
  );
};

interface CommentListProps {
  comments: Comment[];
  onEditComment: (commentId: string, updatedComment: Comment) => void;
  taskId?: string; // Add optional taskId parameter
}

const CommentList: React.FC<CommentListProps> = ({ comments, onEditComment, taskId }) => {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  
  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }
  
  const handleSaveEdit = (updatedComment: Comment) => {
    if (taskId) {
      // If taskId is provided, use the 3-param version
      onEditComment(updatedComment.id, updatedComment);
    } else {
      // Otherwise use the 2-param version (for backward compatibility)
      onEditComment(updatedComment.id, updatedComment);
    }
    setEditingCommentId(null);
  };
  
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.authorName}`} />
            <AvatarFallback className="text-xs">
              {comment.authorName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{comment.authorName}</p>
              <div className="flex items-center">
                <p className="text-xs text-muted-foreground mr-2">
                  {new Date(comment.timestamp).toLocaleString()}
                </p>
                {editingCommentId !== comment.id && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => setEditingCommentId(comment.id)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {editingCommentId === comment.id ? (
              <CommentEditForm
                comment={comment}
                onSave={handleSaveEdit}
                onCancel={() => setEditingCommentId(null)}
              />
            ) : (
              <>
                <p className="mt-1 text-sm">{comment.text}</p>
                
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {comment.attachments.map(attachment => (
                      <a 
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-600 hover:underline"
                      >
                        <PaperclipIcon className="h-3 w-3 mr-1" />
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

interface TaskFormProps {
  task?: Task | null;
  onSave: (task: Partial<Task>) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    dueDate: task?.dueDate || format(new Date(), 'yyyy-MM-dd'),
    priority: task?.priority || 'medium',
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : new Date()
  );

  const handleChange = (field: keyof Task, value: any) => {
    setNewTask(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(newTask);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4 text-gray-500" />
          <span>Task Title</span>
        </div>
        <Input
          value={newTask.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Task title"
          className="text-lg font-medium"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
          <Tag className="h-4 w-4 text-gray-500" />
          <span>Status</span>
        </div>
        <Select 
          defaultValue={newTask.status}
          onValueChange={(value) => handleChange('status', value as TaskStatus)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectItem value="todo" className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
              <span>To Do</span>
            </SelectItem>
            <SelectItem value="inprogress" className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
              <span>In Progress</span>
            </SelectItem>
            <SelectItem value="done" className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Done</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <span>Description</span>
        </div>
        <Textarea
          placeholder="Add a detailed description..."
          value={newTask.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="min-h-[120px] resize-none"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <span>Due Date</span>
        </div>
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
              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
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
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} size="sm">
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          size="sm" 
          className="bg-[#2D3B22] hover:bg-[#3c4f2d] text-white"
          disabled={!newTask.title?.trim()}
        >
          <Check className="h-4 w-4 mr-1" />
          {task ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </div>
  );
};

const TaskEditDialog: React.FC<{
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onAddComment: (taskId: string, comment: Omit<Comment, 'id'>) => void;
  onEditComment: (taskId: string, commentId: string, updatedComment: Comment) => void;
}> = ({ isOpen, task, onClose, onSave, onDelete, onAddComment, onEditComment }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const { toast } = useToast();

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
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated.",
      });
    }
  };

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleAddComment = (taskId: string, comment: Omit<Comment, 'id'>) => {
    onAddComment(taskId, comment);
    
    setEditedTask(prev => {
      if (!prev) return prev;
      
      const newComment = {
        id: `comment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...comment
      };
      
      return {
        ...prev,
        comments: [...(prev.comments || []), newComment]
      };
    });
  };

  // Update this function to match the expected signature
  const handleEditComment = (commentId: string, updatedComment: Comment) => {
    // Call the parent function with the task ID
    onEditComment(editedTask.id, commentId, updatedComment);
    
    setEditedTask(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        comments: prev.comments?.map(comment => 
          comment.id === commentId ? updatedComment : comment
        )
      };
    });
    
    toast({
      title: "Comment updated",
      description: "Your comment has been updated.",
    });
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
        title: "Task deleted",
        description: "Your task has been successfully deleted.",
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
                Task Details
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

const Tasks = () => {
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
      title: "Task moved",
      description: `Task moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'inprogress' ? 'In Progress' : 'Done'}.`,
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

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
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
      title: newTask.title || 'Untitled Task',
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
      title: "Task created",
      description: "Your new task has been created.",
    });
  };

  const handleAddComment = (taskId: string, comment: Omit<Comment, 'id'>) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...comment
    };
    
    console.log("Adding comment:", newComment, "to task:", taskId);
    
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            comments: [...(task.comments || []), newComment]
          };
        }
        return task;
      });
      
      console.log("Updated tasks:", updatedTasks);
      return updatedTasks;
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
      description: "Your comment has been added to the task.",
    });
  };

  const handleEditComment = (taskId: string, commentId: string, updatedComment: Comment) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
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
      
      console.log("Updated tasks after comment edit:", updatedTasks);
      return updatedTasks;
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
            Tasks
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
        
        {/* Task Edit Dialog */}
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
        
        {/* New Task Dialog */}
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Fill in the details for your new task.
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

export default Tasks;
