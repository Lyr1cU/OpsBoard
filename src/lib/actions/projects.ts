/**
 * Project mutation Server Actions for OpsBoard.
 *
 * Thin orchestration: require auth, enforce project-scoped Lead powers,
 * parse FormData, delegate to data layer, record activity, revalidate.
 */

"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  archiveProject,
  createProject,
  deleteProject,
  updateProject,
} from "@/lib/data/projects"
import { recordActivity } from "@/lib/data/activity"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  canCreateProject,
  canMutateProject,
  FORBIDDEN_MESSAGE,
  getProjectAccess,
} from "@/lib/auth/permissions"
import type { ProjectStatus } from "@/types/domain"

/** Shared success/error payload for project and task form actions. */
export type ActionState = {
  error?: string
  success?: string
}

/**
 * Create a project (Team Lead account only) and navigate to its detail page.
 * Creator becomes owner; ensureOwnerMembership runs inside createProject.
 */
export async function createProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireDbUser()
  if (!canCreateProject(user)) {
    return { error: FORBIDDEN_MESSAGE }
  }

  const name = String(formData.get("name") ?? "").trim()
  const clientName = String(formData.get("clientName") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()

  if (!name) {
    return { error: "Project name is required." }
  }

  let projectId: string
  try {
    const project = await createProject({
      name,
      clientName,
      description,
      ownerId: user.id,
    })
    projectId = project.id
    await recordActivity({
      actorId: user.id,
      action: "PROJECT_CREATED",
      entityType: "project",
      entityId: project.id,
      meta: { name: project.name },
    })
    revalidatePath("/projects")
    revalidatePath("/")
  } catch {
    return { error: "Could not create project. Check database connection." }
  }

  redirect(`/projects/${projectId}`)
}

/** Update project metadata (name, client, description) without changing status. */
export async function updateProjectAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireDbUser()
  const access = await getProjectAccess(user.id, projectId)
  if (!canMutateProject(access)) {
    return { error: FORBIDDEN_MESSAGE }
  }

  const name = String(formData.get("name") ?? "").trim()
  const clientName = String(formData.get("clientName") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()

  if (!name) {
    return { error: "Project name is required." }
  }

  try {
    await updateProject(projectId, { name, clientName, description })
    await recordActivity({
      actorId: user.id,
      action: "PROJECT_UPDATED",
      entityType: "project",
      entityId: projectId,
      meta: { name },
    })
    revalidatePath("/projects")
    revalidatePath(`/projects/${projectId}`)
    revalidatePath("/")
    return { success: "Project updated." }
  } catch {
    return { error: "Could not update project." }
  }
}

/** Soft-archive via data layer (status → ARCHIVED). */
export async function archiveProjectAction(projectId: string): Promise<ActionState> {
  const user = await requireDbUser()
  const access = await getProjectAccess(user.id, projectId)
  if (!canMutateProject(access)) {
    return { error: FORBIDDEN_MESSAGE }
  }

  try {
    const project = await archiveProject(projectId)
    await recordActivity({
      actorId: user.id,
      action: "PROJECT_ARCHIVED",
      entityType: "project",
      entityId: projectId,
      meta: { name: project.name },
    })
    revalidatePath("/projects")
    revalidatePath(`/projects/${projectId}`)
    revalidatePath("/")
    return { success: "Project archived." }
  } catch {
    return { error: "Could not archive project." }
  }
}

/**
 * Set project status explicitly (e.g. restore ACTIVE or archive ARCHIVED).
 * Message text adapts to the target status for clearer UX.
 */
export async function setProjectStatusAction(projectId: string, status: ProjectStatus): Promise<ActionState> {
  const user = await requireDbUser()
  const access = await getProjectAccess(user.id, projectId)
  if (!canMutateProject(access)) {
    return { error: FORBIDDEN_MESSAGE }
  }

  try {
    const project = await updateProject(projectId, { status })
    await recordActivity({
      actorId: user.id,
      action: status === "ARCHIVED" ? "PROJECT_ARCHIVED" : "PROJECT_RESTORED",
      entityType: "project",
      entityId: projectId,
      meta: { name: project.name },
    })
    revalidatePath("/projects")
    revalidatePath(`/projects/${projectId}`)
    revalidatePath("/")
    return { success: status === "ARCHIVED" ? "Project archived." : "Project restored." }
  } catch {
    return { error: "Could not update project status." }
  }
}

/** Permanently delete a project and its cascaded tasks. */
export async function deleteProjectAction(projectId: string): Promise<ActionState> {
  const user = await requireDbUser()
  const access = await getProjectAccess(user.id, projectId)
  if (!canMutateProject(access)) {
    return { error: FORBIDDEN_MESSAGE }
  }

  try {
    const project = await deleteProject(projectId)
    await recordActivity({
      actorId: user.id,
      action: "PROJECT_DELETED",
      entityType: "project",
      entityId: projectId,
      meta: { name: project.name },
    })
    revalidatePath("/projects")
    revalidatePath("/tasks")
    revalidatePath("/")
  } catch {
    return { error: "Could not delete project." }
  }

  redirect("/projects")
}
