import { LayoutDashboard, FolderKanban, CheckSquare, BarChart3 } from "lucide-react"

export const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
] as const
