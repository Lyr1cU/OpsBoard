/**
 * Dashboard widget listing upcoming deadlines with staggered row entrance.
 */
"use client"

import { motion, useReducedMotion } from "framer-motion"
import { AlertTriangle, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fadeUp, listContainer, listItem } from "@/components/motion-presets"
import { cn } from "@/lib/utils"
import type { DashboardScope, DeadlineItem } from "@/lib/data/dashboard"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

type UpcomingDeadlinesProps = {
  deadlines: DeadlineItem[]
  scope?: DashboardScope
}

export function UpcomingDeadlines({ deadlines, scope = "team" }: UpcomingDeadlinesProps) {
  const overdueCount = deadlines.filter((d) => d.overdue).length
  const reduceMotion = useReducedMotion()
  const personal = scope === "personal"

  return (
    <motion.div
      initial={reduceMotion ? false : fadeUp.hidden}
      animate={fadeUp.show}
      transition={{ duration: 0.22, delay: 0.06 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="text-base">
              {personal ? "Your Deadlines" : "Upcoming Deadlines"}
            </CardTitle>
            <CardDescription>
              {personal ? "Due dates on tasks assigned to you" : "Next tasks due across projects"}
            </CardDescription>
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
              {personal
                ? "No upcoming deadlines on your tasks."
                : "No upcoming deadlines. Add due dates to open tasks."}
            </div>
          ) : (
            <motion.ul
              className="flex flex-col gap-2"
              variants={reduceMotion ? undefined : listContainer}
              initial="hidden"
              animate="show"
            >
              {deadlines.map((item) => (
                <motion.li
                  key={item.id}
                  variants={reduceMotion ? undefined : listItem}
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
                </motion.li>
              ))}
            </motion.ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
