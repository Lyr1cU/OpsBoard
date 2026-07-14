/**
 * Team page (/team).
 *
 * Directory of people on projects the viewer can access (no global role editor).
 */
import { TeamBoard } from "@/components/team-board"
import { getCurrentDbUser } from "@/lib/auth/db-user"
import { getAccessibleProjectIds } from "@/lib/auth/permissions"
import { listTeamDirectory } from "@/lib/data/memberships"
import { redirect } from "next/navigation"

export default async function TeamPage() {
  const currentUser = await getCurrentDbUser()
  if (!currentUser) {
    redirect("/login")
  }

  const accessibleIds = await getAccessibleProjectIds(currentUser.id)
  const members = await listTeamDirectory(accessibleIds)
  return <TeamBoard members={members} currentUser={currentUser} />
}
