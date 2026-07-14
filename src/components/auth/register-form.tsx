"use client"

/**
 * Registration form wired to the {@link register} server action.
 *
 * Collects name, email, password, and account type (Team Lead / Member).
 */
import Link from "next/link"
import { useActionState } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthField, PasswordField } from "@/components/auth/auth-fields"
import { Button } from "@/components/ui/button"
import { register } from "@/lib/actions/auth"
import type { AuthActionState } from "@/lib/actions/auth-types"

const initialState: AuthActionState = {}

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState)

  return (
    <AuthCard title="Create your OpsBoard account">
      <form action={formAction} className="space-y-5">
        <AuthField
          id="name"
          name="name"
          label="Full name"
          placeholder="Jordan Diaz"
          autoComplete="name"
          required
        />
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
          autoComplete="new-password"
          required
        />

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-foreground">
            Account type
          </label>
          <select id="role" name="role" defaultValue="MEMBER" className={selectClassName} required>
            <option value="ADMIN">Team Lead</option>
            <option value="MEMBER">Member</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Team Leads can create projects. Members join projects when invited by email.
          </p>
        </div>

        {state.error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            {state.success}
          </p>
        )}

        <Button type="submit" className="mt-2 h-10 w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
