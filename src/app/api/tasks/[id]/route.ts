import { NextResponse } from "next/server"
import { ensureDbUser } from "@/lib/auth/db-user"
import { updateTaskStatus } from "@/lib/data/tasks"
import type { TaskStatus } from "@/types/domain"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await ensureDbUser()
    const { id } = await context.params
    const body = (await request.json()) as { status?: TaskStatus }

    if (!body.status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 })
    }

    const task = await updateTaskStatus(id, body.status)
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
