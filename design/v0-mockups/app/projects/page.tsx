import { Plus } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { projects } from "@/lib/mock-data"

export default function ProjectsPage() {
  const activeCount = projects.filter((p) => p.status === "ACTIVE").length
  const archivedCount = projects.filter((p) => p.status === "ARCHIVED").length

  return (
    <AppShell>
      {/* Page heading */}
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

        <Button>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      {/* Filter tabs (visual only) */}
      <div className="mt-6 flex items-center gap-1 border-b border-border">
        {["All", "Active", "Archived"].map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={
              i === 0
                ? "border-b-2 border-primary px-3 pb-2.5 text-sm font-medium text-foreground"
                : "border-b-2 border-transparent px-3 pb-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Projects grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </AppShell>
  )
}
