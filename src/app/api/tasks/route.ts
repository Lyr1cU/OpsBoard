/**
 * Tasks collection API (GET /api/tasks, POST /api/tasks).
 *
 * GET — tasks on accessible projects.
 * POST — project Lead only.
 */
import { NextResponse } from "next/server"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  canMutateTasksOnProject,
  FORBIDDEN_MESSAGE,
  getAccessibleProjectIds,
  getProjectAccess,
} from "@/lib/auth/permissions"
import { createTask, listTasks } from "@/lib/data/tasks"
import { recordActivity } from "@/lib/data/activity"
import { parseDateInput } from "@/lib/format"
import type { TaskPriority, TaskStatus } from "@/types/domain"

export async function GET(request: Request) {
  try {
    const user = await requireDbUser()
    const accessibleIds = await getAccessibleProjectIds(user.id)
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId") ?? undefined
    const status = (searchParams.get("status") as TaskStatus | null) ?? undefined
    const assigneeId = searchParams.get("assigneeId") ?? undefined

    const tasks = await listTasks({
      projectId,
      status,
      assigneeId,
      accessibleProjectIds: accessibleIds,
    })
    return NextResponse.json(tasks)
  } catch {
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser()

    const body = (await request.json()) as {
      projectId?: string
      title?: string
      description?: string
      priority?: TaskPriority
      dueDate?: string
      assigneeId?: string | null
    }

    if (!body.projectId || !body.title?.trim()) {
      return NextResponse.json({ error: "projectId and title are required" }, { status: 400 })
    }

    const access = await getProjectAccess(user.id, body.projectId)
    if (!canMutateTasksOnProject(access)) {
      return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 })
    }

    const task = await createTask({
      projectId: body.projectId,
      title: body.title,
      description: body.description,
      priority: body.priority,
      dueDate: body.dueDate ? parseDateInput(body.dueDate) : null,
      assigneeId: body.assigneeId,
    })

    await recordActivity({
      actorId: user.id,
      action: "TASK_CREATED",
      entityType: "task",
      entityId: task.id,
      meta: { title: task.title },
    })

    return NextResponse.json(task, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
