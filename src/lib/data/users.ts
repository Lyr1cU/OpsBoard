import { prisma } from "@/lib/prisma"
import type { UserOption } from "@/types/domain"

export async function listUsers(): Promise<UserOption[]> {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })

  return users
}
