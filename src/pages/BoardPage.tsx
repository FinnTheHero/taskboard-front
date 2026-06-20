import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as boardsApi from "../api/boards";
import { KanbanBoard } from "../components/KanbanBoard";
import type { Board } from "../types";

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!boardId) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await boardsApi.getBoard(boardId);
        if (!cancelled) setBoard(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load board");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardId]);

  if (loading) {
    return <p className="text-muted">Loading board…</p>;
  }

  if (error || !board || !board.columns?.length) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] p-8 text-center">
        <p className="text-muted">
          {error || "Board not available or you do not have access."}
        </p>
        <Link
          to="/boards"
          className="mt-4 inline-flex items-center gap-2 text-sm text-brand-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to boards
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <Link
        to="/boards"
        className="mb-4 inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        All boards
      </Link>
      <KanbanBoard board={board} />
    </div>
  );
}
