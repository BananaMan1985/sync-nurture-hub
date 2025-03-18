// src/components/projects/types.ts
export type TaskStatus = 'inbox' | 'confirmedreceived' | 'inprogress' | 'waiting' | 'review' | 'archive';

export interface Comment {
  id: string;
  content: string;
  createdAt?: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
}

export interface Task {
  id: string;
  title: string;
  task: string; // Renamed from description
  status: TaskStatus;
  labels?: string;
  attachments?: string;
  created_by?: string;
  assigned_to?: string;
  due_date?: string;
  purpose?: string;
  end_result?: string; // Renamed from content
  order: number;
  comments?: Comment[];
  created_at?: string;
  updated_at?: string;
}

export const defaultColumns: Column[] = [
  { id: 'inbox', title: 'Inbox' },
  { id: 'confirmedreceived', title: 'Confirmed/Received' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'waiting', title: 'Waiting' },
  { id: 'review', title: 'Review' },
  { id: 'archive', title: 'Archive' },
];