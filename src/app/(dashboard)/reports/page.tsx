import { ReportsBoard } from "@/components/reports-board"
import { listReports } from "@/lib/data/reports"

export default async function ReportsPage() {
  const reports = await listReports()

  return <ReportsBoard reports={reports} />
}
