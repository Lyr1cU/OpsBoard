/**
 * Compact recent-activity feed with fade-up + staggered rows.
 */
"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fadeUp, listContainer, listItem } from "@/components/motion-presets"
import type { ActivityListItem } from "@/lib/data/activity"

type RecentActivityProps = {
  items: ActivityListItem[]
}

export function RecentActivity({ items }: RecentActivityProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : fadeUp.hidden}
      animate={fadeUp.show}
      transition={{ duration: 0.22, delay: 0.1 }}
    >
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No activity yet. Changes to tasks, projects, and roles will show up here.
            </p>
          ) : (
            <motion.ul
              className="space-y-3"
              variants={reduceMotion ? undefined : listContainer}
              initial="hidden"
              animate="show"
            >
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  variants={reduceMotion ? undefined : listItem}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="text-foreground">{item.summary}</p>
                    <p className="text-xs text-muted-foreground">{item.actorName}</p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">{item.createdAt}</time>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
