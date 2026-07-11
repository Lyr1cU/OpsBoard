import type { TaskPriority, TaskStatus } from "@/types/domain"

export function taskInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export function formatTaskStatus(status: TaskStatus) {
  return status.replace("_", " ")
}

export function formatTaskPriority(priority: TaskPriority) {
  return priority.charAt(0) + priority.slice(1).toLowerCase()
}

export const taskStatusStyles: Record<TaskStatus, string> = {
  TODO: "border-border bg-muted text-muted-foreground",
  IN_PROGRESS: "border-primary/20 bg-primary/10 text-primary",
  DONE: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
}

export const taskPriorityStyles: Record<TaskPriority, string> = {
  LOW: "border-border bg-muted text-muted-foreground",
  MEDIUM: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  HIGH: "border-destructive/20 bg-destructive/10 text-destructive",
}

export const selectClassName =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"

export const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"

export const textareaClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
