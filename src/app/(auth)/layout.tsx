/**
 * Layout for unauthenticated routes (login, register).
 *
 * Centers auth forms on a muted full-viewport background. Does not include
 * dashboard chrome (sidebar, header) so the auth experience stays minimal.
 */
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      {children}
    </div>
  )
}
