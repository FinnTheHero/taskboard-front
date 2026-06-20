import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Archive } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as boardsApi from "../api/boards";
import * as tasksApi from "../api/tasks";
import { useAuth } from "../context/AuthContext";
import { BoardFocusPanel } from "./BoardFocusPanel";
import type { FocusTask } from "./FocusTaskRow";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskModal } from "./TaskModal";
import { useGroup } from "../context/GroupContext";
import type { Board, BoardMemberEntry, Column, SortKey, Task } from "../types";

interface KanbanBoardProps {
  board: Board;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const { user } = useAuth();
  const { isManager } = useGroup();
  const columns = useMemo(
    () => [...(board.columns ?? [])].sort((a, b) => a.position - b.position),
    [board.columns],
  );
  const columnIds = columns.map((c) => c.id).join(",");
  const [tasksByColumn, setTasksByColumn] = useState<Record<string, Task[]>>(
    {},
  );
  const [sortByColumn, setSortByColumn] = useState<
    Record<string, SortKey | undefined>
  >({});
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalColumn, setModalColumn] = useState<Column | null>(null);
  const [error, setError] = useState("");
  const [archiveMessage, setArchiveMessage] = useState("");
  const [assignableMembers, setAssignableMembers] = useState<BoardMemberEntry[]>(
    [],
  );

  const sortKey = Object.values(sortByColumn).join(",");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const entries = await Promise.all(
        columns.map(async (col) => {
          const tasks = await tasksApi.listTasksByColumn(
            col.id,
            sortByColumn[col.id],
          );
          return [col.id, tasks] as const;
        }),
      );
      setTasksByColumn(Object.fromEntries(entries));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [columnIds, sortKey]);

  useEffect(() => {
    if (columns.length) loadTasks();
  }, [loadTasks, columns.length]);

  useEffect(() => {
    boardsApi
      .listAssignableMembers(board.id)
      .then(setAssignableMembers)
      .catch(() => setAssignableMembers([]));
  }, [board.id]);

  const columnTitleById = useMemo(() => {
    return Object.fromEntries(columns.map((c) => [c.id, c.title]));
  }, [columns]);

  const allTasks = useMemo((): FocusTask[] => {
    const result: FocusTask[] = [];
    for (const [columnId, tasks] of Object.entries(tasksByColumn)) {
      const columnTitle = columnTitleById[columnId] ?? "Unknown";
      for (const task of tasks) {
        result.push({ ...task, columnTitle });
      }
    }
    return result;
  }, [tasksByColumn, columnTitleById]);

  function updateTaskInState(updated: Task) {
    setTasksByColumn((current) => {
      const next: Record<string, Task[]> = {};
      for (const [columnId, tasks] of Object.entries(current)) {
        next[columnId] = tasks.map((t) =>
          t.id === updated.id ? { ...t, ...updated } : t,
        );
      }
      return next;
    });
    setSelectedTask((current) =>
      current?.id === updated.id ? { ...current, ...updated } : current,
    );
  }

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
    const overId = String(over.id);
    if (taskId === overId) return;

    const found = findTask(taskId);
    if (!found) return;

    let targetColumnId: string;
    let targetIndex: number;

    const columnMatch = columns.find((c) => c.id === overId);
    if (columnMatch) {
      targetColumnId = columnMatch.id;
      targetIndex = (tasksByColumn[targetColumnId] ?? []).length;
    } else {
      const overFound = findTask(overId);
      if (!overFound) return;
      targetColumnId = overFound.columnId;
      const colTasks = tasksByColumn[targetColumnId] ?? [];
      targetIndex = colTasks.findIndex((t) => t.id === overId);
      if (targetIndex < 0) targetIndex = colTasks.length;
    }

    if (sortByColumn[found.columnId] || sortByColumn[targetColumnId]) {
      return;
    }

    const sourceColumnId = found.columnId;
    const sourceTasks = [...(tasksByColumn[sourceColumnId] ?? [])];
    const sourceIndex = sourceTasks.findIndex((t) => t.id === taskId);
    if (sourceIndex < 0) return;

    const prev = tasksByColumn;
    let position: number;

    if (sourceColumnId === targetColumnId) {
      const reordered = arrayMove(sourceTasks, sourceIndex, targetIndex);
      if (sourceIndex === targetIndex) return;
      position = reordered.findIndex((t) => t.id === taskId);
      setTasksByColumn({
        ...tasksByColumn,
        [sourceColumnId]: reordered,
      });
    } else {
      const targetTasks = [...(tasksByColumn[targetColumnId] ?? [])];
      const [moved] = sourceTasks.splice(sourceIndex, 1);
      const updatedTask = { ...moved, columnId: targetColumnId };
      targetTasks.splice(targetIndex, 0, updatedTask);
      position = targetIndex;
      setTasksByColumn({
        ...tasksByColumn,
        [sourceColumnId]: sourceTasks,
        [targetColumnId]: targetTasks,
      });
    }

    try {
      const updated = await tasksApi.moveTask(
        taskId,
        targetColumnId,
        position,
      );
      setTasksByColumn((current) => {
        const col = current[targetColumnId] ?? [];
        return {
          ...current,
          [targetColumnId]: col.map((t) =>
            t.id === taskId ? { ...t, ...updated } : t,
          ),
        };
      });
    } catch {
      setTasksByColumn(prev);
      setError("Failed to move task");
    }
  }

  async function handleSortChange(columnId: string, sort: SortKey | undefined) {
    setSortByColumn((prev) => ({ ...prev, [columnId]: sort }));
    try {
      const tasks = await tasksApi.listTasksByColumn(columnId, sort);
      setTasksByColumn((prev) => ({ ...prev, [columnId]: tasks }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sort tasks");
    }
  }

  async function handleCreateTask(
    input: Parameters<typeof tasksApi.createTask>[0],
  ) {
    const task = await tasksApi.createTask(input);
    setTasksByColumn((current) => ({
      ...current,
      [input.columnId]: [...(current[input.columnId] ?? []), task],
    }));
  }

  async function handleArchiveCompleted() {
    setArchiving(true);
    setError("");
    setArchiveMessage("");
    try {
      const result = await boardsApi.archiveCompleted(board.id);
      setArchiveMessage(
        result.archivedCount > 0
          ? `Archived ${result.archivedCount} completed task${result.archivedCount === 1 ? "" : "s"}`
          : "No completed tasks to archive",
      );
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to archive completed tasks",
      );
    } finally {
      setArchiving(false);
    }
  }

  const totalTasks = Object.values(tasksByColumn).reduce(
    (sum, list) => sum + list.length,
    0,
  );
  const doneColumn = columns.find((c) => c.title === "Done");
  const doneCount = doneColumn
    ? (tasksByColumn[doneColumn.id]?.length ?? 0)
    : 0;
  // Client-side bar for instant feedback; authoritative metrics live on GET /boards/:id/stats and /group/analytics.
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
        <div className="flex flex-wrap items-center gap-3">
          {isManager && doneColumn && doneCount > 0 && (
            <button
              type="button"
              onClick={handleArchiveCompleted}
              disabled={archiving || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-muted transition hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-50"
            >
              <Archive className="h-4 w-4" />
              {archiving ? "Archiving…" : "Archive completed"}
            </button>
          )}
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

      {archiveMessage && (
        <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {archiveMessage}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted">Loading board…</p>
      ) : (
        <div className="flex min-h-0 flex-1 gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto pb-4">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn[column.id] ?? []}
                  sort={sortByColumn[column.id]}
                  dragDisabled={Boolean(sortByColumn[column.id])}
                  onAddTask={(columnId) => {
                    const col = columns.find((c) => c.id === columnId);
                    if (col) setModalColumn(col);
                  }}
                  onSortChange={handleSortChange}
                  onTaskClick={setSelectedTask}
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
          {user && (
            <BoardFocusPanel
              tasks={allTasks}
              assignableMembers={assignableMembers}
              currentUserId={user.id}
              onTaskClick={setSelectedTask}
            />
          )}
        </div>
      )}

      {modalColumn && user && (
        <TaskModal
          columnId={modalColumn.id}
          columnTitle={modalColumn.title}
          assignableMembers={assignableMembers}
          currentUserId={user.id}
          onClose={() => setModalColumn(null)}
          onSubmit={handleCreateTask}
        />
      )}

      {selectedTask && user && (
        <TaskDetailModal
          task={selectedTask}
          assignableMembers={assignableMembers}
          currentUserId={user.id}
          onClose={() => setSelectedTask(null)}
          onUpdated={updateTaskInState}
        />
      )}
    </div>
  );
}
