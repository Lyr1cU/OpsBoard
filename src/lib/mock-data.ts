/**
 * Static mock data from early OpsBoard UI prototypes (v0 design explorations).
 *
 * NOT used by the production app under src/ — the live dashboard reads from
 * Prisma via src/lib/data/*. This file remains for design/v0-mockups/ reference
 * pages that still import these fixtures. Safe to delete once mockups are retired.
 */

export type ProjectStatus = "ACTIVE" | "ARCHIVED"
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH"

/** Legacy project card shape — string dates and precomputed counts for static demos. */
export type Project = {
  id: string
  name: string
  client: string
  description: string
  status: ProjectStatus
  createdAt: string
  taskCount: number
  openTasks: number
  members: string[]
  updated: string
}

/** Legacy task row — overdue flag baked in for demo highlighting. */
export type Task = {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  dueDate: string
  overdue?: boolean
}

export const projects: Project[] = [
  {
    id: "p1",
    name: "Northwind Rebrand",
    client: "Northwind Trading Co.",
    description:
      "Full digital brand refresh, including new visual identity system, corporate website redesign, and motion guidelines. Target audience: global wholesale B2B partners.",
    status: "ACTIVE",
    createdAt: "October 14, 2023",
    taskCount: 34,
    openTasks: 12,
    members: ["Maya Chen", "Devin Park", "Aisha Rahman"],
    updated: "2h ago",
  },
  {
    id: "p2",
    name: "Aperture Mobile App",
    client: "Aperture Labs",
    description:
      "Native iOS and Android app for lab equipment monitoring, push alerts, and offline-first data sync for field technicians.",
    status: "ACTIVE",
    createdAt: "January 8, 2024",
    taskCount: 58,
    openTasks: 21,
    members: ["Leo Martins", "Sofia Alvarez", "Tom Becker", "Priya Nair"],
    updated: "5h ago",
  },
  {
    id: "p3",
    name: "Helio E-commerce Platform",
    client: "Helio Retail Group",
    description:
      "Headless storefront rebuild with multi-currency checkout, inventory sync, and personalized product recommendations.",
    status: "ACTIVE",
    createdAt: "March 22, 2024",
    taskCount: 91,
    openTasks: 7,
    members: ["Grace Liu", "Marcus Webb"],
    updated: "yesterday",
  },
  {
    id: "p4",
    name: "Kestrel Marketing Site",
    client: "Kestrel Ventures",
    description:
      "Marketing website and CMS for a venture studio portfolio, including case studies, team pages, and lead capture flows.",
    status: "ACTIVE",
    createdAt: "June 3, 2024",
    taskCount: 26,
    openTasks: 4,
    members: ["Nadia Osei", "Ryan Cole", "Emma Ford"],
    updated: "3d ago",
  },
  {
    id: "p5",
    name: "Vireo Analytics Dashboard",
    client: "Vireo Health",
    description:
      "Healthcare analytics dashboard with role-based views, HIPAA-compliant audit logs, and export to PDF reports.",
    status: "ARCHIVED",
    createdAt: "August 17, 2023",
    taskCount: 47,
    openTasks: 0,
    members: ["Jonas Weber", "Lena Fischer"],
    updated: "3 weeks ago",
  },
  {
    id: "p6",
    name: "Tidewater Booking System",
    client: "Tidewater Resorts",
    description:
      "Resort booking engine with seasonal pricing, channel manager integration, and guest self-service portal.",
    status: "ARCHIVED",
    createdAt: "November 5, 2022",
    taskCount: 63,
    openTasks: 0,
    members: ["Oscar Reyes", "Hana Kim", "Will Turner"],
    updated: "2 months ago",
  },
]

