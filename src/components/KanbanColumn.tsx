import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { Column, Task } from "../types";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
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

export function KanbanColumn({ column, tasks, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      className={`flex w-72 shrink-0 flex-col rounded-2xl border border-[var(--color-border)] border-t-4 bg-[var(--color-surface-raised)] ${accentForTitle(column.title)}`}
    >
      <header className="flex items-center justify-between px-4 py-3">
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
      </header>

      <div
        ref={setNodeRef}
        className={`flex min-h-[200px] flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 transition ${
          isOver ? "rounded-xl bg-brand-500/5 ring-1 ring-brand-500/30" : ""
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="py-8 text-center text-xs text-muted">
            Drop tasks here or add one
          </p>
        )}
      </div>
    </section>
  );
}
