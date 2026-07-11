import { TasksBoard } from "@/components/tasks-board"
import { listProjectOptions } from "@/lib/data/projects"
import { listTasks } from "@/lib/data/tasks"
import { listUsers } from "@/lib/data/users"

export default async function TasksPage() {
  const [tasks, projectOptions, users] = await Promise.all([
    listTasks(),
    listProjectOptions(),
    listUsers(),
  ])

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

  return <TasksBoard tasks={tasks} projects={projects} users={users} projectNames={projectNames} />
}
