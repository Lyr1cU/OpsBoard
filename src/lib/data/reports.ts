import { prisma } from "@/lib/prisma"
import { formatDisplayDate } from "@/lib/format"

export type ReportListItem = {
  id: string
  weekRange: string
  createdAt: string
  author: string
  preview: string
  bullets: string[]
}

function getWeekStart(date: Date): Date {
  const weekStart = new Date(date)
  const day = weekStart.getDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1
  weekStart.setDate(weekStart.getDate() - daysSinceMonday)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  return `${formatDisplayDate(weekStart)} – ${formatDisplayDate(weekEnd)}`
}

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

function mapReport(report: {
  id: string
  weekStart: Date
  content: string
  createdAt: Date
  createdBy: { name: string }
}): ReportListItem {
  const bullets = parseReportBullets(report.content)

  return {
    id: report.id,
    weekRange: formatWeekRange(report.weekStart),
    createdAt: formatDisplayDate(report.createdAt),
    author: report.createdBy.name,
    preview: bullets[0] ?? report.content.slice(0, 120),
    bullets,
  }
}

export async function listReports(): Promise<ReportListItem[]> {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
    },
  })

  return reports.map(mapReport)
}

export async function getCompletedTasksForWeeklySummary() {
  const since = new Date()
  since.setDate(since.getDate() - 7)
  since.setHours(0, 0, 0, 0)

  return prisma.task.findMany({
    where: {
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

export async function createReport(input: {
  weekStart: Date
  content: string
  createdById: string
  projectId?: string | null
}) {
  return prisma.report.create({
    data: {
      weekStart: input.weekStart,
      content: input.content,
      createdById: input.createdById,
      projectId: input.projectId ?? null,
    },
  })
}

export function getCurrentWeekStart(): Date {
  return getWeekStart(new Date())
}
