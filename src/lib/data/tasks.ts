import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { formatDisplayDate, isTaskOverdue } from "@/lib/format"
import type { TaskListItem, TaskPriority, TaskStatus } from "@/types/domain"

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    assignee: { select: { id: true; name: true } }
    project: { select: { name: true } }
  }
}>

function mapTask(task: TaskWithRelations): TaskListItem {
  const priority = (task.priority ?? "MEDIUM") as TaskPriority

  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    status: task.status as TaskStatus,
    priority,
    assignee: task.assignee?.name ?? "Unassigned",
    assigneeId: task.assignee?.id ?? null,
    dueDate: formatDisplayDate(task.dueDate),
    overdue: isTaskOverdue(task.dueDate, task.status as TaskStatus),
  }
}

const taskInclude = {
  assignee: { select: { id: true, name: true } },
  project: { select: { name: true } },
} as const

export async function listTasks(filters?: {
  projectId?: string
  status?: TaskStatus
  assigneeId?: string
}): Promise<TaskListItem[]> {
  const tasks = await prisma.task.findMany({
    where: {
      ...(filters?.projectId ? { projectId: filters.projectId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: taskInclude,
  })

  return tasks.map(mapTask)
}

export async function getTasksByProjectId(projectId: string): Promise<TaskListItem[]> {
  return listTasks({ projectId })
}

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

export async function updateTaskStatus(id: string, status: TaskStatus) {
  return prisma.task.update({
    where: { id },
    data: { status },
  })
}

export async function getProjectNameMap(): Promise<Map<string, string>> {
  const projects = await prisma.project.findMany({ select: { id: true, name: true } })
  return new Map(projects.map((p) => [p.id, p.name]))
}

export function getProjectNameFromMap(map: Map<string, string>, projectId: string): string {
  return map.get(projectId) ?? "Unknown project"
}
