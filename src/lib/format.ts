/**
 * Date formatting and task due-date helpers for OpsBoard.
 *
 * Centralizes locale-aware display and overdue logic so boards, tables, and
 * mobile lists show consistent copy. Uses calendar-day comparison (midnight
 * local time) to avoid timezone edge cases around due dates.
 */

import type { TaskStatus } from "@/types/domain"

/** Human-readable date for tables and detail views; em dash when missing. */
export function formatDisplayDate(date: Date | null | undefined): string {
  if (!date) return "—"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/** HTML date input value (YYYY-MM-DD) or empty string when missing. */
export function formatDateInput(date: Date | null | undefined): string {
  if (!date) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * A task is overdue only if it has a due date, is not DONE, and that date
 * is before today — completed work should not show as late.
 */
export function isTaskOverdue(dueDate: Date | null | undefined, status: TaskStatus): boolean {
  if (!dueDate || status === "DONE") return false
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Start of today in local timezone
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0) // Compare calendar days, not exact timestamps
  return due < today
}

/**
 * Parse an HTML date input value (YYYY-MM-DD) into a Date at noon UTC offset
 * so the chosen calendar day does not shift across timezones when stored.
 */
export function parseDateInput(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = new Date(`${trimmed}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Friendly relative due copy for cards and mobile — "Tomorrow", "3 days overdue", etc.
 * Falls back to formatDisplayDate for dates more than a week out.
 */
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
