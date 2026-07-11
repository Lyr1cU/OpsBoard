import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { getSessionUser } from "@/lib/auth/db-user"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()

  const email = user?.email ?? "user@studio.co"
  const name =
    (typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    email.split("@")[0] ||
    "User"

  return (
    <div className="flex min-h-screen">
      <AppSidebar userName={name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader email={email} name={name} />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
