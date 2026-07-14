"use client"

/**
 * Persistent left navigation rail for large viewports (lg+).
 *
 * Highlights the active route, renders workspace links from {@link navItems},
 * and shows a compact user identity block at the bottom.
 */
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Layers } from "lucide-react"
import { navItems } from "@/components/nav-items"
import { taskInitials } from "@/components/task-display-utils"
import { cn } from "@/lib/utils"

export function AppSidebar({ userName, roleLabel }: { userName: string; roleLabel: string }) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      {/* Product branding */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Layers className="size-5" />
        </div>
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">OpsBoard</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        {navItems.map((item) => {
          // Dashboard uses exact match; nested routes use prefix matching
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Signed-in user summary (read-only; sign-out lives in the header) */}
      <div className="mt-auto border-t border-sidebar-border p-3">
        <div className="flex w-full min-w-0 items-center gap-3 rounded-md px-3 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {taskInitials(userName)}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
