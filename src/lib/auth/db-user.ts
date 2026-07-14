/**
 * Bridge between Supabase Auth and the Prisma User table.
 *
 * Supabase owns authentication (passwords, sessions); Prisma owns app data
 * (tasks, reports, roles). This module syncs the two on login/register and
 * exposes helpers for server code that needs a guaranteed database user row.
 */

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import type { CurrentUser } from "@/lib/auth/permissions"
import type { Role } from "@/types"
import type { User } from "@supabase/supabase-js"

/** Prefer full_name from OAuth/sign-up metadata; fall back to email local-part. */
function displayNameFromAuth(email: string, metadata: Record<string, unknown> | undefined): string {
  const fullName = metadata?.full_name
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim()
  }
  return email.split("@")[0] || "User"
}

/** Read account_role from Supabase user_metadata when present and valid. */
function preferredRoleFromMetadata(metadata: Record<string, unknown> | undefined): Role | null {
  const accountRole = metadata?.account_role
  if (accountRole === "ADMIN" || accountRole === "MEMBER") {
    return accountRole
  }
  return null
}

/**
 * Cached Supabase user lookup — deduplicates auth calls when layout and page
 * both need the session in the same React request.
 */
export const getSessionUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Ensure a Prisma User exists for the current (or passed) Supabase user.
 * Call on login/register and before mutations — not on every page navigation.
 * Existing users keep their role; only name may be refreshed.
 */
export async function ensureDbUser(authUser?: User | null) {
  const user = authUser === undefined ? await getSessionUser() : authUser

  if (!user?.email) {
    return null
  }

  const name = displayNameFromAuth(user.email, user.user_metadata)

  const existing = await prisma.user.findUnique({
    where: { email: user.email },
  })

  if (existing) {
    // Do not overwrite role on login — account type is set at registration.
    if (existing.name === name) {
      return existing
    }
    return prisma.user.update({
      where: { id: existing.id },
      data: { name },
    })
  }

  const preferredRole = preferredRoleFromMetadata(user.user_metadata)
  const userCount = await prisma.user.count()
  // Prefer metadata role; otherwise first user becomes ADMIN for bootstrap.
  const role: Role = preferredRole ?? (userCount === 0 ? "ADMIN" : "MEMBER")

  return prisma.user.create({
    data: {
      email: user.email,
      name,
      role,
    },
  })
}

/** Like ensureDbUser but throws — use in mutations that must not run anonymously. */
export async function requireDbUser() {
  const dbUser = await ensureDbUser()
  if (!dbUser) {
    throw new Error("Unauthorized")
  }
  return dbUser
}

/**
 * Resolve the Prisma user for the current session.
 * Looks up by email first; if missing (rare race after register), ensures a row.
 */
export const getCurrentDbUser = cache(async (): Promise<CurrentUser | null> => {
  const authUser = await getSessionUser()
  if (!authUser?.email) return null

  let dbUser = await prisma.user.findUnique({
    where: { email: authUser.email },
    select: { id: true, name: true, email: true, role: true },
  })

  if (!dbUser) {
    const ensured = await ensureDbUser(authUser)
    if (!ensured) return null
    dbUser = {
      id: ensured.id,
      name: ensured.name,
      email: ensured.email,
      role: ensured.role,
    }
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
  }
})
