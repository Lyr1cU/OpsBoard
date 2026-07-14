/**
 * Single task API (PATCH / DELETE /api/tasks/[id]).
 *
 * PATCH supports status and full field updates with Variant A RBAC.
 * DELETE is project Lead only.
 */
import { NextResponse } from "next/server"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  canMutateTasksOnProject,
  canUpdateTaskStatus,
  FORBIDDEN_MESSAGE,
  getProjectAccess,
} from "@/lib/auth/permissions"
import { deleteTask, getTaskById, updateTask, updateTaskStatus } from "@/lib/data/tasks"
import { recordActivity } from "@/lib/data/activity"
import { parseDateInput } from "@/lib/format"
import type { TaskPriority, TaskStatus } from "@/types/domain"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireDbUser()
    const { id } = await context.params
    const body = (await request.json()) as {
      status?: TaskStatus
      title?: string
      description?: string
      priority?: TaskPriority
      dueDate?: string | null
      assigneeId?: string | null
      projectId?: string
    }

    const existing = await getTaskById(id)
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const access = await getProjectAccess(user.id, existing.projectId)

    const isStatusOnly =
      body.status !== undefined &&
      body.title === undefined &&
      body.description === undefined &&
      body.priority === undefined &&
      body.dueDate === undefined &&
      body.assigneeId === undefined &&
      body.projectId === undefined

    if (isStatusOnly) {
      if (!canUpdateTaskStatus(access, user, existing)) {
        return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 })
      }
      const task = await updateTaskStatus(id, body.status!)
      await recordActivity({
        actorId: user.id,
        action: "TASK_STATUS_CHANGED",
        entityType: "task",
        entityId: id,
        meta: { title: existing.title, status: body.status },
      })
      return NextResponse.json(task)
    }

    if (!canMutateTasksOnProject(access)) {
      return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 })
    }

    if (body.projectId && body.projectId !== existing.projectId) {
      const destAccess = await getProjectAccess(user.id, body.projectId)
      if (!canMutateTasksOnProject(destAccess)) {
        return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 })
      }
    }

    const task = await updateTask(id, {
      title: body.title,
      description: body.description,
      priority: body.priority,
      assigneeId: body.assigneeId,
      projectId: body.projectId,
      status: body.status,
      dueDate:
        body.dueDate === undefined
          ? undefined
          : body.dueDate
            ? parseDateInput(body.dueDate)
            : null,
    })

    await recordActivity({
      actorId: user.id,
      action: "TASK_UPDATED",
      entityType: "task",
      entityId: id,
      meta: { title: task.title },
    })

    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireDbUser()
    const { id } = await context.params
    const existing = await getTaskById(id)
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const access = await getProjectAccess(user.id, existing.projectId)
    if (!canMutateTasksOnProject(access)) {
      return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 })
    }

    await deleteTask(id)
    await recordActivity({
      actorId: user.id,
      action: "TASK_DELETED",
      entityType: "task",
      entityId: id,
      meta: { title: existing.title },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
