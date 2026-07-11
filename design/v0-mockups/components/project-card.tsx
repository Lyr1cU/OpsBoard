import { CheckSquare, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/mock-data"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

const avatarTones = [
  "bg-primary/10 text-primary",
  "bg-secondary text-secondary-foreground",
  "bg-accent text-accent-foreground",
  "bg-muted text-muted-foreground",
]

export function ProjectCard({ project }: { project: Project }) {
  const isActive = project.status === "ACTIVE"

  return (
    <Card className="group gap-0 py-0 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate text-base font-semibold text-card-foreground">{project.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{project.client}</p>
        </div>
        <button
          type="button"
          aria-label="Project options"
          className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </CardHeader>

      <CardContent className="px-5 pt-3">
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
      </CardContent>

      <CardFooter className="mt-4 flex items-center justify-between border-t border-border px-5 py-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CheckSquare className="size-4" />
          <span className="font-medium text-card-foreground">{project.taskCount}</span>
          <span>tasks</span>
          {isActive && project.openTasks > 0 && (
            <span className="text-muted-foreground">· {project.openTasks} open</span>
          )}
        </div>

        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((m, i) => (
            <div
              key={m}
              title={m}
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-card",
                avatarTones[i % avatarTones.length],
              )}
            >
              {initials(m)}
            </div>
          ))}
          {project.members.length > 3 && (
            <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground ring-2 ring-card">
              +{project.members.length - 3}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
