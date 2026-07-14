/**
 * Report data access and helpers for OpsBoard.
 *
 * Lists persisted AI weekly summaries scoped to accessible projects, fetches
 * completed tasks for prompt input, and utilities for week boundaries / bullets.
 */

import { prisma } from "@/lib/prisma"
import { formatDisplayDate } from "@/lib/format"

/** View model for the reports index and detail preview cards. */
export type ReportListItem = {
  id: string
  projectId: string
  projectName: string
  weekRange: string
  createdAt: string
  author: string
  preview: string
  bullets: string[]
}

/** Normalize `date` to Monday 00:00:00.000 in local timezone. */
function getWeekStart(date: Date): Date {
  const weekStart = new Date(date)
  const day = weekStart.getDay()
  // Sunday (0) → 6 days back; Mon–Sat → day - 1 days back.
  const daysSinceMonday = day === 0 ? 6 : day - 1
  weekStart.setDate(weekStart.getDate() - daysSinceMonday)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

/** Human-readable Mon–Sun range for a stored weekStart timestamp. */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  return `${formatDisplayDate(weekStart)} – ${formatDisplayDate(weekEnd)}`
}

/**
 * Extract bullet lines from LLM markdown/plain text for list previews.
 * Falls back to first five non-empty lines if no bullet markers are found.
 */
export function parseReportBullets(content: string): string[] {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const bullets = lines
    .filter((line) => /^[-•*]\s+/.test(line))
    .map((line) => line.replace(/^[-•*]\s+/, "").trim())

  if (bullets.length > 0) {
    return bullets
  }

  return lines.slice(0, 5)
}

/** Map DB report + joins to UI list item with parsed bullets and preview line. */
function mapReport(report: {
  id: string
  projectId: string | null
  weekStart: Date
  content: string
  createdAt: Date
  createdBy: { name: string }
  project: { name: string } | null
}): ReportListItem {
  const bullets = parseReportBullets(report.content)

  return {
    id: report.id,
    projectId: report.projectId ?? "",
    projectName: report.project?.name ?? "Unknown project",
    weekRange: formatWeekRange(report.weekStart),
    createdAt: formatDisplayDate(report.createdAt),
    author: report.createdBy.name,
    preview: bullets[0] ?? report.content.slice(0, 120),
    bullets,
  }
}

/** Reports for accessible projects, newest first, with author and project name. */
export async function listReports(accessibleProjectIds: string[]): Promise<ReportListItem[]> {
  if (accessibleProjectIds.length === 0) return []

  const reports = await prisma.report.findMany({
    where: { projectId: { in: accessibleProjectIds } },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      project: { select: { name: true } },
    },
  })

  return reports.map(mapReport)
}

/**
 * Tasks completed in the rolling 7-day window for one project
 * (by `updatedAt` when status became DONE). Used as weekly summary context.
 */
export async function getCompletedTasksForWeeklySummary(projectId: string) {
  const since = new Date()
  since.setDate(since.getDate() - 7)
  since.setHours(0, 0, 0, 0)

  return prisma.task.findMany({
    where: {
      projectId,
      status: "DONE",
      updatedAt: { gte: since },
    },
    include: {
      project: { select: { name: true } },
      assignee: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  })
}

/** Persist generated markdown/content linked to author and project. */
export async function createReport(input: {
  weekStart: Date
  content: string
  createdById: string
  projectId: string
}) {
  return prisma.report.create({
    data: {
      weekStart: input.weekStart,
      content: input.content,
      createdById: input.createdById,
      projectId: input.projectId,
    },
  })
}

/** Week boundary for the report being generated "this week". */
export function getCurrentWeekStart(): Date {
  return getWeekStart(new Date())
}
