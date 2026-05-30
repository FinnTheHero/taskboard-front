import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as boardsApi from "../api/boards";
import { KanbanBoard } from "../components/KanbanBoard";
import type { Board } from "../types";

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const location = useLocation();
  const stateBoard = (location.state as { board?: Board } | null)?.board;
  const [board, setBoard] = useState<Board | null>(
    stateBoard?.id === boardId ? (stateBoard ?? null) : null,
  );
  const [loading, setLoading] = useState(!board);

  useEffect(() => {
    if (board?.columns?.length) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const boards = await boardsApi.listBoards();
        const found = boards.find((b) => b.id === boardId);
        if (!cancelled && found) setBoard(found);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardId, board?.columns?.length]);

  if (loading) {
    return <p className="text-muted">Loading board…</p>;
  }

  if (!board || !board.columns?.length) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] p-8 text-center">
        <p className="text-muted">
          Board columns not available. Open this board from the boards list after
          creating it, or ensure the API returns columns on{" "}
          <code className="text-brand-500">GET /boards</code>.
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
