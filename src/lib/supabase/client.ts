/**
 * Browser-side Supabase client for OpsBoard.
 *
 * Used in Client Components (login/register forms, client-only auth flows).
 * Reads public env vars — safe to expose in the browser; Row Level Security
 * and server-side checks enforce actual authorization.
 */

import { createBrowserClient } from "@supabase/ssr"

/** Create a fresh browser client bound to the current tab's cookie jar. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
