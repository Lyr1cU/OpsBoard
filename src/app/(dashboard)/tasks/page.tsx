/**
 * All-tasks page (/tasks).
 */
import { TasksBoard } from "@/components/tasks-board"
import { listProjectOptions } from "@/lib/data/projects"
import { listTasks } from "@/lib/data/tasks"
import { listProjectAssigneeOptions } from "@/lib/data/memberships"
import { getCurrentDbUser } from "@/lib/auth/db-user"
import { getAccessibleProjectIds, getLeadProjectIds } from "@/lib/auth/permissions"
import { redirect } from "next/navigation"
import type { UserOption } from "@/types/domain"

export default async function TasksPage() {
  const currentUser = await getCurrentDbUser()
  if (!currentUser) redirect("/login")

  const [accessibleIds, leadProjectIds] = await Promise.all([
    getAccessibleProjectIds(currentUser.id),
    getLeadProjectIds(currentUser.id),
  ])

  const [tasks, projectOptions] = await Promise.all([
    listTasks({ accessibleProjectIds: accessibleIds }),
    listProjectOptions(accessibleIds),
  ])

  const assigneeEntries = await Promise.all(
    accessibleIds.map(async (projectId) => {
      const options = await listProjectAssigneeOptions(projectId)
      return [projectId, options] as const
    }),
  )
  const assigneesByProject: Record<string, UserOption[]> = Object.fromEntries(assigneeEntries)

  const projectNames = Object.fromEntries(projectOptions.map((p) => [p.id, p.name]))

  const projects = projectOptions.map((p) => ({
    id: p.id,
    name: p.name,
    client: "",
    description: "",
    status: p.status,
    createdAt: "",
    taskCount: 0,
    openTasks: 0,
    members: [] as string[],
  }))

  return (
    <TasksBoard
      tasks={tasks}
      projects={projects}
      assigneesByProject={assigneesByProject}
      projectNames={projectNames}
      currentUser={currentUser}
      leadProjectIds={leadProjectIds}
    />
  )
}
