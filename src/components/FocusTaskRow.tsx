import { format, isPast, isToday } from "date-fns";
import { PriorityBadge } from "./PriorityBadge";
import type { Task } from "../types";

export interface FocusTask extends Task {
  columnTitle: string;
}

interface FocusTaskRowProps {
  task: FocusTask;
  onClick: () => void;
}

export function FocusTaskRow({ task, onClick }: FocusTaskRowProps) {
  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const overdue =
    deadlineDate && isPast(deadlineDate) && !isToday(deadlineDate);
  const dueSoon =
    deadlineDate &&
    !overdue &&
    deadlineDate.getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left transition hover:border-violet-500/40 hover:bg-violet-500/5"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
          {task.title}
        </p>
        {task.priority && <PriorityBadge priority={task.priority} />}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-[var(--color-surface-overlay)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
          {task.columnTitle}
        </span>
        {deadlineDate && (
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
              overdue
                ? "bg-rose-500/15 text-rose-400"
                : dueSoon
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-[var(--color-surface-overlay)] text-muted"
            }`}
          >
            {overdue ? "Overdue · " : dueSoon ? "Due soon · " : ""}
            {format(deadlineDate, "MMM d")}
          </span>
        )}
        <span className="text-[10px] text-muted">
          {task.assignee?.name ?? "Unassigned"}
        </span>
      </div>
    </button>
  );
}
