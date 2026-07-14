"use client"

/**
 * Project detail page header, metadata, and embedded task list.
 *
 * Project Leads can edit/archive/delete the project and CRUD tasks.
 * Members can view and change status only on tasks assigned to them.
 */
import { useState, useTransition } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Archive, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ProjectTasksTable } from "@/components/project-tasks-table"
import { TaskFormDialog } from "@/components/task-form-dialog"
import { ProjectFormDialog } from "@/components/project-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { deleteProjectAction, setProjectStatusAction } from "@/lib/actions/projects"
import type { CurrentUser } from "@/lib/auth/permissions"
import { fadeUp } from "@/components/motion-presets"
import { cn } from "@/lib/utils"
import type { ProjectListItem, TaskListItem, UserOption } from "@/types/domain"

type ProjectDetailActionsProps = {
  project: ProjectListItem
  tasks: TaskListItem[]
  users: UserOption[]
  currentUser: CurrentUser
  isProjectLead: boolean
}

export function ProjectDetailActions({
  project,
  tasks,
  users,
  currentUser,
  isProjectLead,
}: ProjectDetailActionsProps) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editTask, setEditTask] = useState<TaskListItem | null>(null)
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const reduceMotion = useReducedMotion()
  const isActive = project.status === "ACTIVE"
  const canEditProject = isProjectLead
  const canEditTasks = isProjectLead

  function toggleArchive() {
    startTransition(async () => {
      const result = await setProjectStatusAction(project.id, isActive ? "ARCHIVED" : "ACTIVE")
      if (result.error) toast.error(result.error)
      else if (result.success) toast.success(result.success)
    })
  }

  function handleDelete() {
    if (!window.confirm(`Permanently delete “${project.name}” and all its tasks?`)) return
    startTransition(async () => {
      const result = await deleteProjectAction(project.id)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <>
      <motion.div
        initial={reduceMotion ? false : fadeUp.hidden}
        animate={fadeUp.show}
        transition={{ duration: 0.2 }}
      >
        <Card className="mt-6 shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{project.name}</h1>
                <p className="text-sm text-muted-foreground">{project.client}</p>
              </div>
              {canEditProject && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setEditProjectOpen(true)}>
                    <Pencil className="size-4" />
                    Edit Project
                  </Button>
                  <Button variant="outline" onClick={toggleArchive} disabled={pending}>
                    <Archive className="size-4" />
                    {isActive ? "Archive Project" : "Restore Project"}
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={pending}>
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {project.description || "No description yet."}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  isActive
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                <span className={cn("size-1.5 rounded-full", isActive ? "bg-primary" : "bg-muted-foreground")} />
                {project.status}
              </Badge>
              <span className="text-sm text-muted-foreground">Created: {project.createdAt}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        {canEditTasks && (
          <Button
            onClick={() => {
              setEditTask(null)
              setTaskDialogOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add task
          </Button>
        )}
      </div>

      <div className="mt-4">
        <ProjectTasksTable
          tasks={tasks}
          projectId={project.id}
          currentUser={currentUser}
          isProjectLead={isProjectLead}
          onEditTask={(task) => {
            setEditTask(task)
            setTaskDialogOpen(true)
          }}
        />
      </div>

      {canEditTasks && taskDialogOpen && (
        <TaskFormDialog
          key={editTask?.id ?? "new-task"}
          open={taskDialogOpen}
          onClose={() => {
            setTaskDialogOpen(false)
            setEditTask(null)
          }}
          projectId={project.id}
          users={users}
          task={editTask}
        />
      )}

      {canEditProject && editProjectOpen && (
        <ProjectFormDialog
          key={`edit-${project.id}`}
          open={editProjectOpen}
          onClose={() => setEditProjectOpen(false)}
          project={project}
        />
      )}
    </>
  )
}
