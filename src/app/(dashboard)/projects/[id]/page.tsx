/**
 * Single project detail page (/projects/[id]).
 */
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ProjectDetailActions } from "@/components/project-detail-actions"
import { ProjectInvitePanel } from "@/components/project-invite-panel"
import { getProjectById } from "@/lib/data/projects"
import { getTasksByProjectId } from "@/lib/data/tasks"
import { listProjectTeam, listProjectAssigneeOptions } from "@/lib/data/memberships"
import { getCurrentDbUser } from "@/lib/auth/db-user"
import { getProjectAccess } from "@/lib/auth/permissions"

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const currentUser = await getCurrentDbUser()
  if (!currentUser) redirect("/login")

  const { id } = await params
  const access = await getProjectAccess(currentUser.id, id)
  if (!access.canView) {
    notFound()
  }

  const [project, tasks, assignees, team] = await Promise.all([
    getProjectById(id),
    getTasksByProjectId(id),
    listProjectAssigneeOptions(id),
    listProjectTeam(id),
  ])

  if (!project) {
    notFound()
  }

  return (
    <>
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Workspace
        </Link>
        <span className="px-1.5">/</span>
        <Link href="/projects" className="hover:text-foreground">
          Projects
        </Link>
        <span className="px-1.5">/</span>
        <span className="font-medium text-foreground">{project.name}</span>
      </nav>

      <ProjectDetailActions
        project={project}
        tasks={tasks}
        users={assignees}
        currentUser={currentUser}
        isProjectLead={access.isProjectLead}
      />

      <ProjectInvitePanel
        projectId={project.id}
        team={team}
        isProjectLead={access.isProjectLead}
      />
    </>
  )
}
