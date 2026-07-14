"use client"

/**
 * Card-based task list optimized for viewports below the md breakpoint.
 *
 * Shared between the global tasks page and project detail view.
 */
import { motion, useReducedMotion } from "framer-motion"
import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TaskStatusSelect } from "@/components/task-status-select"
import {
  formatTaskPriority,
  taskInitials,
  taskPriorityStyles,
} from "@/components/task-display-utils"
import {
  canUpdateTaskStatus,
  type CurrentUser,
  type ProjectAccess,
} from "@/lib/auth/permissions"
import { listContainer, listItem } from "@/components/motion-presets"
import { cn } from "@/lib/utils"
import type { TaskListItem } from "@/types/domain"

type TaskMobileListProps = {
  tasks: TaskListItem[]
  projectId?: string
  projectNames?: Record<string, string>
  showProject?: boolean
  emptyMessage?: string
  currentUser?: CurrentUser
  /** When set (project detail), used for all rows. */
  isProjectLead?: boolean
  /** When set (tasks index), per-row lead check. */
  leadProjectIds?: string[]
  canEditTasks?: boolean
  onEditTask?: (task: TaskListItem) => void
  onDeleteTask?: (task: TaskListItem) => void
}

function accessFromLead(isProjectLead: boolean): ProjectAccess {
  return {
    canView: true,
    isProjectLead,
    isProjectMember: true,
    projectRole: isProjectLead ? "PROJECT_LEAD" : "PROJECT_MEMBER",
  }
}

export function TaskMobileList({
  tasks,
  projectId,
  projectNames,
  showProject = true,
  emptyMessage = "No tasks to show.",
  currentUser,
  isProjectLead,
  leadProjectIds,
  canEditTasks = false,
  onEditTask,
  onDeleteTask,
}: TaskMobileListProps) {
  const reduceMotion = useReducedMotion()
  const leadSet = leadProjectIds ? new Set(leadProjectIds) : null

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground md:hidden">
        {emptyMessage}
      </div>
    )
  }

  return (
    <motion.ul
      className="flex flex-col gap-3 md:hidden"
      variants={reduceMotion ? undefined : listContainer}
      initial="hidden"
      animate="show"
    >
      {tasks.map((task) => {
        const rowIsLead =
          isProjectLead ?? (leadSet ? leadSet.has(task.projectId) : false)
        const statusDisabled = currentUser
          ? !canUpdateTaskStatus(accessFromLead(rowIsLead), currentUser, task)
          : false
        const showEdit = canEditTasks && rowIsLead

        return (
          <motion.li
            key={task.id}
            variants={reduceMotion ? undefined : listItem}
            className={cn(
              "rounded-lg border border-border bg-card p-4 shadow-sm",
              task.overdue && "border-destructive/30 bg-destructive/5",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium leading-snug text-foreground">{task.title}</p>
              {showEdit && (
                <div className="flex shrink-0 gap-1">
                  {onEditTask && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onEditTask(task)}
                      aria-label={`Edit ${task.title}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                  {onDeleteTask && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onDeleteTask(task)}
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {showProject && (
              <p className="mt-1 text-xs text-muted-foreground">
                {projectNames?.[task.projectId] ?? "Unknown project"}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TaskStatusSelect
                taskId={task.id}
                status={task.status}
                projectId={projectId ?? task.projectId}
                disabled={statusDisabled}
                className="h-8 w-full max-w-none min-w-0 sm:w-auto sm:min-w-[130px]"
              />
              <Badge
                variant="outline"
                className={cn("rounded-full font-medium", taskPriorityStyles[task.priority])}
              >
                {formatTaskPriority(task.priority)}
              </Badge>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  {taskInitials(task.assignee)}
                </div>
                <span className="truncate text-muted-foreground">{task.assignee}</span>
              </div>
              <span
                className={cn(
                  "shrink-0 font-medium",
                  task.overdue ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {task.dueDate}
              </span>
            </div>
          </motion.li>
        )
      })}
    </motion.ul>
  )
}
