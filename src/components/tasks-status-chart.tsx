"use client"

import { Pie, PieChart, Cell } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import type { TaskStatusSlice } from "@/lib/data/dashboard"

const chartConfig = {
  count: { label: "Tasks" },
  "To Do": { label: "To Do", color: "var(--chart-3)" },
  "In Progress": { label: "In Progress", color: "var(--chart-2)" },
  Done: { label: "Done", color: "var(--chart-1)" },
} satisfies ChartConfig

type TasksStatusChartProps = {
  tasksByStatus: TaskStatusSlice[]
}

export function TasksStatusChart({ tasksByStatus }: TasksStatusChartProps) {
  const total = tasksByStatus.reduce((sum, s) => sum + s.count, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Tasks by Status</CardTitle>
        <CardDescription>Distribution across all active projects</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center gap-4">
        {total === 0 ? (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
            No tasks yet. Create a project and add tasks to see the chart.
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[240px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={tasksByStatus} dataKey="count" nameKey="status" innerRadius={58} strokeWidth={2}>
                  {tasksByStatus.map((slice) => (
                    <Cell key={slice.status} fill={slice.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
              {tasksByStatus.map((slice) => (
                <div key={slice.status} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.fill }} />
                    <span className="truncate text-sm text-muted-foreground">{slice.status}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {Math.round((slice.count / total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
