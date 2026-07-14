"use client"

/**
 * Sticky top bar for the authenticated dashboard layout.
 *
 * Combines global search (desktop), theme switching, notifications, and the
 * signed-in user menu. Mobile navigation is exposed via a hamburger trigger
 * that delegates to {@link MobileNav}.
 */
import { Search } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { MobileNav } from "@/components/mobile-nav"
import { NotificationsMenu } from "@/components/notifications-menu"
import type { AppNotification } from "@/lib/data/notifications"

type AppHeaderProps = {
  email: string
  name: string
  roleLabel: string
  notifications: AppNotification[]
}

export function AppHeader({ email, name, roleLabel, notifications }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
      {/* Left cluster: mobile menu + contextual search */}
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav userName={name} roleLabel={roleLabel} />
        {/* Search is decorative for now; hidden on small screens to save space */}
        <div className="relative hidden max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, tasks, clients..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      {/* Right cluster: appearance, alerts, and account actions */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <NotificationsMenu notifications={notifications} />
        <UserMenu email={email} name={name} />
      </div>
    </header>
  )
}
