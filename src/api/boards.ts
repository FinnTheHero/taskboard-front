import { api } from "./client";
import type { ArchiveCompletedResult, Board } from "../types";

export function listBoards() {
  return api<Board[]>("/boards");
}

export function createBoard(title: string) {
  return api<Board>("/boards", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function archiveCompleted(boardId: string) {
  return api<ArchiveCompletedResult>(`/boards/${boardId}/archive-completed`, {
    method: "POST",
  });
}

export function transferOwnership(boardId: string, newOwnerId: string) {
  return api<Board>(`/boards/${boardId}/transfer-ownership`, {
    method: "POST",
    body: JSON.stringify({ newOwnerId }),
  });
}
