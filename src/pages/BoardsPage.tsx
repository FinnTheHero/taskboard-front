import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Lock, Plus, Settings, BarChart3 } from "lucide-react";
import * as boardsApi from "../api/boards";
import { useGroup } from "../context/GroupContext";
import type { BoardSummary } from "../types";

export function BoardsPage() {
  const { membership, isManager } = useGroup();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    boardsApi
      .listBoards()
      .then(setBoards)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load boards"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError("");
    try {
      const board = await boardsApi.createBoard(title.trim());
      setBoards((prev) => [
        {
          id: board.id,
          title: board.title,
          groupId: board.groupId ?? membership!.group.id,
          createdAt: board.createdAt,
          hasAccess: true,
        },
        ...prev,
      ]);
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {membership?.group.name ?? "Your boards"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            All boards in your group · open only those you have access to
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/group/analytics"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-muted transition hover:border-violet-500/40 hover:text-text"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
          {isManager && (
            <Link
              to="/group/manage"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-muted transition hover:border-brand-500/40 hover:text-text"
            >
              <Settings className="h-4 w-4" />
              Manage group
            </Link>
          )}
        </div>
      </header>

      {isManager && (
        <form
          onSubmit={handleCreate}
          className="mb-8 flex flex-wrap gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New board title…"
            className="min-w-[200px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {creating ? "Creating…" : "Create board"}
          </button>
        </form>
      )}

      {error && (
        <p className="mb-4 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted">Loading boards…</p>
      ) : boards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center">
          <LayoutGrid className="mx-auto mb-3 h-10 w-10 text-muted" />
          <p className="text-muted">
            {isManager
              ? "No boards yet. Create your first one above."
              : "No boards in this group yet."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) =>
            board.hasAccess ? (
              <li key={board.id}>
                <Link
                  to={`/boards/${board.id}`}
                  className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 transition hover:border-brand-500/50 hover:shadow-lg"
                >
                  <h2 className="font-semibold">{board.title}</h2>
                  <p className="mt-1 text-xs text-muted">Open board →</p>
                </Link>
              </li>
            ) : (
              <li key={board.id}>
                <div className="block rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 p-5 opacity-75">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-muted">{board.title}</h2>
                    <Lock className="h-4 w-4 shrink-0 text-muted" />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    No access — ask a manager to grant permission
                  </p>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
