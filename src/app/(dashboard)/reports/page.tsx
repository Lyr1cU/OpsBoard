/**
 * Reports page (/reports).
 */
import { ReportsBoard } from "@/components/reports-board"
import { listReports } from "@/lib/data/reports"
import { listProjectOptions } from "@/lib/data/projects"
import { getCurrentDbUser } from "@/lib/auth/db-user"
import { getAccessibleProjectIds, getLeadProjectIds } from "@/lib/auth/permissions"
import { redirect } from "next/navigation"

export default async function ReportsPage() {
  const currentUser = await getCurrentDbUser()
  if (!currentUser) redirect("/login")

  const [accessibleIds, leadProjectIds] = await Promise.all([
    getAccessibleProjectIds(currentUser.id),
    getLeadProjectIds(currentUser.id),
  ])

  const [reports, projectOptions] = await Promise.all([
    listReports(accessibleIds),
    listProjectOptions(accessibleIds),
  ])

  const leadProjects = projectOptions
    .filter((p) => leadProjectIds.includes(p.id) && p.status === "ACTIVE")
    .map((p) => ({ id: p.id, name: p.name }))

  return (
    <ReportsBoard
      reports={reports}
      currentUser={currentUser}
      leadProjects={leadProjects}
    />
  )
}
