/**
 * Empty-state placeholder when the workspace has no projects.
 *
 * Shown on the projects index when filtering yields zero results or the
 * database is empty. The optional `onCreate` callback opens the new-project
 * dialog without requiring navigation.
 */
import { FolderPlus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type ProjectsEmptyStateProps = {
  onCreate?: () => void
}

export function ProjectsEmptyState({ onCreate }: ProjectsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <FolderPlus className="size-7" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-card-foreground">No projects yet</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {onCreate
          ? "Create your first project to start tracking tasks, assignees, and client work in one place."
          : "No projects match this filter. Ask a Team Lead to create one."}
      </p>
      {onCreate && (
        <Button className="mt-6" onClick={onCreate}>
          <Plus className="size-4" />
          New project
        </Button>
      )}
    </div>
  )
}
