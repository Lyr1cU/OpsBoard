/**
 * User read queries for OpsBoard.
 *
 * Exposes team members as lightweight `{ id, name }` options for assignee
 * dropdowns and filters. Sorted alphabetically for predictable UI ordering.
 */

import { prisma } from "@/lib/prisma"
import type { UserOption } from "@/types/domain"

/** All users in the workspace, for task assignment and filter controls. */
export async function listUsers(): Promise<UserOption[]> {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })

  return users
}
