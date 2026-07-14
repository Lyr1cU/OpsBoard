"use client"

/**
 * Compact account summary and sign-out control in the dashboard header.
 *
 * Displays the user's initials avatar and identity on sm+ screens. Sign-out is
 * implemented as a server action form submission for a full session teardown.
 */
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { taskInitials } from "@/components/task-display-utils"
import { logout } from "@/lib/actions/auth"

type UserMenuProps = {
  email: string
  name: string
}

export function UserMenu({ email, name }: UserMenuProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {taskInitials(name)}
        </div>
        {/* Name and email hidden on very small screens to reduce clutter */}
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium leading-tight text-foreground">{name}</p>
          <p className="text-xs leading-tight text-muted-foreground">{email}</p>
        </div>
      </div>

      <form action={logout}>
        <Button type="submit" variant="outline" size="sm" className="gap-1.5">
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </form>
    </div>
  )
}
