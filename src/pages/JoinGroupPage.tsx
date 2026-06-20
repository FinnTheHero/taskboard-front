import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Users } from "lucide-react";
import * as groupsApi from "../api/groups";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";

export function JoinGroupPage() {
  const { user } = useAuth();
  const { membership, setMembership } = useGroup();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) return <Navigate to="/login" replace />;
  if (membership) return <Navigate to="/boards" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      setError("Enter a 6-digit join code");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await groupsApi.joinGroup(trimmed);
      setMembership(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join group");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Join a group</h1>
            <p className="text-sm text-muted">
              Enter the 6-digit code from your organization
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-brand-500"
          />
          <p className="text-xs text-muted">
            Demo codes: Acme Corp <code className="text-brand-400">100001</code>,
            Beta Labs <code className="text-brand-400">200002</code>
          </p>
          {error && (
            <p className="text-sm text-rose-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Joining…" : "Join group"}
          </button>
        </form>
      </div>
    </div>
  );
}
