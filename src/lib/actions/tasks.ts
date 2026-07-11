"use server"

import { revalidatePath } from "next/cache"
import { createTask, updateTaskStatus } from "@/lib/data/tasks"
import { requireDbUser } from "@/lib/auth/db-user"
import { parseDateInput } from "@/lib/format"
import type { TaskPriority, TaskStatus } from "@/types/domain"
import type { ActionState } from "@/lib/actions/projects"

export async function createTaskAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireDbUser()

  const projectId = String(formData.get("projectId") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const priority = String(formData.get("priority") ?? "MEDIUM") as TaskPriority
  const assigneeId = String(formData.get("assigneeId") ?? "").trim()
  const dueDateRaw = String(formData.get("dueDate") ?? "")

  if (!projectId || !title) {
    return { error: "Project and title are required." }
  }

  const dueDate = parseDateInput(dueDateRaw)

  try {
    await createTask({
      projectId,
      title,
      priority,
      assigneeId: assigneeId || null,
      dueDate,
    })
    revalidatePath("/tasks")
    revalidatePath("/projects")
    revalidatePath(`/projects/${projectId}`)
    return { success: "Task created." }
  } catch {
    return { error: "Could not create task." }
  }
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus, projectId?: string) {
  await requireDbUser()

  try {
    await updateTaskStatus(taskId, status)
    revalidatePath("/tasks")
    revalidatePath("/projects")
    if (projectId) {
      revalidatePath(`/projects/${projectId}`)
    }
  } catch {
    throw new Error("Could not update task status.")
  }
}
