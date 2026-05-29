import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Plus } from "lucide-react";
import * as boardsApi from "../api/boards";
import type { Board } from "../types";

export function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
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
      setBoards((prev) => [board, ...prev]);
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Your boards</h1>
        <p className="mt-1 text-sm text-muted">
          Kanban workspaces for tasks, deadlines, and priorities
        </p>
      </header>

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
          <p className="text-muted">No boards yet. Create your first one above.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                to={`/boards/${board.id}`}
                state={{ board }}
                className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 transition hover:border-brand-500/50 hover:shadow-lg"
              >
                <h2 className="font-semibold">{board.title}</h2>
                <p className="mt-1 text-xs text-muted">
                  {(board.columns?.length ?? 3)} columns · Open board →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
