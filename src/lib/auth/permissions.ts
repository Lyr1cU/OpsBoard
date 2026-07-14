/**
 * Project-scoped access helpers for OpsBoard v3.
 *
 * Account type (ADMIN / MEMBER) controls who may create projects.
 * Variant A Lead vs Member powers are evaluated per project via ownership
 * and ProjectMember.role — never as global admin over the whole database.
 */

import { prisma } from "@/lib/prisma"
import type { Role } from "@/types"
import type { ProjectMemberRole } from "@prisma/client"

/** Authenticated app user shape passed through layouts and into gated UI. */
export type CurrentUser = {
  id: string
  name: string
  email: string
  role: Role
}

export type ProjectAccess = {
  canView: boolean
  isProjectLead: boolean
  isProjectMember: boolean
  projectRole: ProjectMemberRole | "OWNER" | null
}

export const FORBIDDEN_MESSAGE = "You do not have permission to perform this action."

export function roleLabel(role: Role): string {
  return role === "ADMIN" ? "Team Lead" : "Member"
}

export function projectRoleLabel(role: ProjectMemberRole | "OWNER"): string {
  if (role === "OWNER" || role === "PROJECT_LEAD") return "Project Lead"
  return "Member"
}

/** Account-level: only Team Lead accounts may create new projects. */
export function canCreateProject(user: { role: Role }): boolean {
  return user.role === "ADMIN"
}

/** Alias used by UI boards. */
export function canCreateProjects(user: { role: Role }): boolean {
  return canCreateProject(user)
}

/**
 * Project ids the user may see: owned ∪ memberships.
 */
export async function getAccessibleProjectIds(userId: string): Promise<string[]> {
  const [owned, memberships] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true },
    }),
    prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    }),
  ])

  return [...new Set([...owned.map((p) => p.id), ...memberships.map((m) => m.projectId)])]
}

/** Project ids where the user is owner or PROJECT_LEAD (Variant A lead powers). */
export async function getLeadProjectIds(userId: string): Promise<string[]> {
  const [owned, leadMemberships] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true },
    }),
    prisma.projectMember.findMany({
      where: { userId, role: "PROJECT_LEAD" },
      select: { projectId: true },
    }),
  ])

  return [...new Set([...owned.map((p) => p.id), ...leadMemberships.map((m) => m.projectId)])]
}

/** Resolve Variant A powers for a user on one project. */
export async function getProjectAccess(
  userId: string,
  projectId: string,
): Promise<ProjectAccess> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      members: {
        where: { userId },
        select: { role: true },
        take: 1,
      },
    },
  })

  if (!project) {
    return { canView: false, isProjectLead: false, isProjectMember: false, projectRole: null }
  }

  if (project.ownerId === userId) {
    return {
      canView: true,
      isProjectLead: true,
      isProjectMember: true,
      projectRole: "OWNER",
    }
  }

  const membership = project.members[0]
  if (!membership) {
    return { canView: false, isProjectLead: false, isProjectMember: false, projectRole: null }
  }

  const isLead = membership.role === "PROJECT_LEAD"
  return {
    canView: true,
    isProjectLead: isLead,
    isProjectMember: true,
    projectRole: membership.role,
  }
}

export function canMutateProject(access: ProjectAccess): boolean {
  return access.isProjectLead
}

export function canMutateTasksOnProject(access: ProjectAccess): boolean {
  return access.isProjectLead
}

export function canInviteToProject(access: ProjectAccess): boolean {
  return access.isProjectLead
}

export function canGenerateReportForProject(access: ProjectAccess): boolean {
  return access.isProjectLead
}

/**
 * Variant A status: project Lead may change any task; project Member only own assignee.
 */
export function canUpdateTaskStatus(
  access: ProjectAccess,
  user: { id: string },
  task: { assigneeId: string | null },
): boolean {
  if (!access.canView) return false
  if (access.isProjectLead) return true
  return task.assigneeId !== null && task.assigneeId === user.id
}

export function isTeamLeadAccount(role: Role): boolean {
  return role === "ADMIN"
}
