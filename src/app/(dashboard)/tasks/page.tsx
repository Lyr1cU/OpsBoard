import { TasksBoard } from "@/components/tasks-board"
import { listProjects } from "@/lib/data/projects"
import { getProjectNameMap, listTasks } from "@/lib/data/tasks"
import { listUsers } from "@/lib/data/users"

export default async function TasksPage() {
  const [tasks, projects, users, projectNameMap] = await Promise.all([
    listTasks(),
    listProjects(),
    listUsers(),
    getProjectNameMap(),
  ])

  const projectNames = Object.fromEntries(projectNameMap)

  return <TasksBoard tasks={tasks} projects={projects} users={users} projectNames={projectNames} />
}
