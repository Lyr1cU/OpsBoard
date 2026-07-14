/**
 * Core domain types for OpsBoard UI and data layers.
 *
 * These describe list/card shapes returned by src/lib/data/* — not raw Prisma rows.
 * Dates are pre-formatted strings for display; counts and overdue flags are computed
 * in data fetchers so components stay presentational.
 */

export type ProjectStatus = "ACTIVE" | "ARCHIVED"
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH"

/** Project summary for boards, cards, and dropdowns — includes aggregate task stats. */
export type ProjectListItem = {
  id: string
  name: string
  client: string
  description: string
  status: ProjectStatus
  createdAt: string
  taskCount: number
  openTasks: number
  members: string[]
}

/** Task row for tables and kanban — assignee is display name; assigneeId for forms. */
export type TaskListItem = {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  assigneeId: string | null
  dueDate: string
  dueDateInput: string
  overdue: boolean
}

/** Minimal user record for assignee pickers and filters. */
export type UserOption = {
  id: string
  name: string
}

/** Session user passed into client boards for RBAC-aware UI. */
export type CurrentUserView = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "MEMBER"
}
