"use client"

/**
 * Reusable labeled input primitives for authentication forms.
 *
 * Provides a standard text/email field and a password field with a visibility
 * toggle. Shared Tailwind classes keep auth inputs visually consistent with
 * task and project form controls elsewhere in the app.
 */
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

/** Base styles applied to all auth text inputs for focus and border consistency. */
const inputClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"

type AuthFieldProps = {
  id: string
  name: string
  label: string
  type?: "text" | "email"
  placeholder?: string
  autoComplete?: string
  required?: boolean
}

/** Accessible labeled text or email input for auth forms. */
export function AuthField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  required,
}: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={inputClassName}
      />
    </div>
  )
}

type PasswordFieldProps = {
  id: string
  name: string
  label: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
}

/** Password input with client-side show/hide toggle for usability during entry. */
export function PasswordField({
  id,
  name,
  label,
  placeholder = "••••••••",
  autoComplete,
  required,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={cn(inputClassName, "pr-10")}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  )
}
