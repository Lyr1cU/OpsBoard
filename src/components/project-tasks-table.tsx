import { Badge } from "@/components/ui/badge"
import { TaskStatusSelect } from "@/components/task-status-select"
import { TaskMobileList } from "@/components/task-mobile-list"
import { cn } from "@/lib/utils"
import type { TaskListItem } from "@/types/domain"
import {
  formatTaskPriority,
  taskInitials,
  taskPriorityStyles,
} from "@/components/task-display-utils"

type ProjectTasksTableProps = {
  tasks: TaskListItem[]
  projectId: string
}

export function ProjectTasksTable({ tasks, projectId }: ProjectTasksTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
        No tasks yet. Add the first task to this project.
      </div>
    )
  }

  return (
    <>
      <TaskMobileList tasks={tasks} projectId={projectId} showProject={false} />

      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assignee</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-muted/20",
                  task.overdue && "bg-destructive/5",
                )}
              >
                <td className="px-4 py-3.5 font-medium text-foreground">{task.title}</td>
                <td className="px-4 py-3.5">
                  <TaskStatusSelect taskId={task.id} status={task.status} projectId={projectId} />
                </td>
                <td className="px-4 py-3.5">
                  <Badge
                    variant="outline"
                    className={cn("rounded-full font-medium", taskPriorityStyles[task.priority])}
                  >
                    {formatTaskPriority(task.priority)}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {taskInitials(task.assignee)}
                    </div>
                    <span className="text-foreground">{task.assignee}</span>
                  </div>
                </td>
                <td
                  className={cn(
                    "px-4 py-3.5",
                    task.overdue ? "font-medium text-destructive" : "text-muted-foreground",
                  )}
                >
                  {task.dueDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
