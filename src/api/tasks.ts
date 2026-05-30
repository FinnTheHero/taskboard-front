import { api } from "./client";
import type {
  Comment,
  CreateTaskInput,
  SortKey,
  Task,
} from "../types";

export function listTasksByColumn(columnId: string, sort?: SortKey) {
  const query = sort ? `?sort=${encodeURIComponent(sort)}` : "";
  return api<Task[]>(`/tasks/by-column/${columnId}${query}`);
}

export function createTask(input: CreateTaskInput) {
  return api<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function moveTask(
  taskId: string,
  toColumnId: string,
  position?: number,
) {
  return api<Task>(`/tasks/${taskId}/move`, {
    method: "PATCH",
    body: JSON.stringify({
      toColumnId,
      ...(position !== undefined ? { position } : {}),
    }),
  });
}

export function listComments(taskId: string) {
  return api<Comment[]>(`/tasks/${taskId}/comments`);
}

export function createComment(taskId: string, body: string) {
  return api<Comment>(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
