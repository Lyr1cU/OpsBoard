"use client"

/**
 * Responsive task list for a single project detail page.
 *
 * Project Leads get edit/delete; Members get status select only when assigned.
 */
import { useTransition } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TaskStatusSelect } from "@/components/task-status-select"
import { TaskMobileList } from "@/components/task-mobile-list"
import { deleteTaskAction } from "@/lib/actions/tasks"
import { canUpdateTaskStatus, type CurrentUser, type ProjectAccess } from "@/lib/auth/permissions"
import { listContainer, listItem } from "@/components/motion-presets"
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
  currentUser: CurrentUser
  isProjectLead: boolean
  onEditTask: (task: TaskListItem) => void
}

function accessFromLead(isProjectLead: boolean): ProjectAccess {
  return {
    canView: true,
    isProjectLead,
    isProjectMember: true,
    projectRole: isProjectLead ? "PROJECT_LEAD" : "PROJECT_MEMBER",
  }
}

export function ProjectTasksTable({
  tasks,
  projectId,
  currentUser,
  isProjectLead,
  onEditTask,
}: ProjectTasksTableProps) {
  const [pending, startTransition] = useTransition()
  const reduceMotion = useReducedMotion()
  const canEdit = isProjectLead
  const access = accessFromLead(isProjectLead)

  function handleDelete(task: TaskListItem) {
    if (!window.confirm(`Delete task “${task.title}”?`)) return
    startTransition(async () => {
      const result = await deleteTaskAction(task.id, projectId)
      if (result.error) toast.error(result.error)
      else if (result.success) toast.success(result.success)
    })
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
        No tasks yet. {canEdit ? "Add the first task to this project." : "Ask a project lead to add tasks."}
      </div>
    )
  }

  return (
    <>
      <TaskMobileList
        tasks={tasks}
        projectId={projectId}
        showProject={false}
        currentUser={currentUser}
        isProjectLead={isProjectLead}
        canEditTasks={canEdit}
        onEditTask={onEditTask}
        onDeleteTask={handleDelete}
      />

      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <motion.table
          className="w-full min-w-[720px] text-sm"
          variants={reduceMotion ? undefined : listContainer}
          initial="hidden"
          animate="show"
        >
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assignee</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due Date</th>
              {canEdit && (
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const statusDisabled = !canUpdateTaskStatus(access, currentUser, task)
              return (
                <motion.tr
                  key={task.id}
                  variants={reduceMotion ? undefined : listItem}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-muted/20",
                    task.overdue && "bg-destructive/5",
                  )}
                >
                  <td className="px-4 py-3.5 font-medium text-foreground">{task.title}</td>
                  <td className="px-4 py-3.5">
                    <TaskStatusSelect
                      taskId={task.id}
                      status={task.status}
                      projectId={projectId}
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
                  {canEdit && (
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEditTask(task)}
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
                    </td>
                  )}
                </motion.tr>
              )
            })}
          </tbody>
        </motion.table>
      </div>
    </>
  )
}
