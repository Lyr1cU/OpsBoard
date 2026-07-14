/**
 * Projects collection API (GET /api/projects, POST /api/projects).
 *
 * GET lists projects the user can access.
 * POST creates a project — account Team Lead only.
 */
import { NextResponse } from "next/server"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  canCreateProject,
  FORBIDDEN_MESSAGE,
  getAccessibleProjectIds,
} from "@/lib/auth/permissions"
import { createProject, listProjects } from "@/lib/data/projects"
import { recordActivity } from "@/lib/data/activity"

export async function GET() {
  try {
    const user = await requireDbUser()
    const ids = await getAccessibleProjectIds(user.id)
    const projects = await listProjects(ids)
    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser()
    if (!canCreateProject(user)) {
      return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 })
    }

    const body = (await request.json()) as {
      name?: string
      clientName?: string
      description?: string
    }

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const project = await createProject({
      name: body.name,
      clientName: body.clientName,
      description: body.description,
      ownerId: user.id,
    })

    await recordActivity({
      actorId: user.id,
      action: "PROJECT_CREATED",
      entityType: "project",
      entityId: project.id,
      meta: { name: project.name },
    })

    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
