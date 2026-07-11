import { AppShell } from "@/components/app-shell"
import { StatCards } from "@/components/stat-cards"
import { TasksStatusChart } from "@/components/tasks-status-chart"
import { UpcomingDeadlines } from "@/components/upcoming-deadlines"

export default function DashboardPage() {
  return (
    <AppShell>
      {/* Page heading */}
      <div className="space-y-1">
        <nav className="text-sm text-muted-foreground">
          <span>Workspace</span>
          <span className="px-1.5">/</span>
          <span className="font-medium text-foreground">Dashboard</span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Jordan. Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="mt-6">
        <StatCards />
      </div>

      {/* Chart + deadlines */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <TasksStatusChart />
        </div>
        <div className="lg:col-span-3">
          <UpcomingDeadlines />
        </div>
      </div>
    </AppShell>
  )
}
