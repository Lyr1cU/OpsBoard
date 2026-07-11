import { NextResponse } from "next/server"
import { ensureDbUser } from "@/lib/auth/db-user"
import { createTask, listTasks } from "@/lib/data/tasks"
import { parseDateInput } from "@/lib/format"
import type { TaskPriority, TaskStatus } from "@/types/domain"

export async function GET(request: Request) {
  try {
    await ensureDbUser()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId") ?? undefined
    const status = (searchParams.get("status") as TaskStatus | null) ?? undefined
    const assigneeId = searchParams.get("assigneeId") ?? undefined

    const tasks = await listTasks({
      projectId,
      status,
      assigneeId,
    })

    return NextResponse.json(tasks)
  } catch {
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbUser()
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

    const task = await createTask({
      projectId: body.projectId,
      title: body.title,
      description: body.description,
      priority: body.priority,
      dueDate: body.dueDate ? parseDateInput(body.dueDate) : null,
      assigneeId: body.assigneeId,
    })

    return NextResponse.json(task, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
