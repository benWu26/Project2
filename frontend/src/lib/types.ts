export interface User {
  user_id: number;
  name: string;
  email: string;
}

export interface UserCreate {
  name: string;
  email: string;
}

export interface Task {
  task_id: number;
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  importance?: number;
  user_id: number;
  finished: boolean;
  date_made: string;
  date_finished?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  importance?: number;
  user_id: number;
  finished?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  importance?: number;
  finished?: boolean;
}

export interface Note {
  note_id: number;
  title: string;
  description?: string;
  user_id: number;
  date_created: string;
}

export interface NoteCreate {
  title: string;
  description?: string;
  user_id: number;
}

export interface NoteUpdate {
  title?: string;
  description?: string;
}

export interface MessageResponse {
  message: string;
}

export interface TaskCompletionReport {
  total_tasks: number;
  completed_tasks: number;
  avg_completion_days: number;
  avg_importance: number;
  completion_rate: number;
}

export interface NoteActivityReport {
  total_notes: number;
}