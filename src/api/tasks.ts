import { api } from "./client";
import type { CreateTaskInput, Task } from "../types";

export function listTasksByColumn(columnId: string) {
  return api<Task[]>(`/tasks/by-column/${columnId}`);
}

export function createTask(input: CreateTaskInput) {
  return api<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function moveTask(taskId: string, toColumnId: string) {
  return api<Task>(`/tasks/${taskId}/move`, {
    method: "PATCH",
    body: JSON.stringify({ toColumnId }),
  });
}
