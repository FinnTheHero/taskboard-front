import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isPast, isToday } from "date-fns";
import { Calendar, GripVertical } from "lucide-react";
import { PriorityBadge } from "./PriorityBadge";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  dragDisabled?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, dragDisabled, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task, columnId: task.columnId },
    disabled: dragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const overdue = deadlineDate && isPast(deadlineDate) && !isToday(deadlineDate);
  const dueToday = deadlineDate && isToday(deadlineDate);

  return (
    <article
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`group cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3 shadow-sm transition hover:border-brand-500/40 hover:shadow-md ${
        isDragging ? "z-10 opacity-50" : ""
      } ${dragDisabled ? "cursor-default" : ""}`}
    >
      <div className="mb-2 flex items-start gap-2">
        {!dragDisabled && (
          <button
            type="button"
            className="mt-0.5 shrink-0 cursor-grab text-muted opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
            aria-label="Drag task"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <h3 className="flex-1 text-sm font-semibold leading-snug text-text">
          {task.title}
        </h3>
      </div>

      {task.description && (
        <p
          className={`mb-2 line-clamp-2 text-xs text-muted ${dragDisabled ? "" : "pl-6"}`}
        >
          {task.description}
        </p>
      )}

      <div
        className={`flex flex-wrap items-center gap-2 ${dragDisabled ? "" : "pl-6"}`}
      >
        <PriorityBadge priority={task.priority} />
        {task.assignee && (
          <span className="text-xs text-muted">{task.assignee.name}</span>
        )}
        {deadlineDate && (
          <span
            className={`inline-flex items-center gap-1 text-xs ${
              overdue
                ? "text-rose-400"
                : dueToday
                  ? "text-amber-400"
                  : "text-muted"
            }`}
          >
            <Calendar className="h-3 w-3" />
            {format(deadlineDate, "MMM d")}
            {overdue && " · overdue"}
            {dueToday && !overdue && " · today"}
          </span>
        )}
      </div>
    </article>
  );
}
