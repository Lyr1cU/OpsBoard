"use client"

/**
 * Inline status dropdown with optimistic UI (React 19 useOptimistic).
 *
 * Instantly reflects the selected status, then syncs via server action.
 * On failure: optimistic state rolls back with the next server props refresh,
 * and a toast explains the error (including permission denials).
 */
import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"
import { updateTaskStatusAction } from "@/lib/actions/tasks"
import { selectClassName, formatTaskStatus } from "@/components/task-display-utils"
import type { TaskStatus } from "@/types/domain"
import { cn } from "@/lib/utils"

type TaskStatusSelectProps = {
  taskId: string
  status: TaskStatus
  projectId?: string
  disabled?: boolean
  className?: string
}

export function TaskStatusSelect({
  taskId,
  status,
  projectId,
  disabled = false,
  className,
}: TaskStatusSelectProps) {
  const [pending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status)

  function handleChange(nextStatus: TaskStatus) {
    if (nextStatus === optimisticStatus || disabled) return

    startTransition(async () => {
      setOptimisticStatus(nextStatus)
      const result = await updateTaskStatusAction(taskId, nextStatus, projectId)
      if (!result.ok) {
        toast.error(result.error)
      }
    })
  }

  return (
    <select
      value={optimisticStatus}
      disabled={pending || disabled}
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
