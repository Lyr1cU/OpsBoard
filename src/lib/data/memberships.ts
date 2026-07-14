/**
 * Membership / invite data layer for project-scoped Team access.
 */

import { prisma } from "@/lib/prisma"
import type { ProjectMemberRole } from "@prisma/client"
import { projectRoleLabel, roleLabel } from "@/lib/auth/permissions"

export type ProjectTeamMember = {
  membershipId: string
  userId: string
  name: string
  email: string
  accountRole: "ADMIN" | "MEMBER"
  projectRole: ProjectMemberRole | "OWNER"
  projectRoleLabel: string
  isOwner: boolean
}

export type TeamDirectoryRow = {
  userId: string
  name: string
  email: string
  accountRoleLabel: string
  projects: { projectId: string; projectName: string; roleLabel: string }[]
}

/** Ensure owner has a PROJECT_LEAD membership row (idempotent). */
export async function ensureOwnerMembership(projectId: string, ownerId: string) {
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: ownerId } },
    create: { projectId, userId: ownerId, role: "PROJECT_LEAD" },
    update: { role: "PROJECT_LEAD" },
  })
}

/** Assignee dropdown options — owner + project members only. */
export async function listProjectAssigneeOptions(
  projectId: string,
): Promise<{ id: string; name: string }[]> {
  const team = await listProjectTeam(projectId)
  return team
    .map((m) => ({ id: m.userId, name: m.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** True if userId is the owner or a ProjectMember of the project. */
export async function isUserOnProject(projectId: string, userId: string): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      members: { where: { userId }, select: { id: true }, take: 1 },
    },
  })
  if (!project) return false
  if (project.ownerId === userId) return true
  return project.members.length > 0
}

export async function listProjectTeam(projectId: string): Promise<ProjectTeamMember[]> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      owner: { select: { id: true, name: true, email: true, role: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!project) return []

  const rows: ProjectTeamMember[] = []
  const seen = new Set<string>()

  if (project.owner && project.ownerId) {
    rows.push({
      membershipId: `owner:${project.ownerId}`,
      userId: project.owner.id,
      name: project.owner.name,
      email: project.owner.email,
      accountRole: project.owner.role,
      projectRole: "OWNER",
      projectRoleLabel: projectRoleLabel("OWNER"),
      isOwner: true,
    })
    seen.add(project.ownerId)
  }

  for (const m of project.members) {
    if (seen.has(m.userId)) continue
    rows.push({
      membershipId: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      accountRole: m.user.role,
      projectRole: m.role,
      projectRoleLabel: projectRoleLabel(m.role),
      isOwner: false,
    })
    seen.add(m.userId)
  }

  return rows
}

/**
 * Invite an existing user by email. Member accounts may only join as PROJECT_MEMBER.
 * Team Lead accounts may be PROJECT_LEAD or PROJECT_MEMBER.
 */
export async function inviteUserToProject(input: {
  projectId: string
  email: string
  role: ProjectMemberRole
}): Promise<{ ok: true; name: string } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { ok: false, error: "User must register first." }
  }

  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { ownerId: true },
  })
  if (!project) {
    return { ok: false, error: "Project not found." }
  }

  if (user.id === project.ownerId) {
    return { ok: false, error: "Owner is already on this project." }
  }

  let role = input.role
  if (user.role === "MEMBER") {
    role = "PROJECT_MEMBER"
  }

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: input.projectId, userId: user.id } },
    create: { projectId: input.projectId, userId: user.id, role },
    update: { role },
  })

  return { ok: true, name: user.name }
}

export async function removeUserFromProject(
  projectId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) return { ok: false, error: "Project not found." }
  if (project.ownerId === userId) {
    return { ok: false, error: "Cannot remove the project owner." }
  }

  await prisma.projectMember.deleteMany({ where: { projectId, userId } })
  return { ok: true }
}

/** Team directory across all projects the viewer can access. */
export async function listTeamDirectory(accessibleProjectIds: string[]): Promise<TeamDirectoryRow[]> {
  if (accessibleProjectIds.length === 0) return []

  const projects = await prisma.project.findMany({
    where: { id: { in: accessibleProjectIds } },
    select: {
      id: true,
      name: true,
      ownerId: true,
      owner: { select: { id: true, name: true, email: true, role: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
    },
    orderBy: { name: "asc" },
  })

  const byUser = new Map<string, TeamDirectoryRow>()

  function touch(
    user: { id: string; name: string; email: string; role: "ADMIN" | "MEMBER" },
    projectId: string,
    projectName: string,
    roleLabelText: string,
  ) {
    let row = byUser.get(user.id)
    if (!row) {
      row = {
        userId: user.id,
        name: user.name,
        email: user.email,
        accountRoleLabel: roleLabel(user.role),
        projects: [],
      }
      byUser.set(user.id, row)
    }
    if (!row.projects.some((p) => p.projectId === projectId)) {
      row.projects.push({ projectId, projectName, roleLabel: roleLabelText })
    }
  }

  for (const project of projects) {
    if (project.owner) {
      touch(project.owner, project.id, project.name, projectRoleLabel("OWNER"))
    }
    for (const m of project.members) {
      touch(m.user, project.id, project.name, projectRoleLabel(m.role))
    }
  }

  return [...byUser.values()].sort((a, b) => a.name.localeCompare(b.name))
}
