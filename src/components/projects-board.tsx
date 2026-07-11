"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { ProjectCard } from "@/components/project-card"
import { ProjectFormDialog } from "@/components/project-form-dialog"
import { ProjectsEmptyState } from "@/components/projects-empty-state"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ProjectListItem } from "@/types/domain"

type Tab = "all" | "active" | "archived"

type ProjectsBoardProps = {
  projects: ProjectListItem[]
}

export function ProjectsBoard({ projects }: ProjectsBoardProps) {
  const [tab, setTab] = useState<Tab>("all")
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = projects.filter((project) => {
    if (tab === "active") return project.status === "ACTIVE"
    if (tab === "archived") return project.status === "ARCHIVED"
    return true
  })

  const activeCount = projects.filter((p) => p.status === "ACTIVE").length
  const archivedCount = projects.filter((p) => p.status === "ARCHIVED").length

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "archived", label: "Archived" },
  ]

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="text-sm text-muted-foreground">
            <span>Workspace</span>
            <span className="px-1.5">/</span>
            <span className="font-medium text-foreground">Projects</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} active · {archivedCount} archived
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-1 border-b border-border">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "border-b-2 px-3 pb-2.5 text-sm font-medium transition-colors",
              tab === id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <ProjectsEmptyState onCreate={() => setDialogOpen(true)} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  )
}
