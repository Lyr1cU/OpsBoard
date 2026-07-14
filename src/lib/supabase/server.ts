/**
 * Server-side Supabase client for OpsBoard (Server Components, actions, routes).
 *
 * Reads and writes auth cookies via Next.js `cookies()` so session state stays
 * in sync with middleware. The setAll catch is intentional: Server Components
 * cannot always mutate cookies — middleware refreshes the session on navigation.
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/** Async because Next.js 15+ cookies() is a Promise in some contexts. */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from a Server Component — middleware refreshes the session.
          }
        },
      },
    },
  )
}
