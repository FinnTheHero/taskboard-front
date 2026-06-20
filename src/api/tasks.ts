import { api } from "./client";
import type {
  Comment,
  CreateTaskInput,
  PaginatedTasks,
  SortKey,
  Task,
} from "../types";

export function listTasksByColumn(columnId: string, sort?: SortKey) {
  return fetchAllTasksByColumn(columnId, sort);
}

async function fetchAllTasksByColumn(
  columnId: string,
  sort?: SortKey,
): Promise<Task[]> {
  const tasks: Task[] = [];
  let after: string | undefined;

  do {
    const params = new URLSearchParams({ limit: "100" });
    if (sort) params.set("sort", sort);
    if (after) params.set("after", after);

    const page = await api<PaginatedTasks>(
      `/tasks/by-column/${columnId}?${params.toString()}`,
    );
    tasks.push(...page.data);
    after = page.hasMore && page.nextCursor ? page.nextCursor : undefined;
  } while (after);

  return tasks;
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

export function createComment(taskId: string, body: string) {
  return api<Comment>(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
