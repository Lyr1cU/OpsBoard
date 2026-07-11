import { prisma } from "@/lib/prisma"
import { formatDisplayDate, formatRelativeDue, isTaskOverdue } from "@/lib/format"

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

export type DashboardData = {
  stats: DashboardStat[]
  tasksByStatus: TaskStatusSlice[]
  deadlines: DeadlineItem[]
}

const STATUS_SLICES: { key: "TODO" | "IN_PROGRESS" | "DONE"; label: string; fill: string }[] = [
  { key: "TODO", label: "To Do", fill: "var(--chart-3)" },
  { key: "IN_PROGRESS", label: "In Progress", fill: "var(--chart-2)" },
  { key: "DONE", label: "Done", fill: "var(--chart-1)" },
]

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export async function getDashboardData(): Promise<DashboardData> {
  const today = startOfToday()

  const [activeProjects, openTasks, overdueTasks, inProgressTasks, statusGroups, upcomingTasks] =
    await Promise.all([
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.task.count({ where: { status: { not: "DONE" } } }),
      prisma.task.count({
        where: {
          status: { not: "DONE" },
          dueDate: { lt: today },
        },
      }),
      prisma.task.count({ where: { status: "IN_PROGRESS" } }),
      prisma.task.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.task.findMany({
        where: {
          status: { not: "DONE" },
          dueDate: { not: null },
        },
        orderBy: { dueDate: "asc" },
        take: 8,
        include: {
          assignee: { select: { name: true } },
          project: { select: { name: true } },
        },
      }),
    ])

  const statusCountMap = new Map(statusGroups.map((g) => [g.status, g._count._all]))

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
      hint: "across all projects",
    },
    {
      label: "Overdue",
      value: String(overdueTasks),
      hint: "needs attention",
      highlight: overdueTasks > 0 ? "destructive" : undefined,
    },
    {
      label: "In Progress",
      value: String(inProgressTasks),
      hint: "tasks being worked on",
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

  return { stats, tasksByStatus, deadlines }
}
