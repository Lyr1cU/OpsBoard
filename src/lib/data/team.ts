/**
 * Team / user management data layer.
 *
 * Lists workspace members with roles for the Team page and supports Lead-only
 * role updates with a guard against demoting the last Team Lead.
 */

import { prisma } from "@/lib/prisma"
import type { Role } from "@/types"
import { roleLabel } from "@/lib/auth/permissions"

export type TeamMember = {
  id: string
  name: string
  email: string
  role: Role
  roleLabel: string
  createdAt: string
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleLabel: roleLabel(user.role),
    createdAt: user.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }))
}

/**
 * Update a user's role. Returns an error string when the change would leave
 * the workspace with zero Team Leads.
 */
export async function updateUserRole(
  userId: string,
  role: Role,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) {
    return { ok: false, error: "User not found." }
  }

  if (target.role === "ADMIN" && role === "MEMBER") {
    const leadCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (leadCount <= 1) {
      return { ok: false, error: "Cannot demote the last Team Lead." }
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  return { ok: true }
}
