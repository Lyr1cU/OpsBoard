"use client"

import { Search } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { MobileNav } from "@/components/mobile-nav"
import { NotificationsMenu } from "@/components/notifications-menu"
import type { AppNotification } from "@/lib/data/notifications"

type AppHeaderProps = {
  email: string
  name: string
  notifications: AppNotification[]
}

export function AppHeader({ email, name, notifications }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav userName={name} />
        <div className="relative hidden max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, tasks, clients..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <NotificationsMenu notifications={notifications} />
        <UserMenu email={email} name={name} />
      </div>
    </header>
  )
}
