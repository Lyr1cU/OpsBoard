/**
 * Supabase session refresh and route protection for OpsBoard middleware.
 *
 * Invoked from src/middleware.ts on every matched request. Validates the
 * JWT via getUser(), redirects unauthenticated users to /login, and sends
 * signed-in users away from auth pages. Must forward cookie updates on the
 * response so refreshed tokens reach the browser.
 */

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Paths reachable without a Supabase session (login flow + OAuth callback).
const publicRoutes = ["/login", "/register", "/auth/callback"]

/**
 * Refresh session cookies and enforce auth redirects.
 * Returns a NextResponse (redirect or next) with updated Supabase cookies.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Mirror new cookies on the request for downstream handlers in this chain.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // Rebuild the response so Set-Cookie headers include refreshed tokens.
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Validates JWT server-side — prefer over getSession() for security-sensitive checks.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Dashboard and API routes require authentication.
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Signed-in users should not see login/register again.
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
