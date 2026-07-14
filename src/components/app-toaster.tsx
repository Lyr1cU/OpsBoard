/**
 * Global toast host (Sonner) for OpsBoard mutation feedback.
 *
 * Mount once in the root layout. Client components call `toast.*` for
 * success, errors, optimistic rollback, and permission denials.
 */
"use client"

import { Toaster } from "sonner"
import { useTheme } from "next-themes"

export function AppToaster() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        classNames: {
          toast: "border border-border bg-background text-foreground shadow-lg",
        },
      }}
    />
  )
}
