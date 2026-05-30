export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SortKey = "deadline" | "priority" | "created" | "assignee";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId?: string;
}

export interface Board {
  id: string;
  title: string;
  createdAt?: string;
  columns?: Column[];
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  priority: Priority;
  position: number;
  assigneeId?: string | null;
  assignee?: User | null;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  body: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  author?: User;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateTaskInput {
  columnId: string;
  title: string;
  description?: string;
  deadline?: string;
  priority?: Priority;
}

export interface ArchiveCompletedResult {
  archivedCount: number;
}
