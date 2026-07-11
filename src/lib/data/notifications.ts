import { prisma } from "@/lib/prisma"
import { formatRelativeDue, isTaskOverdue } from "@/lib/format"

export type AppNotification = {
  id: string
  title: string
  project: string
  href: string
  dueLabel: string
  kind: "overdue" | "due_soon"
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/** Overdue + due-within-3-days tasks for the header bell. */
export async function listNotifications(limit = 8): Promise<AppNotification[]> {
  const today = startOfToday()
  const soon = new Date(today)
  soon.setDate(soon.getDate() + 3)

  const tasks = await prisma.task.findMany({
    where: {
      status: { not: "DONE" },
      dueDate: {
        not: null,
        lte: soon,
      },
    },
    orderBy: { dueDate: "asc" },
    take: limit,
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      projectId: true,
      project: { select: { name: true } },
    },
  })

  return tasks.map((task) => {
    const overdue = isTaskOverdue(task.dueDate, task.status)
    const kind = overdue ? "overdue" : "due_soon"
    return {
      id: task.id,
      title: task.title,
      project: task.project.name,
      href: `/projects/${task.projectId}`,
      dueLabel: formatRelativeDue(task.dueDate, overdue),
      kind,
    }
  })
}
