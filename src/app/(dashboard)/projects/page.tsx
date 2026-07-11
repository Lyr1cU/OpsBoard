import { listProjects } from "@/lib/data/projects"
import { ProjectsBoard } from "@/components/projects-board"

export default async function ProjectsPage() {
  try {
    const projects = await listProjects()
    return <ProjectsBoard projects={projects} />
  } catch (error) {
    console.error("Failed to load projects:", error)
    throw error
  }
}
