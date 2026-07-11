import { NextResponse } from "next/server"
import { ensureDbUser } from "@/lib/auth/db-user"
import { archiveProject, getProjectById, updateProject } from "@/lib/data/projects"
import type { ProjectStatus } from "@/types/domain"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  try {
    await ensureDbUser()
    const { id } = await context.params
    const project = await getProjectById(id)

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await ensureDbUser()
    const { id } = await context.params
    const body = (await request.json()) as {
      name?: string
      clientName?: string
      description?: string
      status?: ProjectStatus
    }

    const project = await updateProject(id, body)
    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await ensureDbUser()
    const { id } = await context.params
    await archiveProject(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to archive project" }, { status: 500 })
  }
}
