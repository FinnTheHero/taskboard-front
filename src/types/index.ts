export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SortKey = "deadline" | "priority" | "created" | "assignee";

export type GroupRole = "MANAGER" | "MEMBER";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Group {
  id: string;
  name: string;
  joinCode: string;
  createdAt?: string;
}

export interface GroupMembership {
  group: Group;
  role: GroupRole;
}

export interface GroupMember {
  userId: string;
  role: GroupRole;
  user: User;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId?: string;
}

export interface BoardSummary {
  id: string;
  title: string;
  groupId: string;
  createdAt?: string;
  hasAccess: boolean;
}

export interface Board {
  id: string;
  title: string;
  groupId?: string;
  createdAt?: string;
  columns?: Column[];
}

export interface BoardMemberEntry {
  boardId: string;
  userId: string;
  user: User;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  priority: Priority | null;
  position: number;
  assigneeId?: string | null;
  assignee?: User | null;
  archivedAt?: string | null;
  columnEnteredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedTasks {
  data: Task[];
  nextCursor: string | null;
  hasMore: boolean;
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
  accessToken: string;
  refreshToken: string;
}

export interface CreateTaskInput {
  columnId: string;
  title: string;
  description?: string;
  deadline?: string;
  priority?: Priority;
  assigneeId?: string;
}

export interface ArchiveCompletedResult {
  archivedCount: number;
}

export interface AssigneeWorkloadEntry {
  userId: string;
  name: string;
  taskCount: number;
  overdueCount: number;
}

export interface ColumnCountEntry {
  column: string;
  count: number;
}

export interface AvgTimeEntry {
  column: string;
  avgHours: number;
}

export interface BoardStats {
  boardId: string;
  totalTasks: number;
  doneCount: number;
  completionRate: number;
  overdueCount: number;
  unassignedCount: number;
  tasksByPriority: Record<string, number>;
  tasksByColumn: ColumnCountEntry[];
  byAssignee: AssigneeWorkloadEntry[];
  avgTimeInColumn: AvgTimeEntry[];
}

export interface GroupBoardStatsEntry {
  boardId: string;
  title: string;
  totalTasks: number;
  completionRate: number;
  overdueCount: number;
}

export interface GroupStats {
  groupId: string;
  groupName: string;
  boardCount: number;
  accessibleBoardCount: number;
  totalTasks: number;
  doneCount: number;
  completionRate: number;
  overdueCount: number;
  unassignedCount: number;
  tasksByPriority: Record<string, number>;
  tasksByColumn: ColumnCountEntry[];
  byAssignee: AssigneeWorkloadEntry[];
  avgTimeInColumn: AvgTimeEntry[];
  byBoard: GroupBoardStatsEntry[];
}
