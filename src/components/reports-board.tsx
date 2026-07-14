"use client"

/**
 * Reports page: browse generated weekly summaries and trigger new ones.
 *
 * Generation requires selecting a project where the user is Project Lead.
 */
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"
import { generateWeeklyReportAction } from "@/lib/actions/reports"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { taskInitials, selectClassName } from "@/components/task-display-utils"
import { fadeUp, listContainer, listItem } from "@/components/motion-presets"
import type { CurrentUser } from "@/lib/auth/permissions"
import { cn } from "@/lib/utils"
import type { ReportListItem } from "@/lib/data/reports"

type LeadProjectOption = { id: string; name: string }

type ReportsBoardProps = {
  reports: ReportListItem[]
  currentUser: CurrentUser
  leadProjects: LeadProjectOption[]
}

export function ReportsBoard({ reports, currentUser: _currentUser, leadProjects }: ReportsBoardProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "")
  const [projectId, setProjectId] = useState(leadProjects[0]?.id ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const reduceMotion = useReducedMotion()
  const canGenerate = leadProjects.length > 0

  useEffect(() => {
    if (reports.length === 0) {
      setSelectedId("")
      return
    }

    if (!reports.some((report) => report.id === selectedId)) {
      setSelectedId(reports[0].id)
    }
  }, [reports, selectedId])

  useEffect(() => {
    if (leadProjects.length === 0) {
      setProjectId("")
      return
    }
    if (!leadProjects.some((p) => p.id === projectId)) {
      setProjectId(leadProjects[0].id)
    }
  }, [leadProjects, projectId])

  const selected = reports.find((r) => r.id === selectedId)

  function handleGenerate() {
    if (!projectId) {
      const message = "Select a project before generating a report."
      setError(message)
      toast.error(message)
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await generateWeeklyReportAction(projectId)

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      if (result.success) {
        toast.success(result.success)
      }

      if (result.reportId) {
        setSelectedId(result.reportId)
      }

      router.refresh()
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="text-sm text-muted-foreground">
            <span>Workspace</span>
            <span className="px-1.5">/</span>
            <span className="font-medium text-foreground">Reports</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reports</h1>
        </div>

        {canGenerate && (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Project</span>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={cn(selectClassName, "min-w-[200px]")}
                required
              >
                {leadProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={handleGenerate} disabled={pending || !projectId}>
              <Sparkles className="size-4" />
              {pending ? "Generating…" : "Generate weekly report"}
            </Button>
          </div>
        )}
      </div>

      {!canGenerate && (
        <p className="mt-4 text-sm text-muted-foreground">
          Only project leads can generate AI weekly reports. You can still browse reports for
          projects you can access.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {reports.length === 0 ? (
        <motion.div
          className="mt-6"
          initial={reduceMotion ? false : fadeUp.hidden}
          animate={fadeUp.show}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-dashed shadow-sm">
            <CardContent className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-foreground">No reports yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Mark tasks as Done on a project, then generate a weekly AI summary.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={reduceMotion ? undefined : listContainer}
          initial="hidden"
          animate="show"
        >
          {reports.map((report) => {
            const isSelected = report.id === selected?.id

            return (
              <motion.button
                key={report.id}
                type="button"
                variants={reduceMotion ? undefined : listItem}
                onClick={() => setSelectedId(report.id)}
                className="text-left"
              >
                <Card
                  className={cn(
                    "h-full transition-shadow hover:shadow-md",
                    isSelected ? "border-primary ring-1 ring-primary/30 shadow-sm" : "shadow-sm",
                  )}
                >
                  <CardContent className="space-y-3 p-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Weekly Report
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{report.weekRange}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{report.projectName}</p>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Created: {report.createdAt}</p>
                      <div className="flex items-center gap-2">
                        <span>Author:</span>
                        <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                          {taskInitials(report.author)}
                        </div>
                        <span className="text-foreground">{report.author}</span>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {report.preview}
                    </p>
                  </CardContent>
                </Card>
              </motion.button>
            )
          })}
        </motion.div>
      )}

      {selected && (
        <motion.div
          key={selected.id}
          className="mt-6"
          initial={reduceMotion ? false : fadeUp.hidden}
          animate={fadeUp.show}
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2 border-b border-border pb-5">
                <h2 className="text-lg font-semibold text-foreground">
                  Weekly Report ({selected.weekRange})
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>Author:</span>
                    <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {taskInitials(selected.author)}
                    </div>
                    <span className="font-medium text-foreground">{selected.author}</span>
                  </div>
                  <span>Created: {selected.createdAt}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Completed work summary</h3>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {selected.bullets.map((bullet) => (
                    <li key={bullet} className="text-foreground/90">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  )
}
