import { differenceInCalendarDays, isPast, isToday } from "date-fns";
import { useMemo, useState } from "react";
import { FocusTaskRow, type FocusTask } from "./FocusTaskRow";
import type { BoardMemberEntry } from "../types";

type FocusTab = "attention" | "assignee";

interface BoardFocusPanelProps {
  tasks: FocusTask[];
  assignableMembers: BoardMemberEntry[];
  currentUserId: string;
  onTaskClick: (task: FocusTask) => void;
}

export function BoardFocusPanel({
  tasks,
  assignableMembers,
  currentUserId,
  onTaskClick,
}: BoardFocusPanelProps) {
  const [tab, setTab] = useState<FocusTab>("attention");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const attentionTasks = useMemo(() => {
    const now = new Date();
    return tasks
      .filter((task) => {
        if (task.columnTitle === "Done") return false;
        if (!task.deadline) return false;
        const deadline = new Date(task.deadline);
        if (isPast(deadline) && !isToday(deadline)) return true;
        const daysUntil = differenceInCalendarDays(deadline, now);
        return daysUntil >= 0 && daysUntil <= 7;
      })
      .sort((a, b) => {
        const da = new Date(a.deadline!).getTime();
        const db = new Date(b.deadline!).getTime();
        return da - db;
      });
  }, [tasks]);

  const filteredByAssignee = useMemo(() => {
    if (assigneeFilter === "all") return tasks;
    if (assigneeFilter === "unassigned") {
      return tasks.filter((t) => !t.assigneeId);
    }
    if (assigneeFilter === "me") {
      return tasks.filter((t) => t.assigneeId === currentUserId);
    }
    return tasks.filter((t) => t.assigneeId === assigneeFilter);
  }, [tasks, assigneeFilter, currentUserId]);

  const list =
    tab === "attention" ? attentionTasks : filteredByAssignee;

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)] border-t-violet-500 border-t-4 bg-violet-500/5">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-sm font-semibold text-violet-300">Board focus</h2>
        <p className="mt-0.5 text-xs text-muted">
          Deadlines and assignments at a glance
        </p>
      </div>

      <div className="flex border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setTab("attention")}
          className={`flex-1 px-3 py-2 text-xs font-medium transition ${
            tab === "attention"
              ? "border-b-2 border-violet-500 text-violet-300"
              : "text-muted hover:text-text"
          }`}
        >
          Needs attention
        </button>
        <button
          type="button"
          onClick={() => setTab("assignee")}
          className={`flex-1 px-3 py-2 text-xs font-medium transition ${
            tab === "assignee"
              ? "border-b-2 border-violet-500 text-violet-300"
              : "text-muted hover:text-text"
          }`}
        >
          By assignee
        </button>
      </div>

      {tab === "assignee" && (
        <div className="border-b border-[var(--color-border)] px-3 py-2">
          <label className="block">
            <span className="sr-only">Filter by assignee</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-xs outline-none focus:border-violet-500"
            >
              <option value="all">All assignees</option>
              <option value="unassigned">Unassigned</option>
              <option value="me">Me</option>
              {assignableMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {list.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">
            {tab === "attention"
              ? "No urgent deadlines"
              : "No tasks match this filter"}
          </p>
        ) : (
          list.map((task) => (
            <FocusTaskRow
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
