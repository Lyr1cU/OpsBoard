/**
 * Dashboard aggregate data for OpsBoard home.
 *
 * Team Lead view: team-wide stats across accessible projects.
 * Member view: personal stats — only tasks assigned to the current user
 * (Active Projects still counts accessible active projects).
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { formatRelativeDue, isTaskOverdue } from "@/lib/format"

export type DashboardStat = {
  label: string
  value: string
  hint: string
  highlight?: "destructive"
}

export type TaskStatusSlice = {
  status: string
  count: number
  fill: string
}

export type DeadlineItem = {
  id: string
  task: string
  project: string
  assignee: string
  due: string
  overdue: boolean
}

export type DashboardScope = "team" | "personal"

export type DashboardData = {
  scope: DashboardScope
  stats: DashboardStat[]
  tasksByStatus: TaskStatusSlice[]
  deadlines: DeadlineItem[]
}

const STATUS_SLICES: { key: "TODO" | "IN_PROGRESS" | "DONE"; label: string; fill: string }[] = [
  { key: "TODO", label: "To Do", fill: "var(--chart-3)" },
  { key: "IN_PROGRESS", label: "In Progress", fill: "var(--chart-2)" },
  { key: "DONE", label: "Done", fill: "var(--chart-1)" },
]

type TaskAggregateRow = {
  todo: bigint
  in_progress: bigint
  done: bigint
  overdue: bigint
  active_projects: bigint
}

function emptyDashboard(scope: DashboardScope): DashboardData {
  const personal = scope === "personal"
  return {
    scope,
    stats: [
      { label: "Active Projects", value: "0", hint: "currently in progress" },
      {
        label: "Open Tasks",
        value: "0",
        hint: personal ? "assigned to you" : "across all projects",
      },
      {
        label: "Overdue",
        value: "0",
        hint: personal ? "your tasks needing attention" : "needs attention",
      },
      {
        label: "In Progress",
        value: "0",
        hint: personal ? "you're working on" : "tasks being worked on",
      },
    ],
    tasksByStatus: [],
    deadlines: [],
  }
}

export type GetDashboardDataInput = {
  accessibleProjectIds: string[]
  /** When set, task metrics/deadlines are limited to this assignee (Member view). */
  assigneeId?: string
}

/**
 * Load dashboard metrics for accessible projects.
 * Pass `assigneeId` for a personal (Member) workload view.
 */
export async function getDashboardData(input: GetDashboardDataInput): Promise<DashboardData> {
  const { accessibleProjectIds, assigneeId } = input
  const scope: DashboardScope = assigneeId ? "personal" : "team"

  if (accessibleProjectIds.length === 0) {
    return emptyDashboard(scope)
  }

  const projectIdsSql = Prisma.join(accessibleProjectIds)
  const assigneeFilter = assigneeId
    ? Prisma.sql`AND t."assigneeId" = ${assigneeId}`
    : Prisma.empty

  const [aggregateRows, upcomingTasks] = await Promise.all([
    prisma.$queryRaw<TaskAggregateRow[]>`
      SELECT
        count(*) FILTER (WHERE t.status = 'TODO') AS todo,
        count(*) FILTER (WHERE t.status = 'IN_PROGRESS') AS in_progress,
        count(*) FILTER (WHERE t.status = 'DONE') AS done,
        count(*) FILTER (WHERE t.status <> 'DONE' AND t."dueDate" < now()) AS overdue,
        (
          SELECT count(*)
          FROM "Project"
          WHERE status = 'ACTIVE' AND id IN (${projectIdsSql})
        ) AS active_projects
      FROM "Task" t
      WHERE t."projectId" IN (${projectIdsSql})
      ${assigneeFilter}
    `,
    prisma.task.findMany({
      where: {
        projectId: { in: accessibleProjectIds },
        status: { not: "DONE" },
        dueDate: { not: null },
        ...(assigneeId ? { assigneeId } : {}),
      },
      orderBy: { dueDate: "asc" },
      take: 8,
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        assignee: { select: { name: true } },
        project: { select: { name: true } },
      },
    }),
  ])

  const row = aggregateRows[0]
  const todo = Number(row?.todo ?? 0)
  const inProgress = Number(row?.in_progress ?? 0)
  const done = Number(row?.done ?? 0)
  const overdueTasks = Number(row?.overdue ?? 0)
  const activeProjects = Number(row?.active_projects ?? 0)
  const openTasks = todo + inProgress
  const personal = scope === "personal"

  const statusCountMap = new Map<string, number>([
    ["TODO", todo],
    ["IN_PROGRESS", inProgress],
    ["DONE", done],
  ])

  const tasksByStatus: TaskStatusSlice[] = STATUS_SLICES.map(({ key, label, fill }) => ({
    status: label,
    count: statusCountMap.get(key) ?? 0,
    fill,
  })).filter((slice) => slice.count > 0)

  const stats: DashboardStat[] = [
    {
      label: "Active Projects",
      value: String(activeProjects),
      hint: "currently in progress",
    },
    {
      label: "Open Tasks",
      value: String(openTasks),
      hint: personal ? "assigned to you" : "across all projects",
    },
    {
      label: "Overdue",
      value: String(overdueTasks),
      hint: personal ? "your tasks needing attention" : "needs attention",
      highlight: overdueTasks > 0 ? "destructive" : undefined,
    },
    {
      label: "In Progress",
      value: String(inProgress),
      hint: personal ? "you're working on" : "tasks being worked on",
    },
  ]

  const deadlines: DeadlineItem[] = upcomingTasks.map((task) => {
    const overdue = isTaskOverdue(task.dueDate, task.status)
    return {
      id: task.id,
      task: task.title,
      project: task.project.name,
      assignee: task.assignee?.name ?? "Unassigned",
      due: formatRelativeDue(task.dueDate, overdue),
      overdue,
    }
  })

  return { scope, stats, tasksByStatus, deadlines }
}
