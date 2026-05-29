import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as tasksApi from "../api/tasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import type { Board, Column, Task } from "../types";

interface KanbanBoardProps {
  board: Board;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const columns = useMemo(
    () =>
      [...(board.columns ?? [])].sort((a, b) => a.position - b.position),
    [board.columns],
  );
  const columnIds = columns.map((c) => c.id).join(",");
  const [tasksByColumn, setTasksByColumn] = useState<Record<string, Task[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalColumn, setModalColumn] = useState<Column | null>(null);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const entries = await Promise.all(
        columns.map(async (col) => {
          const tasks = await tasksApi.listTasksByColumn(col.id);
          return [col.id, tasks] as const;
        }),
      );
      setTasksByColumn(Object.fromEntries(entries));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [columnIds]);

  useEffect(() => {
    if (columns.length) loadTasks();
  }, [loadTasks, columns.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function findTask(taskId: string): { task: Task; columnId: string } | null {
    for (const [columnId, tasks] of Object.entries(tasksByColumn)) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) return { task, columnId };
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const found = findTask(String(event.active.id));
    if (found) setActiveTask(found.task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const found = findTask(taskId);
    if (!found) return;

    let targetColumnId = String(over.id);
    if (!columns.some((c) => c.id === targetColumnId)) {
      const overTask = findTask(targetColumnId);
      if (overTask) targetColumnId = overTask.columnId;
      else return;
    }

    if (found.columnId === targetColumnId) return;

    const prev = tasksByColumn;
    setTasksByColumn((current) => {
      const next = { ...current };
      next[found.columnId] = next[found.columnId].filter((t) => t.id !== taskId);
      const moved = { ...found.task, columnId: targetColumnId };
      next[targetColumnId] = [...(next[targetColumnId] ?? []), moved];
      return next;
    });

    try {
      await tasksApi.moveTask(taskId, targetColumnId);
    } catch {
      setTasksByColumn(prev);
      setError("Failed to move task");
    }
  }

  async function handleCreateTask(input: Parameters<typeof tasksApi.createTask>[0]) {
    const task = await tasksApi.createTask(input);
    setTasksByColumn((current) => ({
      ...current,
      [input.columnId]: [...(current[input.columnId] ?? []), task],
    }));
  }

  const totalTasks = Object.values(tasksByColumn).reduce(
    (sum, list) => sum + list.length,
    0,
  );
  const doneColumn = columns.find((c) =>
    c.title.toLowerCase().includes("done"),
  );
  const doneCount = doneColumn
    ? (tasksByColumn[doneColumn.id]?.length ?? 0)
    : 0;
  const progress =
    totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{board.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {totalTasks} tasks · {progress}% complete
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-emerald-400">
            {progress}%
          </span>
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted">Loading board…</p>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id] ?? []}
                onAddTask={(columnId) => {
                  const col = columns.find((c) => c.id === columnId);
                  if (col) setModalColumn(col);
                }}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="w-72 rotate-2 opacity-90">
                <TaskCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {modalColumn && (
        <TaskModal
          columnId={modalColumn.id}
          columnTitle={modalColumn.title}
          onClose={() => setModalColumn(null)}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
}
