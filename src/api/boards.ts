import { api } from "./client";
import type {
  ArchiveCompletedResult,
  Board,
  BoardMemberEntry,
  BoardSummary,
} from "../types";

export function listBoards() {
  return api<BoardSummary[]>("/boards");
}

export function getBoard(boardId: string) {
  return api<Board>(`/boards/${boardId}`);
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

export function listBoardMembers(boardId: string) {
  return api<BoardMemberEntry[]>(`/boards/${boardId}/members`);
}

export function grantBoardAccess(boardId: string, userId: string) {
  return api<BoardMemberEntry>(`/boards/${boardId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function revokeBoardAccess(boardId: string, userId: string) {
  return api<void>(`/boards/${boardId}/members/${userId}`, {
    method: "DELETE",
  });
}
