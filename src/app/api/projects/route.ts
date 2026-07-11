import { NextResponse } from "next/server"
import { ensureDbUser } from "@/lib/auth/db-user"
import { createProject, listProjects } from "@/lib/data/projects"

export async function GET() {
  try {
    await ensureDbUser()
    const projects = await listProjects()
    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbUser()
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
    })

    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
