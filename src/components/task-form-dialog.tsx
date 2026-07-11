"use client"

import { useActionState, useEffect, useRef } from "react"
import { createTaskAction } from "@/lib/actions/tasks"
import type { ActionState } from "@/lib/actions/projects"
import { Button } from "@/components/ui/button"
import { inputClassName, selectClassName } from "@/components/task-display-utils"
import type { UserOption } from "@/types/domain"

const initialState: ActionState = {}

type TaskFormDialogProps = {
  open: boolean
  onClose: () => void
  projectId: string
  users: UserOption[]
}

export function TaskFormDialog({ open, onClose, projectId, users }: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [state, formAction, pending] = useActionState(createTaskAction, initialState)

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

  useEffect(() => {
    if (state.success) {
      onClose()
    }
  }, [state.success, onClose])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-lg border border-border bg-background p-0 shadow-lg backdrop:bg-black/50"
    >
      <form action={formAction} className="space-y-4 p-6">
        <input type="hidden" name="projectId" value={projectId} />

        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">New task</h2>
          <p className="text-sm text-muted-foreground">Add a task to this project.</p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Title</span>
          <input name="title" required className={inputClassName} placeholder="Finalize homepage hero copy" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Priority</span>
          <select name="priority" defaultValue="MEDIUM" className={selectClassName}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Assignee</span>
          <select name="assigneeId" defaultValue="" className={selectClassName}>
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Due date</span>
          <input name="dueDate" type="date" className={inputClassName} />
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
            {pending ? "Creating…" : "Create task"}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