export const tasks: Task[] = [
  {
    id: "t1",
    projectId: "p1",
    title: "Finalize brand book layout",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignee: "Jordan Diaz",
    dueDate: "Jan 28, 2024",
  },
  {
    id: "t2",
    projectId: "p1",
    title: "Approve logo concepts",
    status: "DONE",
    priority: "HIGH",
    assignee: "Sarah Park",
    dueDate: "Jan 20, 2024",
  },
  {
    id: "t3",
    projectId: "p1",
    title: "Dev handoff for Homepage",
    status: "TODO",
    priority: "MEDIUM",
    assignee: "Alex Chen",
    dueDate: "Feb 5, 2024",
  },
  {
    id: "t4",
    projectId: "p1",
    title: "Conduct stakeholder interviews",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignee: "Jordan Diaz",
    dueDate: "Feb 10, 2024",
  },
  {
    id: "t5",
    projectId: "p1",
    title: "Setup project management tool",
    status: "DONE",
    priority: "HIGH",
    assignee: "Sarah Park",
    dueDate: "Jan 20, 2024",
  },
  {
    id: "t6",
    projectId: "p1",
    title: "Wireframe About Us page",
    status: "TODO",
    priority: "MEDIUM",
    assignee: "Alex Chen",
    dueDate: "Feb 5, 2024",
  },
  {
    id: "t7",
    projectId: "p2",
    title: "User testing session recap",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: "Sofia Alvarez",
    dueDate: "Mar 12, 2024",
  },
  {
    id: "t8",
    projectId: "p2",
    title: "Sprint planning & estimates",
    status: "TODO",
    priority: "MEDIUM",
    assignee: "Leo Martins",
    dueDate: "Mar 15, 2024",
  },
  {
    id: "t9",
    projectId: "p3",
    title: "QA payment checkout flow",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: "Marcus Webb",
    dueDate: "Apr 2, 2024",
  },
  {
    id: "t10",
    projectId: "p4",
    title: "Finalize homepage hero copy",
    status: "TODO",
    priority: "MEDIUM",
    assignee: "Nadia Osei",
    dueDate: "May 8, 2024",
  },
  {
    id: "t11",
    projectId: "p2",
    title: "Create final wireframes for onboarding",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: "Sarah Park",
    dueDate: "Feb 11, 2024",
  },
  {
    id: "t12",
    projectId: "p1",
    title: "Finalize content strategy for blog posts",
    status: "DONE",
    priority: "MEDIUM",
    assignee: "Jordan Diaz",
    dueDate: "Feb 10, 2024",
  },
  {
    id: "t13",
    projectId: "p3",
    title: "Update inventory sync for holiday sale",
    status: "TODO",
    priority: "MEDIUM",
    assignee: "Maya Chen",
    dueDate: "Feb 5, 2024",
  },
  {
    id: "t14",
    projectId: "p2",
    title: "Implement user authentication flow",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: "Alex Chen",
    dueDate: "Feb 10, 2024",
  },
  {
    id: "t15",
    projectId: "p3",
    title: "Overdue Task: Resolve checkout bugs for mobile",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: "Sarah Park",
    dueDate: "Jan 3, 2024",
    overdue: true,
  },
  {
    id: "t16",
    projectId: "p4",
    title: "Develop new landing page hero section",
    status: "TODO",
    priority: "LOW",
    assignee: "Jordan Diaz",
    dueDate: "Feb 10, 2024",
  },
  {
    id: "t17",
    projectId: "p1",
    title: "Design email templates for newsletter",
    status: "DONE",
    priority: "MEDIUM",
    assignee: "Maya Chen",
    dueDate: "Feb 6, 2024",
  },
  {
    id: "t18",
    projectId: "p2",
    title: "Overdue Task: Collect client feedback on prototype",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignee: "Alex Chen",
    dueDate: "Dec 29, 2023",
    overdue: true,
  },
  {
    id: "t19",
    projectId: "p4",
    title: "Prepare Q1 marketing report",
    status: "DONE",
    priority: "LOW",
    assignee: "Sarah Park",
    dueDate: "Feb 8, 2024",
  },
]

/** Lookup helper for mock project detail pages. */
export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

/** Filter tasks belonging to one mock project. */
export function getTasksByProjectId(projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId)
}

// Subset of task IDs used by the original "all tasks" board mockup.
const allTasksBoardIds = ["t11", "t12", "t13", "t14", "t15", "t16", "t17", "t18", "t19"] as const

/** Return the fixed slice of tasks shown on the v0 tasks board demo. */
export function getAllTasksForBoard(): Task[] {
  return allTasksBoardIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => t !== undefined)
}

/** Resolve project display name from mock id — "Unknown project" when missing. */
export function getProjectNameById(projectId: string): string {
  return projects.find((p) => p.id === projectId)?.name ?? "Unknown project"
}

export type WeeklyReport = {
  id: string
  weekRange: string
  createdAt: string
  author: string
  preview: string
  bullets: string[]
}

export const weeklyReports: WeeklyReport[] = [
  {
    id: "r1",
    weekRange: "Dec 11, 2023 – Dec 17, 2023",
    createdAt: "Dec 18, 2023",
    author: "Sarah Park",
    preview: "Key highlights from last week's sprint and client meetings.",
    bullets: [
      "Completed homepage prototype development for Northwind Rebrand.",
      "Conducted UX testing of the Aperture Mobile App with key users.",
      "Agreed on technical requirements for payment integration on the Helio Platform.",
      "Created an initial concept board for the Kestrel Marketing Site.",
    ],
  },
  {
    id: "r2",
    weekRange: "Dec 4, 2023 – Dec 10, 2023",
    createdAt: "Dec 11, 2023",
    author: "Alex Chen",
    preview: "Progress update on Northwind Rebrand wireframes.",
    bullets: [
      "Delivered wireframes for the Northwind Rebrand homepage and product pages.",
      "Incorporated client feedback on typography and color palette options.",
      "Scheduled a follow-up review for the mobile navigation patterns.",
      "Synced with the dev team on component handoff timelines.",
    ],
  },
  {
    id: "r3",
    weekRange: "Nov 27, 2023 – Dec 3, 2023",
    createdAt: "Dec 4, 2023",
    author: "Jordan Diaz",
    preview: "Initial setup for Helio E-commerce Platform project.",
    bullets: [
      "Kicked off the Helio E-commerce Platform with stakeholders.",
      "Defined MVP scope for catalog, cart, and checkout flows.",
      "Set up the shared project workspace and sprint cadence.",
      "Assigned initial discovery tasks across design and engineering.",
    ],
  },
]

export function getWeeklyReports(): WeeklyReport[] {
  return weeklyReports
}

export type Stat = {
  label: string
  value: string
  delta: string
  trend: "up" | "down"
  hint: string
}

/** Dashboard KPI cards — static numbers for design previews only. */
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

/** Chart segments for the tasks-by-status donut in v0 mockups. */
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

/** Upcoming deadlines widget fixtures — relative strings ("Yesterday", "In 3 days"). */
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
