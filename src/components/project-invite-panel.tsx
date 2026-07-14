"use client"

/**
 * Invite teammates to a project by email and manage the project roster.
 * Only project Leads can invite/remove; owners cannot be removed.
 */
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { UserMinus } from "lucide-react"
import { inviteToProjectAction, removeFromProjectAction } from "@/lib/actions/team"
import type { ProjectTeamMember } from "@/lib/data/memberships"
import type { ProjectMemberRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { selectClassName } from "@/components/task-display-utils"
import { cn } from "@/lib/utils"

type ProjectInvitePanelProps = {
  projectId: string
  team: ProjectTeamMember[]
  isProjectLead: boolean
}

export function ProjectInvitePanel({ projectId, team, isProjectLead }: ProjectInvitePanelProps) {
  const [pending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<ProjectMemberRole>("PROJECT_MEMBER")

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await inviteToProjectAction(projectId, email, role)
      if (result.error) toast.error(result.error)
      else if (result.success) {
        toast.success(result.success)
        setEmail("")
        setRole("PROJECT_MEMBER")
      }
    })
  }

  function handleRemove(member: ProjectTeamMember) {
    if (!window.confirm(`Remove ${member.name} from this project?`)) return
    startTransition(async () => {
      const result = await removeFromProjectAction(projectId, member.userId)
      if (result.error) toast.error(result.error)
      else if (result.success) toast.success(result.success)
    })
  }

  return (
    <Card className="mt-8 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Project team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isProjectLead && (
          <form
            onSubmit={handleInvite}
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
          >
            <label className="flex min-w-[200px] flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Invite by email</span>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={cn(selectClassName, "h-9")}
              />
            </label>
            <label className="flex w-full flex-col gap-1.5 sm:w-44">
              <span className="text-xs font-medium text-muted-foreground">Role</span>
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as ProjectMemberRole)}
                className={cn(selectClassName, "h-9")}
              >
                <option value="PROJECT_LEAD">Project Lead</option>
                <option value="PROJECT_MEMBER">Member</option>
              </select>
            </label>
            <Button type="submit" disabled={pending} className="h-9">
              {pending ? "Inviting…" : "Invite"}
            </Button>
          </form>
        )}

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                {isProjectLead && (
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.userId} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{member.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="rounded-full font-medium">
                      {member.projectRoleLabel}
                    </Badge>
                  </td>
                  {isProjectLead && (
                    <td className="px-4 py-3 text-right">
                      {!member.isOwner && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={pending}
                          onClick={() => handleRemove(member)}
                          aria-label={`Remove ${member.name}`}
                        >
                          <UserMinus className="size-4 text-destructive" />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
