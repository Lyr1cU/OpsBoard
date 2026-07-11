"use server"

import { revalidatePath } from "next/cache"
import { requireDbUser } from "@/lib/auth/db-user"
import {
  createReport,
  getCompletedTasksForWeeklySummary,
  getCurrentWeekStart,
} from "@/lib/data/reports"
import { generateWeeklySummary } from "@/lib/groq"
import type { ActionState } from "@/lib/actions/projects"

export type GenerateReportState = ActionState & {
  reportId?: string
}

export async function generateWeeklyReportAction(): Promise<GenerateReportState> {
  const user = await requireDbUser()

  if (!process.env.GROQ_API_KEY) {
    return { error: "Groq API key is missing. Add GROQ_API_KEY to .env" }
  }

  const tasks = await getCompletedTasksForWeeklySummary()

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
    })

    revalidatePath("/reports")

    return {
      success: "Weekly report generated.",
      reportId: report.id,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate report."
    return { error: message }
  }
}
