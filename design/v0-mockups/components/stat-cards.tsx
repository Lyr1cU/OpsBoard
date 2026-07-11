import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { stats } from "@/lib/mock-data"

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const isOverdue = stat.label === "Overdue"
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight
        return (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                  isOverdue
                    ? "bg-destructive/10 text-destructive"
                    : "bg-accent text-accent-foreground",
                )}
              >
                <TrendIcon className="size-3" />
                {stat.delta}
              </span>
            </div>
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
