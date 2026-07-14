/**
 * Task mutation Server Actions for OpsBoard.
 *
 * Creates / updates / deletes tasks and updates status with Variant A RBAC
 * evaluated per project via getProjectAccess.
 */

"use server"

import { revalidatePath } from "next/cache"
import {
  createTask,
  deleteTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
} from "@/lib/data/tasks"
import { isUserOnProject } from "@/lib/data/memberships"
import { recordActivity } from "@/lib/data/activity"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  canMutateTasksOnProject,
  canUpdateTaskStatus,
  FORBIDDEN_MESSAGE,
  getProjectAccess,
} from "@/lib/auth/permissions"
import { parseDateInput } from "@/lib/format"
import type { TaskPriority, TaskStatus } from "@/types/domain"
import type { ActionState } from "@/lib/actions/projects"

async function resolveAssigneeId(
  projectId: string,
  assigneeId: string,
): Promise<{ ok: true; assigneeId: string | null } | { ok: false; error: string }> {
  if (!assigneeId) return { ok: true, assigneeId: null }
  const onProject = await isUserOnProject(projectId, assigneeId)
  if (!onProject) {
    return { ok: false, error: "Assignee must be a member of this project." }
  }
  return { ok: true, assigneeId }
}

function revalidateTaskPaths(projectId?: string) {
  revalidatePath("/tasks")
  revalidatePath("/projects")
  revalidatePath("/")
  if (projectId) {
    revalidatePath(`/projects/${projectId}`)
  }
}

/** Create a task scoped to a project; optional assignee and due date. */
export async function createTaskAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireDbUser()

  const projectId = String(formData.get("projectId") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const priority = String(formData.get("priority") ?? "MEDIUM") as TaskPriority
  const assigneeId = String(formData.get("assigneeId") ?? "").trim()
  const dueDateRaw = String(formData.get("dueDate") ?? "")

  if (!projectId || !title) {
    return { error: "Project and title are required." }
  }

  const access = await getProjectAccess(user.id, projectId)
  if (!canMutateTasksOnProject(access)) {
    return { error: FORBIDDEN_MESSAGE }
  }

  const assignee = await resolveAssigneeId(projectId, assigneeId)
  if (!assignee.ok) {
    return { error: assignee.error }
  }

  const dueDate = parseDateInput(dueDateRaw)

  try {
    const task = await createTask({
      projectId,
      title,
      description,
      priority,
      assigneeId: assignee.assigneeId,
      dueDate,
    })
    await recordActivity({
      actorId: user.id,
      action: "TASK_CREATED",
      entityType: "task",
      entityId: task.id,
      meta: { title: task.title },
    })
    revalidateTaskPaths(projectId)
    return { success: "Task created." }
  } catch {
    return { error: "Could not create task." }
  }
}

/** Full edit of an existing task (project Lead only). */
export async function updateTaskAction(
  taskId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireDbUser()

  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const priority = String(formData.get("priority") ?? "MEDIUM") as TaskPriority
  const assigneeId = String(formData.get("assigneeId") ?? "").trim()
  const dueDateRaw = String(formData.get("dueDate") ?? "")
  const projectId = String(formData.get("projectId") ?? "").trim()

  if (!title) {
    return { error: "Title is required." }
  }

  try {
    const existing = await getTaskById(taskId)
    if (!existing) {
      return { error: "Task not found." }
    }

    const targetProjectId = projectId || existing.projectId
    const access = await getProjectAccess(user.id, targetProjectId)
    if (!canMutateTasksOnProject(access)) {
      return { error: FORBIDDEN_MESSAGE }
    }

    // Moving between projects requires Lead on both source and destination.
    if (projectId && projectId !== existing.projectId) {
      const sourceAccess = await getProjectAccess(user.id, existing.projectId)
      if (!canMutateTasksOnProject(sourceAccess)) {
        return { error: FORBIDDEN_MESSAGE }
      }
    }

    const assignee = await resolveAssigneeId(targetProjectId, assigneeId)
    if (!assignee.ok) {
      return { error: assignee.error }
    }

    const task = await updateTask(taskId, {
      title,
      description,
      priority,
      assigneeId: assignee.assigneeId,
      dueDate: parseDateInput(dueDateRaw),
      ...(projectId ? { projectId } : {}),
    })

    await recordActivity({
      actorId: user.id,
      action: "TASK_UPDATED",
      entityType: "task",
      entityId: task.id,
      meta: { title: task.title },
    })

    revalidateTaskPaths(task.projectId)
    if (existing.projectId !== task.projectId) {
      revalidatePath(`/projects/${existing.projectId}`)
    }
    return { success: "Task updated." }
  } catch {
    return { error: "Could not update task." }
  }
}

/** Hard-delete a task (project Lead only). */
export async function deleteTaskAction(taskId: string, projectId?: string): Promise<ActionState> {
  const user = await requireDbUser()

  try {
    const existing = await getTaskById(taskId)
    if (!existing) {
      return { error: "Task not found." }
    }

    const access = await getProjectAccess(user.id, existing.projectId)
    if (!canMutateTasksOnProject(access)) {
      return { error: FORBIDDEN_MESSAGE }
    }

    await deleteTask(taskId)
    await recordActivity({
      actorId: user.id,
      action: "TASK_DELETED",
      entityType: "task",
      entityId: taskId,
      meta: { title: existing.title },
    })
    revalidateTaskPaths(projectId ?? existing.projectId)
    return { success: "Task deleted." }
  } catch {
    return { error: "Could not delete task." }
  }
}

export type UpdateTaskStatusResult = { ok: true } | { ok: false; error: string }

/**
 * Update a single task's status (TODO / IN_PROGRESS / DONE).
 * Project Lead may change any task; project Member only own assignee.
 */
export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus,
  projectId?: string,
): Promise<UpdateTaskStatusResult> {
  const user = await requireDbUser()

  const existing = await getTaskById(taskId)
  if (!existing) {
    return { ok: false, error: "Task not found." }
  }

  const access = await getProjectAccess(user.id, existing.projectId)
  if (!canUpdateTaskStatus(access, user, existing)) {
    return { ok: false, error: FORBIDDEN_MESSAGE }
  }

  try {
    await updateTaskStatus(taskId, status)
    await recordActivity({
      actorId: user.id,
      action: "TASK_STATUS_CHANGED",
      entityType: "task",
      entityId: taskId,
      meta: { title: existing.title, status },
    })
    revalidateTaskPaths(projectId ?? existing.projectId)
    return { ok: true }
  } catch {
    return { ok: false, error: "Could not update task status." }
  }
}
