import { StatCards } from "@/components/stat-cards"
import { TasksStatusChart } from "@/components/tasks-status-chart"
import { UpcomingDeadlines } from "@/components/upcoming-deadlines"
import { getDashboardData } from "@/lib/data/dashboard"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const name =
    (typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    user?.email?.split("@")[0] ||
    "there"

  const { stats, tasksByStatus, deadlines } = await getDashboardData()

  return (
    <>
      <div className="space-y-1">
        <nav className="text-sm text-muted-foreground">
          <span>Workspace</span>
          <span className="px-1.5">/</span>
          <span className="font-medium text-foreground">Dashboard</span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {name}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="mt-6">
        <StatCards stats={stats} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <TasksStatusChart tasksByStatus={tasksByStatus} />
        </div>
        <div className="lg:col-span-3">
          <UpcomingDeadlines deadlines={deadlines} />
        </div>
      </div>
    </>
  )
}
