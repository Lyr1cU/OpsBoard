/**
 * Public type barrel for OpsBoard application code.
 *
 * Re-exports UI-facing shapes from domain.ts under shorter aliases (Project, Task)
 * and adds a few app-specific types (Role, DbTaskStatus) used by actions and API layers.
 */

export type {
  ProjectListItem as Project,
  ProjectStatus,
  TaskListItem as Task,
  TaskStatus,
  TaskPriority,
  UserOption,
} from "@/types/domain"

/** Mirrors prisma/schema.prisma Role enum for authorization checks. */
export type Role = "ADMIN" | "MEMBER"

/** Raw task status strings as stored in the database (same values as TaskStatus). */
export type DbTaskStatus = "TODO" | "IN_PROGRESS" | "DONE"
