import { Badge } from "@/components/ui/badge"
import { TaskStatusSelect } from "@/components/task-status-select"
import {
  formatTaskPriority,
  taskInitials,
  taskPriorityStyles,
} from "@/components/task-display-utils"
import { cn } from "@/lib/utils"
import type { TaskListItem } from "@/types/domain"

type TaskMobileListProps = {
  tasks: TaskListItem[]
  projectId?: string
  projectNames?: Record<string, string>
  showProject?: boolean
  emptyMessage?: string
}

export function TaskMobileList({
  tasks,
  projectId,
  projectNames,
  showProject = true,
  emptyMessage = "No tasks to show.",
}: TaskMobileListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground md:hidden">
        {emptyMessage}
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={cn(
            "rounded-lg border border-border bg-card p-4 shadow-sm",
            task.overdue && "border-destructive/30 bg-destructive/5",
          )}
        >
          <p className="font-medium leading-snug text-foreground">{task.title}</p>

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
        </li>
      ))}
    </ul>
  )
}
