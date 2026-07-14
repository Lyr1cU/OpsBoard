/**
 * Shared presentation helpers for task-related UI.
 *
 * Centralizes initials derivation, human-readable status/priority labels, and
 * Tailwind class maps so tables, cards, and mobile lists render tasks with a
 * consistent visual language.
 */
import type { TaskPriority, TaskStatus } from "@/types/domain"

/** Derives up to two uppercase initials from a display name (e.g. "Jordan Diaz" → "JD"). */
export function taskInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

/** Converts enum values like IN_PROGRESS to a spaced label for display. */
export function formatTaskStatus(status: TaskStatus) {
  return status.replace("_", " ")
}

/** Title-cases priority enum values (e.g. MEDIUM → Medium). */
export function formatTaskPriority(priority: TaskPriority) {
  return priority.charAt(0) + priority.slice(1).toLowerCase()
}

/** Badge color tokens keyed by workflow status. */
export const taskStatusStyles: Record<TaskStatus, string> = {
  TODO: "border-border bg-muted text-muted-foreground",
  IN_PROGRESS: "border-primary/20 bg-primary/10 text-primary",
  DONE: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
}

/** Badge color tokens keyed by priority level. */
export const taskPriorityStyles: Record<TaskPriority, string> = {
  LOW: "border-border bg-muted text-muted-foreground",
  MEDIUM: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  HIGH: "border-destructive/20 bg-destructive/10 text-destructive",
}

/** Shared select styling for inline task filters and form dropdowns. */
export const selectClassName =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Shared single-line input styling for dialogs and forms. */
export const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Shared multi-line input styling for project descriptions and notes. */
export const textareaClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
