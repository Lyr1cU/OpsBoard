/**
 * Reports API (GET /api/reports/generate, POST /api/reports/generate).
 *
 * GET lists saved weekly reports for accessible projects.
 * POST generates a new AI summary for a project — project Lead only.
 * Body: { projectId: string }
 */
import { NextResponse } from "next/server"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  canGenerateReportForProject,
  FORBIDDEN_MESSAGE,
  getAccessibleProjectIds,
  getProjectAccess,
} from "@/lib/auth/permissions"
import {
  createReport,
  getCompletedTasksForWeeklySummary,
  getCurrentWeekStart,
  listReports,
} from "@/lib/data/reports"
import { recordActivity } from "@/lib/data/activity"
import { generateWeeklySummary } from "@/lib/groq"

export async function GET() {
  try {
    const user = await requireDbUser()
    const ids = await getAccessibleProjectIds(user.id)
    const reports = await listReports(ids)
    return NextResponse.json(reports)
  } catch {
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser()
    const body = (await request.json()) as { projectId?: string }
    const projectId = body.projectId?.trim()
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }

    const access = await getProjectAccess(user.id, projectId)
    if (!canGenerateReportForProject(access)) {
      return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 503 })
    }

    const tasks = await getCompletedTasksForWeeklySummary(projectId)

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: "No completed tasks in the last 7 days for this project" },
        { status: 400 },
      )
    }

    const taskPayload = tasks.map((task) => ({
      title: task.title,
      project: task.project.name,
      assignee: task.assignee?.name ?? "Unassigned",
    }))

    const content = await generateWeeklySummary(taskPayload)
    const report = await createReport({
      weekStart: getCurrentWeekStart(),
      content,
      createdById: user.id,
      projectId,
    })

    await recordActivity({
      actorId: user.id,
      action: "REPORT_GENERATED",
      entityType: "report",
      entityId: report.id,
      meta: { projectId },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate report"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
