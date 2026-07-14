/**
 * Next.js root middleware for OpsBoard.
 *
 * Runs at the edge before routes render. Delegates session refresh and auth
 * redirects to lib/supabase/middleware. The matcher skips static assets so
 * images and Next internals are not slowed by Supabase round-trips.
 */

import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // All routes except Next static files, favicon, and common image extensions.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
