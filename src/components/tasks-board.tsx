"use client"

/**
 * Global tasks index with client-side filters, My tasks chip, and project-scoped RBAC.
 *
 * Project Leads can create/edit/delete on their projects. Members may change status
 * only on tasks assigned to them within projects they can access.
 */
import { useMemo, useState, useTransition } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AllTasksFormDialog } from "@/components/all-tasks-form-dialog"
import { TaskFormDialog } from "@/components/task-form-dialog"
import { TaskStatusSelect } from "@/components/task-status-select"
import { TaskMobileList } from "@/components/task-mobile-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  formatTaskPriority,
  selectClassName,
  taskInitials,
  taskPriorityStyles,
} from "@/components/task-display-utils"
import { deleteTaskAction } from "@/lib/actions/tasks"
import {
  canUpdateTaskStatus,
  type CurrentUser,
  type ProjectAccess,
} from "@/lib/auth/permissions"
import { listContainer, listItem } from "@/components/motion-presets"
import { cn } from "@/lib/utils"
import type { ProjectListItem, TaskListItem, UserOption } from "@/types/domain"

type TasksBoardProps = {
  tasks: TaskListItem[]
  projects: ProjectListItem[]
  assigneesByProject: Record<string, UserOption[]>
  projectNames: Record<string, string>
  currentUser: CurrentUser
  leadProjectIds: string[]
}

type FilterValue = "all" | string

function accessForProject(leadProjectIds: Set<string>, projectId: string): ProjectAccess {
  const isProjectLead = leadProjectIds.has(projectId)
  return {
    canView: true,
    isProjectLead,
    isProjectMember: true,
    projectRole: isProjectLead ? "PROJECT_LEAD" : "PROJECT_MEMBER",
  }
}

export function TasksBoard({
  tasks,
  projects,
  assigneesByProject,
  projectNames,
  currentUser,
  leadProjectIds,
}: TasksBoardProps) {
  const [projectFilter, setProjectFilter] = useState<FilterValue>("all")
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<FilterValue>("all")
  const [myTasksOnly, setMyTasksOnly] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState<TaskListItem | null>(null)
  const [pending, startTransition] = useTransition()
  const reduceMotion = useReducedMotion()
  const leadSet = useMemo(() => new Set(leadProjectIds), [leadProjectIds])
  const canCreate = leadProjectIds.length > 0
  const leadProjects = useMemo(
    () => projects.filter((p) => leadSet.has(p.id) && p.status === "ACTIVE"),
    [projects, leadSet],
  )

  const assignees = useMemo(
    () => [...new Set(tasks.map((t) => t.assignee))].sort(),
    [tasks],
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (myTasksOnly && task.assigneeId !== currentUser.id) return false
      if (projectFilter !== "all" && task.projectId !== projectFilter) return false
      if (statusFilter !== "all" && task.status !== statusFilter) return false
      if (assigneeFilter !== "all" && task.assignee !== assigneeFilter) return false
      return true
    })
  }, [tasks, projectFilter, statusFilter, assigneeFilter, myTasksOnly, currentUser.id])

  const hasFilters =
    projectFilter !== "all" ||
    statusFilter !== "all" ||
    assigneeFilter !== "all" ||
    myTasksOnly

  const emptyMessage =
    tasks.length === 0
      ? "No tasks yet. Create your first task."
      : "No tasks match the selected filters."

  function clearFilters() {
    setProjectFilter("all")
    setStatusFilter("all")
    setAssigneeFilter("all")
    setMyTasksOnly(false)
  }

  function handleDelete(task: TaskListItem) {
    if (!window.confirm(`Delete task “${task.title}”?`)) return
    startTransition(async () => {
      const result = await deleteTaskAction(task.id, task.projectId)
      if (result.error) toast.error(result.error)
      else if (result.success) toast.success(result.success)
    })
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

        {canCreate && (
          <Button onClick={() => setCreateOpen(true)} disabled={leadProjects.length === 0}>
            <Plus className="size-4" />
            New task
          </Button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-end sm:gap-4">
          <button
            type="button"
            onClick={() => setMyTasksOnly((v) => !v)}
            className={cn(
              "h-9 rounded-md border px-3 text-sm font-medium transition-colors",
              myTasksOnly
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            My tasks
          </button>

          <label className="flex w-full flex-col gap-1.5 sm:w-auto">
            <span className="text-xs font-medium text-muted-foreground">Project</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className={cn(selectClassName, "w-full sm:min-w-[180px]")}
            >
              <option value="all">All</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex w-full flex-col gap-1.5 sm:w-auto">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterValue)}
              className={cn(selectClassName, "w-full sm:min-w-[140px]")}
            >
              <option value="all">All</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>

          <label className="flex w-full flex-col gap-1.5 sm:w-auto">
            <span className="text-xs font-medium text-muted-foreground">Assignee</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className={cn(selectClassName, "w-full sm:min-w-[160px]")}
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
            className="text-left text-sm font-medium text-primary hover:underline sm:text-right"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-6">
        <TaskMobileList
          tasks={filteredTasks}
          projectNames={projectNames}
          emptyMessage={emptyMessage}
          currentUser={currentUser}
          leadProjectIds={leadProjectIds}
          canEditTasks={canCreate}
          onEditTask={(task) => {
            if (leadSet.has(task.projectId)) setEditTask(task)
          }}
          onDeleteTask={(task) => {
            if (leadSet.has(task.projectId)) handleDelete(task)
          }}
        />

        <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
          <motion.table
            className="w-full min-w-[800px] text-sm"
            variants={reduceMotion ? undefined : listContainer}
            initial="hidden"
            animate="show"
          >
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-10 px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Project</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assignee</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due Date</th>
                {canCreate && (
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={canCreate ? 8 : 7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, index) => {
                  const access = accessForProject(leadSet, task.projectId)
                  const statusDisabled = !canUpdateTaskStatus(access, currentUser, task)
                  const canEditRow = leadSet.has(task.projectId)
                  return (
                    <motion.tr
                      key={task.id}
                      variants={reduceMotion ? undefined : listItem}
                      className={cn(
                        "border-b border-border last:border-0 hover:bg-muted/20",
                        task.overdue && "bg-destructive/5",
                      )}
                    >
                      <td className="px-4 py-3.5 text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-3.5 font-medium text-foreground">{task.title}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {projectNames[task.projectId] ?? "Unknown project"}
                      </td>
                      <td className="px-4 py-3.5">
                        <TaskStatusSelect
                          taskId={task.id}
                          status={task.status}
                          projectId={task.projectId}
                          disabled={statusDisabled}
                        />
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
                      {canCreate && (
                        <td className="px-4 py-3.5">
                          {canEditRow ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setEditTask(task)}
                                aria-label={`Edit ${task.title}`}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled={pending}
                                onClick={() => handleDelete(task)}
                                aria-label={`Delete ${task.title}`}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          ) : null}
                        </td>
                      )}
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </motion.table>
        </div>
      </div>

      {canCreate && (
        <>
          {createOpen && (
            <AllTasksFormDialog
              open={createOpen}
              onClose={() => setCreateOpen(false)}
              projects={leadProjects}
              assigneesByProject={assigneesByProject}
            />
          )}
          {editTask && leadSet.has(editTask.projectId) && (
            <TaskFormDialog
              key={editTask.id}
              open={Boolean(editTask)}
              onClose={() => setEditTask(null)}
              projectId={editTask.projectId}
              users={assigneesByProject[editTask.projectId] ?? []}
              task={editTask}
            />
          )}
        </>
      )}
    </>
  )
}
