/**
 * Project data access layer — scoped to projects the user can access.
 */

import type { Prisma, ProjectStatus as DbProjectStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { formatDisplayDate } from "@/lib/format"
import { ensureOwnerMembership } from "@/lib/data/memberships"
import type { ProjectListItem, ProjectStatus } from "@/types/domain"

type ProjectListRow = Prisma.ProjectGetPayload<{
  select: {
    id: true
    name: true
    clientName: true
    description: true
    status: true
    createdAt: true
    ownerId: true
    _count: { select: { tasks: true } }
    tasks: {
      select: {
        id: true
        assignee: { select: { name: true } }
      }
    }
  }
}>

function mapProjectStatus(status: DbProjectStatus): ProjectStatus {
  return status
}

function mapProject(project: ProjectListRow): ProjectListItem {
  const members = [
    ...new Set(
      project.tasks
        .map((t) => t.assignee?.name)
        .filter((name): name is string => Boolean(name)),
    ),
  ]

  return {
    id: project.id,
    name: project.name,
    client: project.clientName ?? "—",
    description: project.description ?? "",
    status: mapProjectStatus(project.status),
    createdAt: formatDisplayDate(project.createdAt),
    taskCount: project._count.tasks,
    openTasks: project.tasks.length,
    members,
  }
}

const projectSelect = {
  id: true,
  name: true,
  clientName: true,
  description: true,
  status: true,
  createdAt: true,
  ownerId: true,
  _count: { select: { tasks: true } },
  tasks: {
    where: { status: { not: "DONE" } },
    select: {
      id: true,
      assignee: { select: { name: true } },
    },
  },
} as const

export async function listProjectOptions(
  accessibleProjectIds: string[],
): Promise<{ id: string; name: string; status: ProjectStatus }[]> {
  if (accessibleProjectIds.length === 0) return []
  return prisma.project.findMany({
    where: { id: { in: accessibleProjectIds } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, status: true },
  })
}

export async function listProjects(accessibleProjectIds: string[]): Promise<ProjectListItem[]> {
  if (accessibleProjectIds.length === 0) return []
  const projects = await prisma.project.findMany({
    where: { id: { in: accessibleProjectIds } },
    orderBy: { createdAt: "desc" },
    select: projectSelect,
  })
  return projects.map(mapProject)
}

export async function getProjectById(id: string): Promise<ProjectListItem | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    select: projectSelect,
  })
  return project ? mapProject(project) : null
}

export async function createProject(input: {
  name: string
  clientName?: string
  description?: string
  ownerId: string
}) {
  const project = await prisma.project.create({
    data: {
      name: input.name.trim(),
      clientName: input.clientName?.trim() || null,
      description: input.description?.trim() || null,
      ownerId: input.ownerId,
    },
  })
  await ensureOwnerMembership(project.id, input.ownerId)
  return project
}

export async function updateProject(
  id: string,
  input: {
    name?: string
    clientName?: string
    description?: string
    status?: ProjectStatus
  },
) {
  return prisma.project.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.clientName !== undefined ? { clientName: input.clientName.trim() || null } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  })
}

export async function archiveProject(id: string) {
  return updateProject(id, { status: "ARCHIVED" })
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } })
}
