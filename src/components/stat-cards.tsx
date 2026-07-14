/**
 * Dashboard KPI row with staggered fade-up entrance (same feel as Projects/Tasks).
 */
"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { listContainer, listItem } from "@/components/motion-presets"
import { cn } from "@/lib/utils"
import type { DashboardStat } from "@/lib/data/dashboard"

type StatCardsProps = {
  stats: DashboardStat[]
}

export function StatCards({ stats }: StatCardsProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
      variants={reduceMotion ? undefined : listContainer}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat) => {
        const isOverdue = stat.highlight === "destructive"
        return (
          <motion.div key={stat.label} variants={reduceMotion ? undefined : listItem}>
            <Card className="p-5">
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
          </motion.div>
        )
      })}
    </motion.div>
  )
}
