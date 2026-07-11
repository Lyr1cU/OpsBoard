import type { Prisma, ProjectStatus as DbProjectStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { formatDisplayDate } from "@/lib/format"
import type { ProjectListItem, ProjectStatus } from "@/types/domain"

type ProjectWithTasks = Prisma.ProjectGetPayload<{
  include: {
    tasks: {
      include: { assignee: { select: { name: true } } }
    }
  }
}>

function mapProjectStatus(status: DbProjectStatus): ProjectStatus {
  return status
}

function mapProject(project: ProjectWithTasks): ProjectListItem {
  const openTasks = project.tasks.filter((t) => t.status !== "DONE").length
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
    taskCount: project.tasks.length,
    openTasks,
    members,
  }
}

export async function listProjects(): Promise<ProjectListItem[]> {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        include: { assignee: { select: { name: true } } },
      },
    },
  })

  return projects.map(mapProject)
}

export async function getProjectById(id: string): Promise<ProjectListItem | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { assignee: { select: { name: true } } },
      },
    },
  })

  return project ? mapProject(project) : null
}

export async function createProject(input: {
  name: string
  clientName?: string
  description?: string
}) {
  return prisma.project.create({
    data: {
      name: input.name.trim(),
      clientName: input.clientName?.trim() || null,
      description: input.description?.trim() || null,
    },
  })
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
