/**
 * Authenticated dashboard shell layout.
 *
 * Wraps all protected workspace routes with persistent navigation (sidebar,
 * header) and a constrained main content area. Fetches the current DB user
 * and project-scoped notifications server-side on every dashboard navigation.
 */
import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { getCurrentDbUser } from "@/lib/auth/db-user"
import { getAccessibleProjectIds, roleLabel } from "@/lib/auth/permissions"
import { listNotifications } from "@/lib/data/notifications"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const currentUser = await getCurrentDbUser()

  const email = currentUser?.email ?? "user@studio.co"
  const name = currentUser?.name ?? (email.split("@")[0] || "User")
  const accountLabel = currentUser ? roleLabel(currentUser.role) : "Member"

  const accessibleIds = currentUser
    ? await getAccessibleProjectIds(currentUser.id).catch(() => [] as string[])
    : []

  const notifications = await listNotifications(accessibleIds).catch(() => [])

  return (
    <div className="flex min-h-screen">
      <AppSidebar userName={name} roleLabel={accountLabel} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader email={email} name={name} roleLabel={accountLabel} notifications={notifications} />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
