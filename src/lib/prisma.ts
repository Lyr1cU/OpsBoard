/**
 * Shared Prisma client singleton for OpsBoard.
 *
 * Imported by server actions, API routes, auth helpers, and the seed script.
 * A single instance avoids exhausting database connections during Next.js hot
 * reload (dev) and across warm serverless invocations (production).
 */

import { PrismaClient } from "@prisma/client"

// Attach the client to globalThis so module re-evaluation reuses the same instance.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

/** Factory so logging policy stays in one place when the client is first created. */
function createPrismaClient() {
  return new PrismaClient({
    // Verbose SQL logging is noisy; warn/error are enough for day-to-day debugging.
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

// Reuse an existing client from a prior import, or create one on first load.
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Persist on globalThis for the next hot reload or function warm start.
globalForPrisma.prisma = prisma
