import { api } from "./client";
import type { GroupMember, GroupMembership, GroupStats } from "../types";

export function getMe() {
  return api<GroupMembership | { group: null; role: null }>("/groups/me");
}

export function joinGroup(joinCode: string) {
  return api<GroupMembership>("/groups/join", {
    method: "POST",
    body: JSON.stringify({ joinCode }),
  });
}

export function listMembers() {
  return api<GroupMember[]>("/groups/members");
}

export function addMember(email: string) {
  return api<GroupMember>("/groups/members", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function removeMember(userId: string) {
  return api<void>(`/groups/members/${userId}`, {
    method: "DELETE",
  });
}

export function getGroupStats() {
  return api<GroupStats>("/groups/stats");
}
