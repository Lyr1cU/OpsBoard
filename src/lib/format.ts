import type { TaskStatus } from "@/types/domain"

export function formatDisplayDate(date: Date | null | undefined): string {
  if (!date) return "—"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function isTaskOverdue(dueDate: Date | null | undefined, status: TaskStatus): boolean {
  if (!dueDate || status === "DONE") return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < today
}

export function parseDateInput(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = new Date(`${trimmed}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatRelativeDue(date: Date | null | undefined, overdue: boolean): string {
  if (!date) return "No due date"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(date)
  due.setHours(0, 0, 0, 0)

  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (overdue || diffDays < 0) {
    const days = Math.abs(diffDays)
    if (days === 0) return "Due today"
    if (days === 1) return "1 day overdue"
    return `${days} days overdue`
  }

  if (diffDays === 0) return "Due today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays <= 7) return `In ${diffDays} days`

  return formatDisplayDate(date)
}
