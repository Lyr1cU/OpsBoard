/**
 * Single project API (GET/PATCH/DELETE /api/projects/[id]).
 *
 * GET — members who can view the project.
 * PATCH / DELETE — project Lead only.
 */
import { NextResponse } from "next/server"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  canMutateProject,
  FORBIDDEN_MESSAGE,
  getProjectAccess,
} from "@/lib/auth/permissions"
import {
  deleteProject,
  getProjectById,
  updateProject,
} from "@/lib/data/projects"
import { recordActivity } from "@/lib/data/activity"
import type { ProjectStatus } from "@/types/domain"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireDbUser()
    const { id } = await context.params
    const access = await getProjectAccess(user.id, id)
    if (!access.canView) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

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
    const user = await requireDbUser()
    const { id } = await context.params
    const access = await getProjectAccess(user.id, id)
    if (!canMutateProject(access)) {
      return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 })
    }

    const body = (await request.json()) as {
      name?: string
      clientName?: string
      description?: string
      status?: ProjectStatus
    }

    const project = await updateProject(id, body)

    let action: "PROJECT_UPDATED" | "PROJECT_ARCHIVED" | "PROJECT_RESTORED" = "PROJECT_UPDATED"
    if (body.status === "ARCHIVED") action = "PROJECT_ARCHIVED"
    if (body.status === "ACTIVE") action = "PROJECT_RESTORED"

    await recordActivity({
      actorId: user.id,
      action,
      entityType: "project",
      entityId: id,
      meta: { name: project.name },
    })

    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireDbUser()
    const { id } = await context.params
    const access = await getProjectAccess(user.id, id)
    if (!canMutateProject(access)) {
      return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 })
    }

    const project = await deleteProject(id)

    await recordActivity({
      actorId: user.id,
      action: "PROJECT_DELETED",
      entityType: "project",
      entityId: id,
      meta: { name: project.name },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
