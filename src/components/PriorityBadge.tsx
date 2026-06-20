import { PRIORITY_OPTIONS, PRIORITY_STYLES } from "../lib/priority";
import type { Priority } from "../types";

interface PriorityBadgeProps {
  priority: Priority | null | undefined;
  size?: "sm" | "md";
}

export function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
  if (!priority) return null;

  const label =
    PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ?? priority;
  const styles = PRIORITY_STYLES[priority];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${styles.badge} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}
