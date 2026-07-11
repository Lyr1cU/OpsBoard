import { NextResponse } from "next/server"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  createReport,
  getCompletedTasksForWeeklySummary,
  getCurrentWeekStart,
  listReports,
} from "@/lib/data/reports"
import { generateWeeklySummary } from "@/lib/groq"

export async function GET() {
  try {
    await requireDbUser()
    const reports = await listReports()
    return NextResponse.json(reports)
  } catch {
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const user = await requireDbUser()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 503 })
    }

    const tasks = await getCompletedTasksForWeeklySummary()

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: "No completed tasks in the last 7 days" },
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
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate report"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
