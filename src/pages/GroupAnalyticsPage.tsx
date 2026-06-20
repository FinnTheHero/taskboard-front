import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as groupsApi from "../api/groups";
import { useGroup } from "../context/GroupContext";
import type { GroupStats } from "../types";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#64748b",
  MEDIUM: "#0ea5e9",
  HIGH: "#f59e0b",
  CRITICAL: "#f43f5e",
};

const CHART_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e"];

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function GroupAnalyticsPage() {
  const { membership } = useGroup();
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    groupsApi
      .getGroupStats()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load analytics"),
      )
      .finally(() => setLoading(false));
  }, []);

  const priorityData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.tasksByPriority).map(([priority, count]) => ({
      priority,
      count,
    }));
  }, [stats]);

  const columnData = useMemo(() => {
    if (!stats) return [];
    const merged = new Map<string, number>();
    for (const entry of stats.tasksByColumn) {
      merged.set(entry.column, (merged.get(entry.column) ?? 0) + entry.count);
    }
    return Array.from(merged.entries()).map(([column, count]) => ({
      column,
      count,
    }));
  }, [stats]);

  return (
    <div>
      <Link
        to="/boards"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to boards
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-400" />
            <h1 className="text-2xl font-bold">Group analytics</h1>
          </div>
          <p className="mt-1 text-sm text-muted">
            {membership?.group.name ?? stats?.groupName} · Tasks across boards
            you can access
          </p>
        </div>
      </header>

      {error && (
        <p className="mb-4 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted">Loading analytics…</p>
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total tasks" value={stats.totalTasks} />
            <StatCard
              label="Completion rate"
              value={`${stats.completionRate}%`}
              hint={`${stats.doneCount} done`}
            />
            <StatCard
              label="Overdue"
              value={stats.overdueCount}
              hint="Excludes Done column"
            />
            <StatCard
              label="Boards"
              value={`${stats.accessibleBoardCount}/${stats.boardCount}`}
              hint="Accessible in your group"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Tasks by priority">
              {priorityData.length === 0 ? (
                <p className="text-sm text-muted">No prioritized tasks yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="count"
                      nameKey="priority"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                    >
                      {priorityData.map((entry) => (
                        <Cell
                          key={entry.priority}
                          fill={
                            PRIORITY_COLORS[entry.priority] ?? CHART_COLORS[0]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface-raised)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Tasks by column">
              {columnData.length === 0 ? (
                <p className="text-sm text-muted">No tasks yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={columnData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="column" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface-raised)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Board completion">
              {stats.byBoard.length === 0 ? (
                <p className="text-sm text-muted">
                  No accessible boards with data.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, stats.byBoard.length * 48)}>
                  <BarChart
                    data={stats.byBoard}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      unit="%"
                    />
                    <YAxis
                      type="category"
                      dataKey="title"
                      width={100}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface-raised)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                      formatter={(value, _name, item) => [
                        `${value}% · ${item.payload.totalTasks} tasks · ${item.payload.overdueCount} overdue`,
                        "Completion",
                      ]}
                    />
                    <Bar dataKey="completionRate" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Team workload">
              {stats.byAssignee.length === 0 ? (
                <p className="text-sm text-muted">No assigned tasks yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.byAssignee}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface-raised)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                      formatter={(value, name) => [
                        value,
                        name === "taskCount" ? "Tasks" : "Overdue",
                      ]}
                    />
                    <Bar dataKey="taskCount" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="overdueCount" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <ChartCard title="Average time in column (hours)">
            {stats.avgTimeInColumn.length === 0 ? (
              <p className="text-sm text-muted">No dwell-time data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left text-muted">
                      <th className="pb-2 pr-4 font-medium">Column</th>
                      <th className="pb-2 font-medium">Avg hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.avgTimeInColumn.map((row) => (
                      <tr
                        key={row.column}
                        className="border-b border-[var(--color-border)]/50"
                      >
                        <td className="py-2 pr-4">{row.column}</td>
                        <td className="py-2">{row.avgHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>

          <p className="text-xs text-muted">
            {stats.unassignedCount} unassigned task
            {stats.unassignedCount === 1 ? "" : "s"} across accessible boards.
          </p>
        </div>
      ) : null}
    </div>
  );
}
