/**
 * Task data access layer for OpsBoard.
 *
 * Prisma queries with consistent relation includes, mapping DB rows to domain
 * `TaskListItem` (formatted dates, overdue flag, display names). Shared `taskInclude`
 * keeps list/detail queries aligned.
 */

import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { formatDateInput, formatDisplayDate, isTaskOverdue } from "@/lib/format"
import type { TaskListItem, TaskPriority, TaskStatus } from "@/types/domain"

/** Inferred shape when assignee + project name are loaded with each task. */
type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    assignee: { select: { id: true; name: true } }
    project: { select: { name: true } }
  }
}>

/** Maps a Prisma task row to the UI-facing list item contract. */
function mapTask(task: TaskWithRelations): TaskListItem {
  const priority = (task.priority ?? "MEDIUM") as TaskPriority

  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description ?? "",
    status: task.status as TaskStatus,
    priority,
    assignee: task.assignee?.name ?? "Unassigned",
    assigneeId: task.assignee?.id ?? null,
    dueDate: formatDisplayDate(task.dueDate),
    dueDateInput: formatDateInput(task.dueDate),
    overdue: isTaskOverdue(task.dueDate, task.status as TaskStatus),
  }
}

/** Reusable include fragment so every list query returns the same relation shape. */
const taskInclude = {
  assignee: { select: { id: true, name: true } },
  project: { select: { name: true } },
} as const

/**
 * List tasks with optional filters. Order: soonest due first, then newest created.
 * When `accessibleProjectIds` is provided, results are limited to that set.
 */
export async function listTasks(filters?: {
  projectId?: string
  status?: TaskStatus
  assigneeId?: string
  accessibleProjectIds?: string[]
}): Promise<TaskListItem[]> {
  const accessible = filters?.accessibleProjectIds

  if (accessible !== undefined) {
    if (accessible.length === 0) return []
    if (filters?.projectId && !accessible.includes(filters.projectId)) return []
  }

  const tasks = await prisma.task.findMany({
    where: {
      ...(filters?.projectId
        ? { projectId: filters.projectId }
        : accessible
          ? { projectId: { in: accessible } }
          : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: taskInclude,
  })

  return tasks.map(mapTask)
}

/** Convenience wrapper for project detail pages. */
export async function getTasksByProjectId(projectId: string): Promise<TaskListItem[]> {
  return listTasks({ projectId })
}

/** Load one task with relations; null if missing. */
export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: taskInclude,
  })
}

/** Insert a new task; trims strings and applies defaults for priority and nullables. */
export async function createTask(input: {
  projectId: string
  title: string
  description?: string
  priority?: TaskPriority
  dueDate?: Date | null
  assigneeId?: string | null
}) {
  return prisma.task.create({
    data: {
      projectId: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate ?? null,
      assigneeId: input.assigneeId || null,
    },
  })
}

/** Single-field status update for kanban and quick actions. */
export async function updateTaskStatus(id: string, status: TaskStatus) {
  return prisma.task.update({
    where: { id },
    data: { status },
  })
}

/** Full task edit used by the edit dialog. */
export async function updateTask(
  id: string,
  input: {
    title?: string
    description?: string
    priority?: TaskPriority
    dueDate?: Date | null
    assigneeId?: string | null
    projectId?: string
    status?: TaskStatus
  },
) {
  return prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() || null } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId || null } : {}),
      ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  })
}

/** Hard-delete a task row. */
export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } })
}

/** Build id → name lookup for batch labeling (avoids N+1 when rendering many tasks). */
export async function getProjectNameMap(): Promise<Map<string, string>> {
  const projects = await prisma.project.findMany({ select: { id: true, name: true } })
  return new Map(projects.map((p) => [p.id, p.name]))
}

/** Safe resolver when a project id might be missing from the map (deleted project, etc.). */
export function getProjectNameFromMap(map: Map<string, string>, projectId: string): string {
  return map.get(projectId) ?? "Unknown project"
}
