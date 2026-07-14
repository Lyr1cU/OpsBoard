/**
 * Primary navigation configuration for the OpsBoard dashboard shell.
 *
 * Centralizes route labels, icons, and hrefs so the sidebar and mobile drawer
 * stay in sync without duplicating navigation markup.
 */
import { LayoutDashboard, FolderKanban, CheckSquare, BarChart3, Users } from "lucide-react"

/** Ordered list of top-level workspace routes rendered in sidebar and mobile nav. */
export const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
  { label: "Team", icon: Users, href: "/team" },
] as const
