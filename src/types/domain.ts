export type ProjectStatus = "ACTIVE" | "ARCHIVED"
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH"

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

export type TaskListItem = {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  assigneeId: string | null
  dueDate: string
  overdue: boolean
}

export type UserOption = {
  id: string
  name: string
}
