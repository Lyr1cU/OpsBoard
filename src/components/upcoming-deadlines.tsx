import { AlertTriangle, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DeadlineItem } from "@/lib/data/dashboard"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

type UpcomingDeadlinesProps = {
  deadlines: DeadlineItem[]
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  const overdueCount = deadlines.filter((d) => d.overdue).length

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
          <CardDescription>Next tasks due across projects</CardDescription>
        </div>
        {overdueCount > 0 && (
          <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
            {overdueCount} overdue
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {deadlines.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-sm text-muted-foreground">
            No upcoming deadlines. Add due dates to open tasks.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {deadlines.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  item.overdue
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border bg-background hover:bg-secondary/50",
                )}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    item.overdue
                      ? "bg-destructive/15 text-destructive"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {initials(item.assignee)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.task}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.project} · {item.assignee}
                  </p>
                </div>

                <div
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 text-xs font-medium",
                    item.overdue ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {item.overdue ? <AlertTriangle className="size-3.5" /> : <Clock className="size-3.5" />}
                  <span className="whitespace-nowrap">{item.due}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
