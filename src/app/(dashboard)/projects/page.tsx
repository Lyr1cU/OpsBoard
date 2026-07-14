/**
 * Projects list page (/projects).
 */
import { listProjects } from "@/lib/data/projects"
import { ProjectsBoard } from "@/components/projects-board"
import { getCurrentDbUser } from "@/lib/auth/db-user"
import { getAccessibleProjectIds } from "@/lib/auth/permissions"
import { redirect } from "next/navigation"

export default async function ProjectsPage() {
  const currentUser = await getCurrentDbUser()
  if (!currentUser) redirect("/login")

  const accessibleIds = await getAccessibleProjectIds(currentUser.id)
  const projects = await listProjects(accessibleIds)
  return <ProjectsBoard projects={projects} currentUser={currentUser} />
}
