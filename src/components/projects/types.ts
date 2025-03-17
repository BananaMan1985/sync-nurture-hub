
export type TaskStatus = string;

export interface Column {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

export interface CommentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface ReferenceAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Comment {
  id: string;
  text: string;
  authorName: string;
  timestamp: string;
  attachments?: CommentAttachment[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  content?: string;
  purpose?: string;
  status: TaskStatus;
  dueDate?: string;
  attachments?: number;
  comments?: Comment[];
  order?: number;
}

export const defaultColumns: Column[] = [
  { id: 'inbox', title: 'Inbox' },
  { id: 'confirmedreceived', title: 'Confirmed/Received' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'waiting', title: 'Waiting' },
  { id: 'review', title: 'Ready for Review' },
  { id: 'archive', title: 'Archive' }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Prepare quarterly report',
    description: 'Compile data from Q3 for executive meeting',
    purpose: 'Provide executives with data needed for strategic planning',
    status: 'inbox',
    dueDate: '2023-11-15',
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
    status: 'confirmedreceived',
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
    status: 'confirmedreceived',
    dueDate: '2023-11-20',
    comments: [],
  },
  {
    id: '4',
    title: 'Book travel arrangements',
    description: 'Finalize travel arrangements for the conference in December',
    status: 'inprogress',
    dueDate: '2023-11-12',
    comments: [],
  },
  {
    id: '5',
    title: 'Review department budget',
    description: 'Review and approve department budget for next quarter',
    status: 'archive',
    dueDate: '2023-11-05',
    comments: [],
  },
];
