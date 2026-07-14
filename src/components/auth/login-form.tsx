"use client"

/**
 * Sign-in form wired to the {@link login} server action.
 *
 * Uses React 19 `useActionState` for progressive enhancement: the form works
 * without JavaScript and surfaces server-side validation errors inline.
 */
import Link from "next/link"
import { useActionState } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthField, PasswordField } from "@/components/auth/auth-fields"
import { Button } from "@/components/ui/button"
import { login } from "@/lib/actions/auth"
import type { AuthActionState } from "@/lib/actions/auth-types"

const initialState: AuthActionState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <AuthCard title="Sign in to OpsBoard">
      <form action={formAction} className="space-y-5">
        <AuthField
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="name@company.com"
          autoComplete="email"
          required
        />
        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
        />

        {state.error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <Button type="submit" className="mt-2 h-10 w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
