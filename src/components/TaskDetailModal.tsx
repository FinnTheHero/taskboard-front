import { format } from "date-fns";
import { useState, type FormEvent } from "react";
import { MessageSquare, X } from "lucide-react";
import * as tasksApi from "../api/tasks";
import { PriorityBadge } from "./PriorityBadge";
import type { BoardMemberEntry, Comment, Task } from "../types";

interface TaskDetailModalProps {
  task: Task;
  assignableMembers: BoardMemberEntry[];
  currentUserId: string;
  onClose: () => void;
  onUpdated: (task: Task) => void;
}

export function TaskDetailModal({
  task,
  assignableMembers,
  currentUserId,
  onClose,
  onUpdated,
}: TaskDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [assigning, setAssigning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAssignChange(nextAssigneeId: string) {
    setAssigneeId(nextAssigneeId);
    setAssigning(true);
    setError("");
    try {
      const updated = await tasksApi.assignTask(
        task.id,
        nextAssigneeId || null,
      );
      onUpdated(updated);
    } catch (err) {
      setAssigneeId(task.assigneeId ?? "");
      setError(err instanceof Error ? err.message : "Failed to update assignee");
    } finally {
      setAssigning(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;

    setSaving(true);
    setError("");
    try {
      const comment = await tasksApi.createComment(task.id, text);
      setComments((prev) => [...prev, comment]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSaving(false);
    }
  }

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
      >
        <div className="flex items-start justify-between border-b border-[var(--color-border)] p-6 pb-4">
          <div className="min-w-0 flex-1 pr-4">
            <h2 id="task-detail-title" className="text-lg font-semibold">
              {task.title}
            </h2>
            {task.description && (
              <p className="mt-2 text-sm text-muted">{task.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PriorityBadge priority={task.priority} />
              {deadlineDate && (
                <span className="text-xs text-muted">
                  Due {format(deadlineDate, "MMM d, yyyy")}
                </span>
              )}
            </div>
            <div className="mt-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">
                  Assignee
                </span>
                <div className="flex gap-2">
                  <select
                    value={assigneeId}
                    disabled={assigning}
                    onChange={(e) => handleAssignChange(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none focus:border-brand-500 disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {assignableMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={assigning}
                    onClick={() => handleAssignChange(currentUserId)}
                    className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-muted transition hover:border-brand-500/40 hover:text-text disabled:opacity-50"
                  >
                    Assign to me
                  </button>
                </div>
              </label>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-muted hover:bg-[var(--color-surface-overlay)] hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4 text-brand-500" />
            Comments
          </div>
          <p className="mb-3 text-xs text-muted">
            Comments posted in this session appear below.
          </p>

          {comments.length === 0 ? (
            <p className="mb-4 text-sm text-muted">No comments yet.</p>
          ) : (
            <ul className="mb-4 space-y-3">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
                >
                  <p className="text-sm">{comment.body}</p>
                  <p className="mt-1 text-xs text-muted">
                    {comment.author?.name ?? "User"} ·{" "}
                    {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Add a comment…"
              className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {error && (
              <p className="text-sm text-rose-400" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !body.trim()}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? "Posting…" : "Post comment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
