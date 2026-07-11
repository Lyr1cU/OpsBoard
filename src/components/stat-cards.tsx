import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DashboardStat } from "@/lib/data/dashboard"

type StatCardsProps = {
  stats: DashboardStat[]
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const isOverdue = stat.highlight === "destructive"
        return (
          <Card key={stat.label} className="p-5">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p
              className={cn(
                "mt-3 text-3xl font-semibold tracking-tight",
                isOverdue ? "text-destructive" : "text-foreground",
              )}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </Card>
        )
      })}
    </div>
  )
}
