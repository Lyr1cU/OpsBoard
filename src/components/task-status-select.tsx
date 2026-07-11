"use client"

import { useTransition } from "react"
import { updateTaskStatusAction } from "@/lib/actions/tasks"
import { selectClassName, formatTaskStatus } from "@/components/task-display-utils"
import type { TaskStatus } from "@/types/domain"
import { cn } from "@/lib/utils"

type TaskStatusSelectProps = {
  taskId: string
  status: TaskStatus
  projectId?: string
  className?: string
}

export function TaskStatusSelect({ taskId, status, projectId, className }: TaskStatusSelectProps) {
  const [pending, startTransition] = useTransition()

  function handleChange(nextStatus: TaskStatus) {
    if (nextStatus === status) return
    startTransition(async () => {
      await updateTaskStatusAction(taskId, nextStatus, projectId)
    })
  }

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as TaskStatus)}
      className={cn(selectClassName, "h-8 min-w-[130px] text-xs font-medium", className)}
      aria-label="Task status"
    >
      <option value="TODO">{formatTaskStatus("TODO")}</option>
      <option value="IN_PROGRESS">{formatTaskStatus("IN_PROGRESS")}</option>
      <option value="DONE">{formatTaskStatus("DONE")}</option>
    </select>
  )
}
