"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ensureDbUser } from "@/lib/auth/db-user"
import type { AuthActionState } from "@/lib/actions/auth-types"

export type { AuthActionState } from "@/lib/actions/auth-types"

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

export async function register(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

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
      data: { full_name: name },
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

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
