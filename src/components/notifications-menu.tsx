"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AlertTriangle, Bell, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppNotification } from "@/lib/data/notifications"

type NotificationsMenuProps = {
  notifications: AppNotification[]
}

export function NotificationsMenu({ notifications }: NotificationsMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const count = notifications.length
  const overdueCount = notifications.filter((n) => n.kind === "overdue").length

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={count > 0 ? `${count} notifications` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
          open && "bg-secondary text-foreground",
        )}
      >
        <Bell className="size-5" />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white ring-2 ring-card">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {count === 0
                  ? "You're all caught up"
                  : overdueCount > 0
                    ? `${overdueCount} overdue · ${count} total`
                    : `${count} upcoming`}
              </p>
            </div>
            <Link
              href="/tasks"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-primary hover:underline"
            >
              View tasks
            </Link>
          </div>

          {count === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No overdue or soon-due tasks.
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {notifications.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                        item.kind === "overdue"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {item.kind === "overdue" ? (
                        <AlertTriangle className="size-4" />
                      ) : (
                        <Clock className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.project}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs font-medium",
                          item.kind === "overdue" ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {item.dueLabel}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
