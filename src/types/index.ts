export type {
  ProjectListItem as Project,
  ProjectStatus,
  TaskListItem as Task,
  TaskStatus,
  TaskPriority,
  UserOption,
} from "@/types/domain"

export type Role = "ADMIN" | "MEMBER"
export type DbTaskStatus = "TODO" | "IN_PROGRESS" | "DONE"
