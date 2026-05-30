import type { SortKey } from "../types";

export const SORT_OPTIONS: { value: SortKey | ""; label: string }[] = [
  { value: "", label: "Manual order" },
  { value: "priority", label: "Priority" },
  { value: "deadline", label: "Deadline" },
  { value: "created", label: "Created" },
  { value: "assignee", label: "Assignee" },
];
