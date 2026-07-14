/**
 * Activity / audit-event writes and reads for OpsBoard.
 *
 * Mutations call `recordActivity` after a successful change. Failures are
 * swallowed so audit logging never blocks the primary user action.
 */

import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type ActivityAction =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_DELETED"
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_ARCHIVED"
  | "PROJECT_RESTORED"
  | "PROJECT_DELETED"
  | "REPORT_GENERATED"
  | "ROLE_CHANGED"
  | "MEMBER_INVITED"
  | "MEMBER_REMOVED"

export type ActivityListItem = {
  id: string
  action: string
  entityType: string
  entityId: string | null
  summary: string
  actorName: string
  createdAt: string
}

/** Persist one audit row; never throws to callers. */
export async function recordActivity(input: {
  actorId: string
  action: ActivityAction
  entityType: string
  entityId?: string | null
  meta?: Record<string, unknown>
}) {
  try {
    await prisma.activity.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        meta: (input.meta as Prisma.InputJsonValue) ?? undefined,
      },
    })
  } catch (error) {
    console.error("Failed to record activity:", error)
  }
}

/** Human-readable one-liner for the Recent activity panel. */
function summarize(action: string, meta: Record<string, unknown> | null): string {
  const title = typeof meta?.title === "string" ? meta.title : null
  const name = typeof meta?.name === "string" ? meta.name : null
  const target = title ?? name

  switch (action) {
    case "TASK_CREATED":
      return target ? `Created task “${target}”` : "Created a task"
    case "TASK_UPDATED":
      return target ? `Updated task “${target}”` : "Updated a task"
    case "TASK_STATUS_CHANGED": {
      const status = typeof meta?.status === "string" ? meta.status : "status"
      return target ? `Marked “${target}” as ${status}` : `Changed task status to ${status}`
    }
    case "TASK_DELETED":
      return target ? `Deleted task “${target}”` : "Deleted a task"
    case "PROJECT_CREATED":
      return target ? `Created project “${target}”` : "Created a project"
    case "PROJECT_UPDATED":
      return target ? `Updated project “${target}”` : "Updated a project"
    case "PROJECT_ARCHIVED":
      return target ? `Archived project “${target}”` : "Archived a project"
    case "PROJECT_RESTORED":
      return target ? `Restored project “${target}”` : "Restored a project"
    case "PROJECT_DELETED":
      return target ? `Permanently deleted project “${target}”` : "Deleted a project"
    case "REPORT_GENERATED":
      return "Generated a weekly AI report"
    case "ROLE_CHANGED": {
      const email = typeof meta?.email === "string" ? meta.email : "a teammate"
      const role = typeof meta?.role === "string" ? meta.role : "role"
      return `Changed ${email} to ${role}`
    }
    case "MEMBER_INVITED": {
      const name = typeof meta?.name === "string" ? meta.name : "a teammate"
      const role = typeof meta?.role === "string" ? meta.role : "member"
      return `Invited ${name} as ${role}`
    }
    case "MEMBER_REMOVED":
      return "Removed a member from a project"
    default:
      return action.replaceAll("_", " ").toLowerCase()
  }
}

/** Newest activity rows for the dashboard / team feed. */
export async function listRecentActivity(limit = 20): Promise<ActivityListItem[]> {
  const rows = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { name: true } },
    },
  })

  return rows.map((row) => {
    const meta =
      row.meta && typeof row.meta === "object" && !Array.isArray(row.meta)
        ? (row.meta as Record<string, unknown>)
        : null

    return {
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      summary: summarize(row.action, meta),
      actorName: row.actor.name,
      createdAt: row.createdAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    }
  })
}
