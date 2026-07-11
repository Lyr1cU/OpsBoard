export type ProjectStatus = "ACTIVE" | "ARCHIVED"

export type Project = {
  id: string
  name: string
  client: string
  status: ProjectStatus
  taskCount: number
  openTasks: number
  members: string[]
  updated: string
}

export const projects: Project[] = [
  {
    id: "p1",
    name: "Northwind Rebrand",
    client: "Northwind Trading Co.",
    status: "ACTIVE",
    taskCount: 34,
    openTasks: 12,
    members: ["Maya Chen", "Devin Park", "Aisha Rahman"],
    updated: "2h ago",
  },
  {
    id: "p2",
    name: "Aperture Mobile App",
    client: "Aperture Labs",
    status: "ACTIVE",
    taskCount: 58,
    openTasks: 21,
    members: ["Leo Martins", "Sofia Alvarez", "Tom Becker", "Priya Nair"],
    updated: "5h ago",
  },
  {
    id: "p3",
    name: "Helio E-commerce Platform",
    client: "Helio Retail Group",
    status: "ACTIVE",
    taskCount: 91,
    openTasks: 7,
    members: ["Grace Liu", "Marcus Webb"],
    updated: "yesterday",
  },
  {
    id: "p4",
    name: "Kestrel Marketing Site",
    client: "Kestrel Ventures",
    status: "ACTIVE",
    taskCount: 26,
    openTasks: 4,
    members: ["Nadia Osei", "Ryan Cole", "Emma Ford"],
    updated: "3d ago",
  },
  {
    id: "p5",
    name: "Vireo Analytics Dashboard",
    client: "Vireo Health",
    status: "ARCHIVED",
    taskCount: 47,
    openTasks: 0,
    members: ["Jonas Weber", "Lena Fischer"],
    updated: "3 weeks ago",
  },
  {
    id: "p6",
    name: "Tidewater Booking System",
    client: "Tidewater Resorts",
    status: "ARCHIVED",
    taskCount: 63,
    openTasks: 0,
    members: ["Oscar Reyes", "Hana Kim", "Will Turner"],
    updated: "2 months ago",
  },
]

export type Stat = {
  label: string
  value: string
  delta: string
  trend: "up" | "down"
  hint: string
}

export const stats: Stat[] = [
  { label: "Active Projects", value: "4", delta: "+1", trend: "up", hint: "vs. last month" },
  { label: "Open Tasks", value: "44", delta: "+8", trend: "up", hint: "across all projects" },
  { label: "Overdue", value: "2", delta: "+2", trend: "down", hint: "needs attention" },
  { label: "Billable Hours", value: "312", delta: "+24", trend: "up", hint: "this month" },
]

export type TaskStatusSlice = {
  status: string
  count: number
  fill: string
}

export const tasksByStatus: TaskStatusSlice[] = [
  { status: "Completed", count: 128, fill: "var(--chart-1)" },
  { status: "In Progress", count: 44, fill: "var(--chart-2)" },
  { status: "In Review", count: 19, fill: "var(--chart-3)" },
  { status: "Blocked", count: 9, fill: "var(--chart-4)" },
]

export type Deadline = {
  id: string
  task: string
  project: string
  assignee: string
  due: string
  overdue: boolean
}

export const deadlines: Deadline[] = [
  {
    id: "d1",
    task: "Finalize homepage hero copy",
    project: "Kestrel Marketing Site",
    assignee: "Nadia Osei",
    due: "2 days ago",
    overdue: true,
  },
  {
    id: "d2",
    task: "QA payment checkout flow",
    project: "Helio E-commerce Platform",
    assignee: "Marcus Webb",
    due: "Yesterday",
    overdue: true,
  },
  {
    id: "d3",
    task: "Deliver brand guidelines v2",
    project: "Northwind Rebrand",
    assignee: "Maya Chen",
    due: "Today, 5:00 PM",
    overdue: false,
  },
  {
    id: "d4",
    task: "User testing session recap",
    project: "Aperture Mobile App",
    assignee: "Sofia Alvarez",
    due: "Tomorrow",
    overdue: false,
  },
  {
    id: "d5",
    task: "Sprint planning & estimates",
    project: "Aperture Mobile App",
    assignee: "Leo Martins",
    due: "In 3 days",
    overdue: false,
  },
]
