"use client"

/**
 * Team directory: people on projects you can access, with staggered row entrance.
 */
import { motion, useReducedMotion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fadeUp, listContainer, listItem } from "@/components/motion-presets"
import type { TeamDirectoryRow } from "@/lib/data/memberships"
import type { CurrentUser } from "@/lib/auth/permissions"

type TeamBoardProps = {
  members: TeamDirectoryRow[]
  currentUser: CurrentUser
}

export function TeamBoard({ members, currentUser }: TeamBoardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <>
      <div className="space-y-1">
        <nav className="text-sm text-muted-foreground">
          <span>Workspace</span>
          <span className="px-1.5">/</span>
          <span className="font-medium text-foreground">Team</span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground">
          People on projects you can access. Invite teammates from a project detail page.
        </p>
      </div>

      <motion.div
        className="mt-6"
        initial={reduceMotion ? false : fadeUp.hidden}
        animate={fadeUp.show}
        transition={{ duration: 0.22 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{members.length} people</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Account</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Projects</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={reduceMotion ? undefined : listContainer}
                  initial="hidden"
                  animate="show"
                >
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                        No teammates yet. Create or join a project to see people here.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <motion.tr
                        key={member.userId}
                        variants={reduceMotion ? undefined : listItem}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3.5 font-medium text-foreground">
                          {member.name}
                          {member.userId === currentUser.id && (
                            <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{member.email}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant="outline" className="rounded-full font-medium">
                            {member.accountRoleLabel}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {member.projects.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <ul className="flex flex-col gap-1">
                              {member.projects.map((p) => (
                                <li key={p.projectId} className="text-muted-foreground">
                                  <span className="text-foreground">{p.projectName}</span>
                                  <span className="mx-1.5 text-border">·</span>
                                  {p.roleLabel}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </motion.tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}
