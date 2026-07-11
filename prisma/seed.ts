import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const teamMembers = [
  { email: "maya.chen@studio.co", name: "Maya Chen" },
  { email: "devin.park@studio.co", name: "Devin Park" },
  { email: "aisha.rahman@studio.co", name: "Aisha Rahman" },
  { email: "leo.martins@studio.co", name: "Leo Martins" },
  { email: "sofia.alvarez@studio.co", name: "Sofia Alvarez" },
  { email: "sarah.park@studio.co", name: "Sarah Park" },
  { email: "alex.chen@studio.co", name: "Alex Chen" },
  { email: "jordan.diaz@studio.co", name: "Jordan Diaz" },
  { email: "marcus.webb@studio.co", name: "Marcus Webb" },
  { email: "nadia.osei@studio.co", name: "Nadia Osei" },
]

const projects = [
  {
    key: "northwind",
    name: "Northwind Rebrand",
    clientName: "Northwind Trading Co.",
    description:
      "Full digital brand refresh, including new visual identity system, corporate website redesign, and motion guidelines.",
    status: "ACTIVE" as const,
    createdAt: new Date("2023-10-14"),
  },
  {
    key: "aperture",
    name: "Aperture Mobile App",
    clientName: "Aperture Labs",
    description: "Native iOS and Android app for lab equipment monitoring and offline-first data sync.",
    status: "ACTIVE" as const,
    createdAt: new Date("2024-01-08"),
  },
  {
    key: "helio",
    name: "Helio E-commerce Platform",
    clientName: "Helio Retail Group",
    description: "Headless storefront rebuild with multi-currency checkout and inventory sync.",
    status: "ACTIVE" as const,
    createdAt: new Date("2024-03-22"),
  },
  {
    key: "kestrel",
    name: "Kestrel Marketing Site",
    clientName: "Kestrel Ventures",
    description: "Marketing website and CMS for a venture studio portfolio.",
    status: "ACTIVE" as const,
    createdAt: new Date("2024-06-03"),
  },
  {
    key: "vireo",
    name: "Vireo Analytics Dashboard",
    clientName: "Vireo Health",
    description: "Healthcare analytics dashboard with role-based views and audit logs.",
    status: "ARCHIVED" as const,
    createdAt: new Date("2023-08-17"),
  },
]

const tasks = [
  {
    projectKey: "northwind",
    title: "Finalize brand book layout",
    status: "IN_PROGRESS" as const,
    priority: "MEDIUM" as const,
    assignee: "Jordan Diaz",
    dueDate: new Date("2024-01-28"),
  },
  {
    projectKey: "northwind",
    title: "Approve logo concepts",
    status: "DONE" as const,
    priority: "HIGH" as const,
    assignee: "Sarah Park",
    dueDate: new Date("2024-01-20"),
  },
  {
    projectKey: "northwind",
    title: "Dev handoff for Homepage",
    status: "TODO" as const,
    priority: "MEDIUM" as const,
    assignee: "Alex Chen",
    dueDate: new Date("2024-02-05"),
  },
  {
    projectKey: "aperture",
    title: "User testing session recap",
    status: "IN_PROGRESS" as const,
    priority: "HIGH" as const,
    assignee: "Sofia Alvarez",
    dueDate: new Date("2024-03-12"),
  },
  {
    projectKey: "aperture",
    title: "Implement user authentication flow",
    status: "IN_PROGRESS" as const,
    priority: "HIGH" as const,
    assignee: "Alex Chen",
    dueDate: new Date("2024-02-10"),
  },
  {
    projectKey: "helio",
    title: "QA payment checkout flow",
    status: "IN_PROGRESS" as const,
    priority: "HIGH" as const,
    assignee: "Marcus Webb",
    dueDate: new Date("2024-04-02"),
  },
  {
    projectKey: "helio",
    title: "Overdue Task: Resolve checkout bugs for mobile",
    status: "IN_PROGRESS" as const,
    priority: "HIGH" as const,
    assignee: "Sarah Park",
    dueDate: new Date("2024-01-03"),
  },
  {
    projectKey: "kestrel",
    title: "Finalize homepage hero copy",
    status: "TODO" as const,
    priority: "MEDIUM" as const,
    assignee: "Nadia Osei",
    dueDate: new Date("2024-05-08"),
  },
  {
    projectKey: "aperture",
    title: "Overdue Task: Collect client feedback on prototype",
    status: "IN_PROGRESS" as const,
    priority: "MEDIUM" as const,
    assignee: "Alex Chen",
    dueDate: new Date("2023-12-29"),
  },
]

async function main() {
  console.log("Seeding database…")

  for (const member of teamMembers) {
    await prisma.user.upsert({
      where: { email: member.email },
      create: { email: member.email, name: member.name, role: "MEMBER" },
      update: { name: member.name },
    })
  }

  const usersByName = new Map(
    (await prisma.user.findMany()).map((user) => [user.name, user.id]),
  )

  const projectIds = new Map<string, string>()

  for (const project of projects) {
    const { key, ...projectData } = project
    const existing = await prisma.project.findFirst({ where: { name: project.name } })
    const record = existing
      ? await prisma.project.update({
          where: { id: existing.id },
          data: projectData,
        })
      : await prisma.project.create({ data: projectData })

    projectIds.set(key, record.id)
  }

  for (const task of tasks) {
    const projectId = projectIds.get(task.projectKey)
    if (!projectId) continue

    const existing = await prisma.task.findFirst({
      where: { projectId, title: task.title },
    })

    const data = {
      projectId,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assigneeId: usersByName.get(task.assignee) ?? null,
    }

    if (existing) {
      await prisma.task.update({ where: { id: existing.id }, data })
    } else {
      await prisma.task.create({ data })
    }
  }

  console.log("Seed complete.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
