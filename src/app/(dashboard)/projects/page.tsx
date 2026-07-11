import { listProjects } from "@/lib/data/projects"
import { ProjectsBoard } from "@/components/projects-board"

export default async function ProjectsPage() {
  const projects = await listProjects()

  return <ProjectsBoard projects={projects} />
}
