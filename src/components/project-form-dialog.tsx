"use client"

/**
 * Modal dialog for creating or editing a client project (Team Lead).
 *
 * Controlled via the `open` prop and synchronized with a native `<dialog>`
 * element. Create redirects to the new project; edit closes on success.
 */
import { useActionState, useEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { toast } from "sonner"
import {
  createProjectAction,
  updateProjectAction,
  type ActionState,
} from "@/lib/actions/projects"
import { Button } from "@/components/ui/button"
import { inputClassName, textareaClassName } from "@/components/task-display-utils"
import { modalMotion } from "@/components/motion-presets"
import type { ProjectListItem } from "@/types/domain"

const initialState: ActionState = {}

type ProjectFormDialogProps = {
  open: boolean
  onClose: () => void
  project?: ProjectListItem | null
}

export function ProjectFormDialog({ open, onClose, project = null }: ProjectFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const reduceMotion = useReducedMotion()
  const isEdit = Boolean(project)

  const boundUpdate = project
    ? updateProjectAction.bind(null, project.id)
    : createProjectAction

  const [state, formAction, pending] = useActionState(boundUpdate, initialState)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    if (state.success && isEdit) {
      toast.success(state.success)
      onClose()
    }
  }, [state.success, open, isEdit, onClose])

  useEffect(() => {
    if (!open) return
    if (state.error) {
      toast.error(state.error)
    }
  }, [state.error, open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-lg border border-border bg-background p-0 shadow-lg backdrop:bg-black/50"
    >
      <motion.form
        action={formAction}
        className="space-y-4 p-6"
        {...(reduceMotion ? {} : modalMotion)}
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit project" : "New project"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update client project details." : "Add a client project to your workspace."}
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Name</span>
          <input
            name="name"
            required
            defaultValue={project?.name ?? ""}
            className={inputClassName}
            placeholder="Northwind Rebrand"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Client</span>
          <input
            name="clientName"
            defaultValue={project?.client === "—" ? "" : (project?.client ?? "")}
            className={inputClassName}
            placeholder="Northwind Trading Co."
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Description</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={project?.description ?? ""}
            className={textareaClassName}
            placeholder="What is this project about?"
          />
        </label>

        {state.error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create project"}
          </Button>
        </div>
      </motion.form>
    </dialog>
  )
}
