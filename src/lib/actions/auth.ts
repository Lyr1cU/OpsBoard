/**
 * Authentication Server Actions for OpsBoard.
 *
 * Bridges HTML forms to Supabase Auth (sign-in, sign-up, sign-out) and keeps the
 * local Prisma `User` row in sync via `ensureDbUser`. Uses Next.js `redirect` for
 * post-auth navigation; validation failures return `AuthActionState` for the client.
 */

"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ensureDbUser } from "@/lib/auth/db-user"
import type { AuthActionState } from "@/lib/actions/auth-types"
import type { Role } from "@/types"

// Re-export so consumers can import state type from the action module.
export type { AuthActionState } from "@/lib/actions/auth-types"

/**
 * Sign in with email/password. On success, syncs DB user and redirects to dashboard.
 * Compatible with useActionState: `_prevState` is unused but required by the hook API.
 */
export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  await ensureDbUser()
  redirect("/")
}

/**
 * Register a new account. Stores account_role in auth metadata so ensureDbUser
 * can provision ADMIN (Team Lead) or MEMBER on first sync.
 */
export async function register(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const roleRaw = String(formData.get("role") ?? "").trim()
  const role: Role = roleRaw === "ADMIN" || roleRaw === "MEMBER" ? roleRaw : "MEMBER"

  if (!name || !email || !password) {
    return { error: "All fields are required." }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, account_role: role },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session) {
    await ensureDbUser()
    redirect("/")
  }

  return {
    success: "Account created. Check your email to confirm, then sign in.",
  }
}

/** Clear Supabase session cookies and send user to the login page. */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
