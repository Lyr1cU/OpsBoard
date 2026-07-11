"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { AllTasksFormDialog } from "@/components/all-tasks-form-dialog"
import { TaskStatusSelect } from "@/components/task-status-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  formatTaskPriority,
  selectClassName,
  taskInitials,
  taskPriorityStyles,
} from "@/components/task-display-utils"
import { cn } from "@/lib/utils"
import type { ProjectListItem, TaskListItem, UserOption } from "@/types/domain"

type TasksBoardProps = {
  tasks: TaskListItem[]
  projects: ProjectListItem[]
  users: UserOption[]
  projectNames: Record<string, string>
}

type FilterValue = "all" | string

export function TasksBoard({ tasks, projects, users, projectNames }: TasksBoardProps) {
  const [projectFilter, setProjectFilter] = useState<FilterValue>("all")
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<FilterValue>("all")
  const [dialogOpen, setDialogOpen] = useState(false)

  const assignees = useMemo(
    () => [...new Set(tasks.map((t) => t.assignee))].sort(),
    [tasks],
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (projectFilter !== "all" && task.projectId !== projectFilter) return false
      if (statusFilter !== "all" && task.status !== statusFilter) return false
      if (assigneeFilter !== "all" && task.assignee !== assigneeFilter) return false
      return true
    })
  }, [tasks, projectFilter, statusFilter, assigneeFilter])

  const hasFilters = projectFilter !== "all" || statusFilter !== "all" || assigneeFilter !== "all"

  function clearFilters() {
    setProjectFilter("all")
    setStatusFilter("all")
    setAssigneeFilter("all")
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="text-sm text-muted-foreground">
            <span>Workspace</span>
            <span className="px-1.5">/</span>
            <span className="font-medium text-foreground">Tasks</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasks</h1>
        </div>

        <Button onClick={() => setDialogOpen(true)} disabled={projects.length === 0}>
          <Plus className="size-4" />
          New task
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Project</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className={cn(selectClassName, "min-w-[180px]")}
            >
              <option value="all">All</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterValue)}
              className={cn(selectClassName, "min-w-[140px]")}
            >
              <option value="all">All</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Assignee</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className={cn(selectClassName, "min-w-[160px]")}
            >
              <option value="all">All</option>
              {assignees.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-10 px-4 py-3 text-left font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                Project
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                Priority
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                Assignee
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  {tasks.length === 0 ? "No tasks yet. Create your first task." : "No tasks match the selected filters."}
                </td>
              </tr>
            ) : (
              filteredTasks.map((task, index) => (
                <tr
                  key={task.id}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-muted/20",
                    task.overdue && "bg-destructive/5",
                  )}
                >
                  <td className="px-4 py-3.5 text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3.5 font-medium text-foreground">{task.title}</td>
                  <td className="hidden px-4 py-3.5 text-muted-foreground md:table-cell">
                    {projectNames[task.projectId] ?? "Unknown project"}
                  </td>
                  <td className="px-4 py-3.5">
                    <TaskStatusSelect taskId={task.id} status={task.status} projectId={task.projectId} />
                  </td>
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full font-medium", taskPriorityStyles[task.priority])}
                    >
                      {formatTaskPriority(task.priority)}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3.5 lg:table-cell">
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <AllTasksFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        projects={projects.filter((p) => p.status === "ACTIVE")}
        users={users}
      />
    </>
  )
}
