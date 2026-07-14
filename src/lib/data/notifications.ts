/**
 * In-app notifications derived from task due dates for OpsBoard.
 *
 * Surfaces overdue and due-soon (within 3 days) open tasks for the header bell
 * menu, scoped to projects the viewer can access.
 */

import { prisma } from "@/lib/prisma"
import { formatRelativeDue, isTaskOverdue } from "@/lib/format"

/** One row in the notifications dropdown (not persisted — computed on read). */
export type AppNotification = {
  id: string
  title: string
  project: string
  href: string
  dueLabel: string
  kind: "overdue" | "due_soon"
}

/** Midnight local time today; used as the lower bound for "due soon" windows. */
function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/**
 * Overdue + due-within-3-days tasks for the header bell.
 * Limited by `limit` (default 8), ordered by soonest due date first.
 */
export async function listNotifications(
  accessibleProjectIds: string[],
  limit = 8,
): Promise<AppNotification[]> {
  if (accessibleProjectIds.length === 0) return []

  const today = startOfToday()
  const soon = new Date(today)
  soon.setDate(soon.getDate() + 3)

  const tasks = await prisma.task.findMany({
    where: {
      projectId: { in: accessibleProjectIds },
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
