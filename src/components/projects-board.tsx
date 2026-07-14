"use client"

/**
 * Projects index page: tabbed filtering, grid of cards, and create dialog.
 *
 * Team Leads see New project; Members browse in read-only mode for mutations.
 */
import { useState } from "react"
import { motion, LayoutGroup, useReducedMotion } from "framer-motion"
import { Plus } from "lucide-react"
import { ProjectCard } from "@/components/project-card"
import { ProjectFormDialog } from "@/components/project-form-dialog"
import { ProjectsEmptyState } from "@/components/projects-empty-state"
import { Button } from "@/components/ui/button"
import { canCreateProject, type CurrentUser } from "@/lib/auth/permissions"
import { listContainer, listItem } from "@/components/motion-presets"
import { cn } from "@/lib/utils"
import type { ProjectListItem } from "@/types/domain"

type Tab = "all" | "active" | "archived"

type ProjectsBoardProps = {
  projects: ProjectListItem[]
  currentUser: CurrentUser
}

export function ProjectsBoard({ projects, currentUser }: ProjectsBoardProps) {
  const [tab, setTab] = useState<Tab>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const canCreate = canCreateProject(currentUser)

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

        {canCreate && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            New project
          </Button>
        )}
      </div>

      <LayoutGroup>
        <div className="mt-6 flex items-center gap-1 border-b border-border">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "relative border-b-2 px-3 pb-2.5 text-sm font-medium transition-colors",
                tab === id
                  ? "border-transparent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              {tab === id && !reduceMotion && (
                <motion.span
                  layoutId="projects-tab-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {tab === id && reduceMotion && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </LayoutGroup>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <ProjectsEmptyState onCreate={canCreate ? () => setDialogOpen(true) : undefined} />
        </div>
      ) : (
        <motion.div
          className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          variants={reduceMotion ? undefined : listContainer}
          initial="hidden"
          animate="show"
          key={tab}
        >
          {filtered.map((project) => (
            <motion.div key={project.id} variants={reduceMotion ? undefined : listItem}>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {canCreate && dialogOpen && (
        <ProjectFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      )}
    </>
  )
}
