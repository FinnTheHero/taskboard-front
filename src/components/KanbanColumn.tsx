import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { SORT_OPTIONS } from "../lib/sort";
import { TaskCard } from "./TaskCard";
import type { Column, SortKey, Task } from "../types";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  sort?: SortKey;
  dragDisabled?: boolean;
  onAddTask: (columnId: string) => void;
  onSortChange: (columnId: string, sort: SortKey | undefined) => void;
  onTaskClick: (task: Task) => void;
}

const COLUMN_ACCENTS: Record<string, string> = {
  "to do": "border-t-slate-500",
  "in progress": "border-t-sky-500",
  done: "border-t-emerald-500",
};

function accentForTitle(title: string) {
  const key = title.toLowerCase();
  return (
    COLUMN_ACCENTS[key] ??
    Object.entries(COLUMN_ACCENTS).find(([k]) => key.includes(k))?.[1] ??
    "border-t-brand-500"
  );
}

export function KanbanColumn({
  column,
  tasks,
  sort,
  dragDisabled,
  onAddTask,
  onSortChange,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const taskIds = tasks.map((t) => t.id);

  return (
    <section
      className={`flex w-72 shrink-0 flex-col rounded-2xl border border-[var(--color-border)] border-t-4 bg-[var(--color-surface-raised)] ${accentForTitle(column.title)}`}
    >
      <header className="space-y-2 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">{column.title}</h2>
            <p className="text-xs text-muted">{tasks.length} tasks</p>
          </div>
          <button
            type="button"
            onClick={() => onAddTask(column.id)}
            className="rounded-lg p-1.5 text-muted transition hover:bg-[var(--color-surface-overlay)] hover:text-brand-500"
            aria-label={`Add task to ${column.title}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <label className="block">
          <span className="sr-only">Sort tasks in {column.title}</span>
          <select
            value={sort ?? ""}
            onChange={(e) =>
              onSortChange(
                column.id,
                e.target.value ? (e.target.value as SortKey) : undefined,
              )
            }
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-xs outline-none focus:border-brand-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value || "manual"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {dragDisabled && (
          <p className="text-[10px] leading-tight text-muted">
            Switch to manual order to drag tasks
          </p>
        )}
      </header>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex min-h-[200px] flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 transition ${
            isOver && !dragDisabled
              ? "rounded-xl bg-brand-500/5 ring-1 ring-brand-500/30"
              : ""
          }`}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              dragDisabled={dragDisabled}
              onClick={() => onTaskClick(task)}
            />
          ))}
          {tasks.length === 0 && (
            <p className="py-8 text-center text-xs text-muted">
              {dragDisabled
                ? "No tasks in this column"
                : "Drop tasks here or add one"}
            </p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
