import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Shield, UserMinus, UserPlus } from "lucide-react";
import * as boardsApi from "../api/boards";
import * as groupsApi from "../api/groups";
import { useGroup } from "../context/GroupContext";
import type { BoardMemberEntry, BoardSummary, GroupMember } from "../types";

export function GroupManagePage() {
  const { membership, isManager } = useGroup();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [boardMembers, setBoardMembers] = useState<BoardMemberEntry[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!isManager) return <Navigate to="/boards" replace />;

  useEffect(() => {
    Promise.all([groupsApi.listMembers(), boardsApi.listBoards()])
      .then(([memberList, boardList]) => {
        setMembers(memberList);
        setBoards(boardList);
        if (boardList[0]) setSelectedBoardId(boardList[0].id);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load data"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedBoardId) {
      setBoardMembers([]);
      return;
    }
    boardsApi
      .listBoardMembers(selectedBoardId)
      .then(setBoardMembers)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load board access"),
      );
  }, [selectedBoardId]);

  async function handleAddMember(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    try {
      const member = await groupsApi.addMember(email.trim());
      setMembers((prev) => [...prev, member]);
      setEmail("");
      setMessage(`Added ${member.user.email}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    }
  }

  async function handleRemoveMember(userId: string) {
    setError("");
    try {
      await groupsApi.removeMember(userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      setMessage("Member removed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  }

  async function toggleBoardAccess(userId: string, hasAccess: boolean) {
    if (!selectedBoardId) return;
    setError("");
    try {
      if (hasAccess) {
        await boardsApi.revokeBoardAccess(selectedBoardId, userId);
        setBoardMembers((prev) => prev.filter((m) => m.userId !== userId));
      } else {
        const entry = await boardsApi.grantBoardAccess(selectedBoardId, userId);
        setBoardMembers((prev) => [...prev, entry]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update board access");
    }
  }

  const accessUserIds = new Set(boardMembers.map((m) => m.userId));

  return (
    <div>
      <Link
        to="/boards"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to boards
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-500" />
          <h1 className="text-2xl font-bold">Manage group</h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          {membership?.group.name} · Manager tools
        </p>
      </header>

      {message && (
        <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5">
            <h2 className="mb-4 font-semibold">Group members</h2>
            <form onSubmit={handleAddMember} className="mb-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700"
              >
                <UserPlus className="h-4 w-4" />
                Add
              </button>
            </form>
            <ul className="space-y-2">
              {members.map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{member.user.name}</p>
                    <p className="text-xs text-muted">{member.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase text-muted">{member.role}</span>
                    {member.role === "MEMBER" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.userId)}
                        className="rounded p-1 text-muted hover:bg-rose-500/10 hover:text-rose-400"
                        title="Remove member"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5">
            <h2 className="mb-4 font-semibold">Board access</h2>
            <select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.title}
                </option>
              ))}
            </select>
            <ul className="space-y-2">
              {members.map((member) => {
                const hasAccess = accessUserIds.has(member.userId);
                return (
                  <li
                    key={member.userId}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2"
                  >
                    <span className="text-sm">{member.user.name}</span>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={hasAccess}
                        onChange={() =>
                          void toggleBoardAccess(member.userId, hasAccess)
                        }
                      />
                      Access
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
