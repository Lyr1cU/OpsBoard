/**
 * Project team invite / remove Server Actions for OpsBoard.
 */

"use server"

import { revalidatePath } from "next/cache"
import type { ProjectMemberRole } from "@prisma/client"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  canInviteToProject,
  FORBIDDEN_MESSAGE,
  getProjectAccess,
  projectRoleLabel,
} from "@/lib/auth/permissions"
import { recordActivity } from "@/lib/data/activity"
import { inviteUserToProject, removeUserFromProject } from "@/lib/data/memberships"
import type { ActionState } from "@/lib/actions/projects"

function revalidateTeamPaths(projectId: string) {
  revalidatePath("/team")
  revalidatePath(`/projects/${projectId}`)
  revalidatePath("/")
}

/** Invite an existing registered user to a project (project Lead only). */
export async function inviteToProjectAction(
  projectId: string,
  email: string,
  role: ProjectMemberRole,
): Promise<ActionState> {
  const actor = await requireDbUser()
  const access = await getProjectAccess(actor.id, projectId)
  if (!canInviteToProject(access)) {
    return { error: FORBIDDEN_MESSAGE }
  }

  if (role !== "PROJECT_LEAD" && role !== "PROJECT_MEMBER") {
    return { error: "Invalid project role." }
  }

  const result = await inviteUserToProject({ projectId, email, role })
  if (!result.ok) {
    return { error: result.error }
  }

  await recordActivity({
    actorId: actor.id,
    action: "MEMBER_INVITED",
    entityType: "project",
    entityId: projectId,
    meta: {
      email: email.trim().toLowerCase(),
      name: result.name,
      role: projectRoleLabel(role),
    },
  })

  revalidateTeamPaths(projectId)
  return { success: `Invited ${result.name} as ${projectRoleLabel(role)}.` }
}

/** Remove a non-owner member from a project (project Lead only). */
export async function removeFromProjectAction(
  projectId: string,
  userId: string,
): Promise<ActionState> {
  const actor = await requireDbUser()
  const access = await getProjectAccess(actor.id, projectId)
  if (!canInviteToProject(access)) {
    return { error: FORBIDDEN_MESSAGE }
  }

  const result = await removeUserFromProject(projectId, userId)
  if (!result.ok) {
    return { error: result.error }
  }

  await recordActivity({
    actorId: actor.id,
    action: "MEMBER_REMOVED",
    entityType: "project",
    entityId: projectId,
    meta: { userId },
  })

  revalidateTeamPaths(projectId)
  return { success: "Member removed from project." }
}
