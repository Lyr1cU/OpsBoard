import Link from "next/link"
import { notFound } from "next/navigation"
import { ProjectDetailActions } from "@/components/project-detail-actions"
import { getProjectById } from "@/lib/data/projects"
import { getTasksByProjectId } from "@/lib/data/tasks"
import { listUsers } from "@/lib/data/users"

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params
  const [project, tasks, users] = await Promise.all([
    getProjectById(id),
    getTasksByProjectId(id),
    listUsers(),
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

      <ProjectDetailActions project={project} tasks={tasks} users={users} />
    </>
  )
}
