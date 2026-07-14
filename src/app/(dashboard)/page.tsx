/**
 * Dashboard home page (/).
 *
 * Team Leads see team-wide stats for accessible projects.
 * Members see a personal workload view (their assigned tasks only).
 */
import { redirect } from "next/navigation"
import { StatCards } from "@/components/stat-cards"
import { TasksStatusChart } from "@/components/tasks-status-chart"
import { UpcomingDeadlines } from "@/components/upcoming-deadlines"
import { RecentActivity } from "@/components/recent-activity"
import { getDashboardData } from "@/lib/data/dashboard"
import { listRecentActivity } from "@/lib/data/activity"
import { getCurrentDbUser } from "@/lib/auth/db-user"
import {
  getAccessibleProjectIds,
  isTeamLeadAccount,
  roleLabel,
} from "@/lib/auth/permissions"

export default async function DashboardPage() {
  const currentUser = await getCurrentDbUser()
  if (!currentUser) redirect("/login")

  const accessibleIds = await getAccessibleProjectIds(currentUser.id)
  const isLead = isTeamLeadAccount(currentUser.role)
  const name = currentUser.name

  const [{ scope, stats, tasksByStatus, deadlines }, activity] = await Promise.all([
    getDashboardData({
      accessibleProjectIds: accessibleIds,
      assigneeId: isLead ? undefined : currentUser.id,
    }),
    listRecentActivity(12).catch(() => []),
  ])

  const welcome = isLead
    ? `Welcome back, ${name} · ${roleLabel(currentUser.role)}. Here's what's happening across your projects.`
    : `Welcome back, ${name}. Here's your personal workload for today.`

  return (
    <>
      <div className="space-y-1">
        <nav className="text-sm text-muted-foreground">
          <span>Workspace</span>
          <span className="px-1.5">/</span>
          <span className="font-medium text-foreground">Dashboard</span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{welcome}</p>
      </div>

      <div className="mt-6">
        <StatCards stats={stats} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <TasksStatusChart tasksByStatus={tasksByStatus} scope={scope} />
        </div>
        <div className="lg:col-span-3">
          <UpcomingDeadlines deadlines={deadlines} scope={scope} />
        </div>
      </div>

      <div className="mt-6">
        <RecentActivity items={activity} />
      </div>
    </>
  )
}
