/**
 * Weekly AI report generation Server Action for OpsBoard.
 *
 * Project Lead only. Loads completed tasks for one project from the last 7 days,
 * calls Groq, persists a Report row, records activity, and revalidates.
 */

"use server"

import { revalidatePath } from "next/cache"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  canGenerateReportForProject,
  FORBIDDEN_MESSAGE,
  getProjectAccess,
} from "@/lib/auth/permissions"
import {
  createReport,
  getCompletedTasksForWeeklySummary,
  getCurrentWeekStart,
} from "@/lib/data/reports"
import { recordActivity } from "@/lib/data/activity"
import { generateWeeklySummary } from "@/lib/groq"
import type { ActionState } from "@/lib/actions/projects"

/** Extends ActionState with optional id so the UI can link to the new report. */
export type GenerateReportState = ActionState & {
  reportId?: string
}

/**
 * End-to-end weekly report pipeline: auth → project access → data → LLM → persist.
 */
export async function generateWeeklyReportAction(projectId: string): Promise<GenerateReportState> {
  const user = await requireDbUser()

  if (!projectId) {
    return { error: "Project is required." }
  }

  const access = await getProjectAccess(user.id, projectId)
  if (!canGenerateReportForProject(access)) {
    return { error: FORBIDDEN_MESSAGE }
  }

  if (!process.env.GROQ_API_KEY) {
    return { error: "Groq API key is missing. Add GROQ_API_KEY to .env" }
  }

  const tasks = await getCompletedTasksForWeeklySummary(projectId)

  if (tasks.length === 0) {
    return { error: "No completed tasks in the last 7 days. Mark some tasks as Done first." }
  }

  const taskPayload = tasks.map((task) => ({
    title: task.title,
    project: task.project.name,
    assignee: task.assignee?.name ?? "Unassigned",
  }))

  try {
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

    revalidatePath("/reports")
    revalidatePath(`/projects/${projectId}`)
    revalidatePath("/")

    return {
      success: "Weekly report generated.",
      reportId: report.id,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate report."
    return { error: message }
  }
}
