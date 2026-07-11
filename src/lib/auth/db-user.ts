import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

function displayNameFromAuth(email: string, metadata: Record<string, unknown> | undefined): string {
  const fullName = metadata?.full_name
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim()
  }
  return email.split("@")[0] || "User"
}

/** One auth lookup per request (layout + pages share this). */
export const getSessionUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Sync Supabase auth user → Prisma User.
 * Call on login/register and before mutations — not on every page navigation.
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
    if (existing.name === name) {
      return existing
    }
    return prisma.user.update({
      where: { id: existing.id },
      data: { name },
    })
  }

  const userCount = await prisma.user.count()

  return prisma.user.create({
    data: {
      email: user.email,
      name,
      role: userCount === 0 ? "ADMIN" : "MEMBER",
    },
  })
}

export async function requireDbUser() {
  const dbUser = await ensureDbUser()
  if (!dbUser) {
    throw new Error("Unauthorized")
  }
  return dbUser
}
