import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

function displayNameFromAuth(email: string, metadata: Record<string, unknown> | undefined): string {
  const fullName = metadata?.full_name
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim()
  }
  return email.split("@")[0] || "User"
}

export async function ensureDbUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return null
  }

  const name = displayNameFromAuth(user.email, user.user_metadata)
  const userCount = await prisma.user.count()

  return prisma.user.upsert({
    where: { email: user.email },
    create: {
      email: user.email,
      name,
      role: userCount === 0 ? "ADMIN" : "MEMBER",
    },
    update: { name },
  })
}

export async function requireDbUser() {
  const dbUser = await ensureDbUser()
  if (!dbUser) {
    throw new Error("Unauthorized")
  }
  return dbUser
}
