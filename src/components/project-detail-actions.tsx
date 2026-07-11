"use client"

import { useState, useTransition } from "react"
import { Archive, Pencil, Plus } from "lucide-react"
import { ProjectTasksTable } from "@/components/project-tasks-table"
import { TaskFormDialog } from "@/components/task-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { setProjectStatusAction } from "@/lib/actions/projects"
import { cn } from "@/lib/utils"
import type { ProjectListItem, TaskListItem, UserOption } from "@/types/domain"

type ProjectDetailActionsProps = {
  project: ProjectListItem
  tasks: TaskListItem[]
  users: UserOption[]
}

export function ProjectDetailActions({ project, tasks, users }: ProjectDetailActionsProps) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const isActive = project.status === "ACTIVE"

  function toggleArchive() {
    startTransition(async () => {
      await setProjectStatusAction(project.id, isActive ? "ARCHIVED" : "ACTIVE")
    })
  }

  return (
    <>
      <Card className="mt-6 shadow-sm">
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.client}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Pencil className="size-4" />
                Edit Project
              </Button>
              <Button variant="destructive" onClick={toggleArchive} disabled={pending}>
                <Archive className="size-4" />
                {isActive ? "Archive Project" : "Restore Project"}
              </Button>
            </div>
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

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        <Button onClick={() => setTaskDialogOpen(true)}>
          <Plus className="size-4" />
          Add task
        </Button>
      </div>

      <div className="mt-4">
        <ProjectTasksTable tasks={tasks} projectId={project.id} />
      </div>

      <TaskFormDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        projectId={project.id}
        users={users}
      />
    </>
  )
}
