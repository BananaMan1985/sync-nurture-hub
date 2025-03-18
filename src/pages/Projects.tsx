import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ListChecks,
  Plus,
  Clock,
  ClipboardList,
  Timer,
  FileText,
  Archive,
  Inbox,
  Kanban,
  Grid,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import TaskColumn from "@/components/projects/TaskColumn";
import TaskForm from "@/components/projects/TaskForm";
import TaskEditDialog from "@/components/projects/TaskEditDialog";
import ColumnCarousel from "@/components/projects/ColumnCarousel";
import {
  Task,
  TaskStatus,
  Comment as TaskComment,
  Column,
  defaultColumns,
} from "@/components/projects/types";
import ProjectsGrid from "@/components/projects/ProjectsGrid";

// Initialize Supabase client with Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Projects = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns] = useState<Column[]>(defaultColumns);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("inbox");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>("kanban");
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleGlobalDragStart = (e: DragEvent) => {
      const taskId = e.dataTransfer?.getData("taskId");
      if (taskId) setDraggedTaskId(taskId);
    };

    const handleGlobalDragEnd = () => setDraggedTaskId(null);

    document.addEventListener("dragstart", handleGlobalDragStart);
    document.addEventListener("dragend", handleGlobalDragEnd);

    return () => {
      document.removeEventListener("dragstart", handleGlobalDragStart);
      document.removeEventListener("dragend", handleGlobalDragEnd);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
        usererror,
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("created_by", user.id);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const handleDrop = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      const columnTitle =
        columns.find((col) => col.id === newStatus)?.title || newStatus;
      toast({
        title: "Project moved",
        description: `Project moved to ${columnTitle}.`,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to move project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDraggedTaskId(null);
    }
  };

  const handleReorderTasks = async (
    draggedTaskId: string,
    targetIndex: number,
    status: TaskStatus
  ) => {
    if (!draggedTaskId) return;

    const statusTasks = [...getTasksByStatus(status)];
    const draggedTaskIndex = statusTasks.findIndex(
      (task) => task.id === draggedTaskId
    );

    if (draggedTaskIndex === -1) return;

    const draggedTask = statusTasks[draggedTaskIndex];
    statusTasks.splice(draggedTaskIndex, 1);
    statusTasks.splice(targetIndex, 0, draggedTask);

    const updatedTasks = statusTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    try {
      setIsLoading(true);
      await Promise.all(
        updatedTasks.map((task) =>
          supabase.from("tasks").update({ order: task.order }).eq("id", task.id)
        )
      );

      setTasks((prev) => {
        const otherTasks = prev.filter((task) => task.status !== status);
        return [...otherTasks, ...updatedTasks];
      });
    } catch (error) {
      console.error("Error reordering tasks:", error);
      toast({
        title: "Error",
        description: "Failed to reorder tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDraggedTaskId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.types.includes("taskId")) {
      const taskId = e.dataTransfer.getData("taskId");
      if (taskId && draggedTaskId !== taskId) setDraggedTaskId(taskId);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = async (updatedTask: Task) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("tasks")
        .update({
          title: updatedTask.title,
          task: updatedTask.task,
          status: updatedTask.status,
          labels: updatedTask.labels || "", // Ensure it's included even if not in UI
          attachments: updatedTask.attachments || "", // Ensure it's included even if not in UI
          // created_by: updatedTask.created_by || '', // Ensure it's included even if not in UI
          // assigned_to: updatedTask.assigned_to,
          due_date: updatedTask.due_date,
          purpose: updatedTask.purpose,
          end_result: updatedTask.end_result,
        })
        .eq("id", updatedTask.id);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );

      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }

      setIsTaskDialogOpen(false);
      toast({
        title: "Project updated",
        description: "Your project has been saved.",
      });
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setIsTaskDialogOpen(false);
      toast({
        title: "Project deleted",
        description: "Project has been removed.",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setNewTaskStatus(status);
    setIsNewTaskDialogOpen(true);
  };

  const handleCreateTask = async (newTask: Partial<Task>) => {
    try {
      setIsLoading(true);

      const {
        data: { user },
        usererror,
      } = await supabase.auth.getUser();

      const { data: publicUser, publicUsererror } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id);
      console.log(publicUser);

      const taskToAdd: Task = {
        id: `task-${Date.now()}`,
        title: newTask.title || "Untitled Project",
        task: newTask.task || "",
        status: newTask.status || newTaskStatus,
        labels: "", // Default to empty string since not in UI
        attachments: "", // Default to empty string since not in UI
        created_by: user.id, // Default to empty string since not in UI
        // assigned_to: publicUser. || '',
        due_date: newTask.due_date || format(new Date(), "yyyy-MM-dd"),
        purpose: newTask.purpose || "",
        end_result: newTask.end_result || "",
        order: getTasksByStatus(newTask.status || newTaskStatus).length,
        comments: [],
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            // id: taskToAdd.id,
            title: taskToAdd.title,
            task: taskToAdd.task,
            status: taskToAdd.status,
            labels: taskToAdd.labels,
            attachments: taskToAdd.attachments,
            created_by: taskToAdd.created_by,
            // assigned_to: taskToAdd.assigned_to,
            due_date: taskToAdd.due_date,
            purpose: taskToAdd.purpose,
            end_result: taskToAdd.end_result,
            order: taskToAdd.order,
          },
        ])
        .select();

      if (error) throw error;

      setTasks((prev) => [...prev, data[0]]);
      setIsNewTaskDialogOpen(false);
      toast({
        title: "Project created",
        description: "Your new project has been created.",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (
    taskId: string,
    comment: Omit<TaskComment, "id">
  ) => {
    const newComment: TaskComment = {
      id: `comment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...comment,
    };

    try {
      setIsLoading(true);
      const updatedComments = [
        ...(tasks.find((t) => t.id === taskId)?.comments || []),
        newComment,
      ];

      const { error } = await supabase
        .from("tasks")
        .update({ comments: updatedComments })
        .eq("id", taskId);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, comments: updatedComments } : task
        )
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask((prev) =>
          prev ? { ...prev, comments: updatedComments } : prev
        );
      }

      toast({
        title: "Comment added",
        description: "Your comment has been added.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (
    taskId: string,
    commentId: string,
    updatedComment: TaskComment
  ) => {
    try {
      setIsLoading(true);
      const updatedComments =
        tasks
          .find((t) => t.id === taskId)
          ?.comments?.map((comment) =>
            comment.id === commentId ? updatedComment : comment
          ) || [];

      const { error } = await supabase
        .from("tasks")
        .update({ comments: updatedComments })
        .eq("id", taskId);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, comments: updatedComments } : task
        )
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask((prev) =>
          prev ? { ...prev, comments: updatedComments } : prev
        );
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      toast({
        title: "Error",
        description: "Failed to edit comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (taskId: string, commentId: string) => {
    try {
      setIsLoading(true);
      const updatedComments =
        tasks
          .find((t) => t.id === taskId)
          ?.comments?.filter((comment) => comment.id !== commentId) || [];

      const { error } = await supabase
        .from("tasks")
        .update({ comments: updatedComments })
        .eq("id", taskId);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, comments: updatedComments } : task
        )
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask((prev) =>
          prev ? { ...prev, comments: updatedComments } : prev
        );
      }

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditColumnTitle = (id: string, newTitle: string) => {
    toast({
      title: "Column names are fixed",
      description: "Column names cannot be changed.",
    });
  };

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case "inbox":
        return <Inbox className="h-5 w-5" />;
      case "confirmedreceived":
        return <ClipboardList className="h-5 w-5" />;
      case "inprogress":
        return <Clock className="h-5 w-5" />;
      case "waiting":
        return <Timer className="h-5 w-5" />;
      case "review":
        return <FileText className="h-5 w-5" />;
      case "archive":
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

        <Tabs
          defaultValue="kanban"
          value={activeView}
          onValueChange={setActiveView}
          className="w-full mb-6"
        >
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
              {columns.map((column) => (
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
                    onEditColumnTitle={(newTitle) =>
                      handleEditColumnTitle(column.id, newTitle)
                    }
                    isEditing={editingColumnId === column.id}
                    setIsEditing={(isEditing) =>
                      setEditingColumnId(isEditing ? column.id : null)
                    }
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

        <Dialog
          open={isNewTaskDialogOpen}
          onOpenChange={setIsNewTaskDialogOpen}
        >
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
              statuses={columns.map((col) => ({ id: col.id, name: col.title }))}
              initialStatus={newTaskStatus}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
};

export default Projects;
