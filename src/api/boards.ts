import { api } from "./client";
import type { Board } from "../types";

export function listBoards() {
  return api<Board[]>("/boards");
}

export function createBoard(title: string) {
  return api<Board>("/boards", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}
