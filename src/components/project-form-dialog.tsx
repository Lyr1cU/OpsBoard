"use client"

import { useActionState, useEffect, useRef } from "react"
import { createProjectAction, type ActionState } from "@/lib/actions/projects"
import { Button } from "@/components/ui/button"
import { inputClassName, textareaClassName } from "@/components/task-display-utils"

const initialState: ActionState = {}

type ProjectFormDialogProps = {
  open: boolean
  onClose: () => void
}

export function ProjectFormDialog({ open, onClose }: ProjectFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [state, formAction, pending] = useActionState(createProjectAction, initialState)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    }
    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-lg border border-border bg-background p-0 shadow-lg backdrop:bg-black/50"
    >
      <form action={formAction} className="space-y-4 p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">New project</h2>
          <p className="text-sm text-muted-foreground">Add a client project to your workspace.</p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Name</span>
          <input name="name" required className={inputClassName} placeholder="Northwind Rebrand" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Client</span>
          <input name="clientName" className={inputClassName} placeholder="Northwind Trading Co." />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Description</span>
          <textarea
            name="description"
            rows={3}
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
            {pending ? "Creating…" : "Create project"}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
