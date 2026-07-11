"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { archiveProject, createProject, updateProject } from "@/lib/data/projects"
import { requireDbUser } from "@/lib/auth/db-user"
import type { ProjectStatus } from "@/types/domain"

export type ActionState = {
  error?: string
  success?: string
}

export async function createProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireDbUser()

  const name = String(formData.get("name") ?? "").trim()
  const clientName = String(formData.get("clientName") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()

  if (!name) {
    return { error: "Project name is required." }
  }

  try {
    const project = await createProject({ name, clientName, description })
    revalidatePath("/projects")
    redirect(`/projects/${project.id}`)
  } catch {
    return { error: "Could not create project. Check database connection." }
  }
}

export async function updateProjectAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireDbUser()

  const name = String(formData.get("name") ?? "").trim()
  const clientName = String(formData.get("clientName") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()

  if (!name) {
    return { error: "Project name is required." }
  }

  try {
    await updateProject(projectId, { name, clientName, description })
    revalidatePath("/projects")
    revalidatePath(`/projects/${projectId}`)
    return { success: "Project updated." }
  } catch {
    return { error: "Could not update project." }
  }
}

export async function archiveProjectAction(projectId: string): Promise<ActionState> {
  await requireDbUser()

  try {
    await archiveProject(projectId)
    revalidatePath("/projects")
    revalidatePath(`/projects/${projectId}`)
    return { success: "Project archived." }
  } catch {
    return { error: "Could not archive project." }
  }
}

export async function setProjectStatusAction(projectId: string, status: ProjectStatus): Promise<ActionState> {
  await requireDbUser()

  try {
    await updateProject(projectId, { status })
    revalidatePath("/projects")
    revalidatePath(`/projects/${projectId}`)
    return { success: status === "ARCHIVED" ? "Project archived." : "Project restored." }
  } catch {
    return { error: "Could not update project status." }
  }
}
