"use client"

/**
 * Modal dialog for creating or editing a task within a known project context.
 *
 * Used on the project detail page where `projectId` is fixed via a hidden
 * input. Closes automatically after a successful server action response.
 */
import { useActionState, useEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { toast } from "sonner"
import { createTaskAction, updateTaskAction } from "@/lib/actions/tasks"
import type { ActionState } from "@/lib/actions/projects"
import { Button } from "@/components/ui/button"
import { inputClassName, selectClassName, textareaClassName } from "@/components/task-display-utils"
import { modalMotion } from "@/components/motion-presets"
import type { TaskListItem, UserOption } from "@/types/domain"

const initialState: ActionState = {}

type TaskFormDialogProps = {
  open: boolean
  onClose: () => void
  projectId: string
  users: UserOption[]
  task?: TaskListItem | null
}

export function TaskFormDialog({
  open,
  onClose,
  projectId,
  users,
  task = null,
}: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const reduceMotion = useReducedMotion()
  const isEdit = Boolean(task)

  const boundAction = task ? updateTaskAction.bind(null, task.id) : createTaskAction
  const [state, formAction, pending] = useActionState(boundAction, initialState)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    if (state.success) {
      toast.success(state.success)
      onClose()
    }
  }, [state.success, open, onClose])

  useEffect(() => {
    if (!open) return
    if (state.error) {
      toast.error(state.error)
    }
  }, [state.error, open, onClose])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-lg border border-border bg-background p-0 shadow-lg backdrop:bg-black/50"
    >
      <motion.form
        key={task?.id ?? "new"}
        action={formAction}
        className="space-y-4 p-6"
        {...(reduceMotion ? {} : modalMotion)}
      >
        <input type="hidden" name="projectId" value={projectId} />

        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit task" : "New task"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update this task." : "Add a task to this project."}
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Title</span>
          <input
            name="title"
            required
            defaultValue={task?.title ?? ""}
            className={inputClassName}
            placeholder="Finalize homepage hero copy"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Description</span>
          <textarea
            name="description"
            rows={2}
            defaultValue={task?.description ?? ""}
            className={textareaClassName}
            placeholder="Optional details"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Priority</span>
          <select name="priority" defaultValue={task?.priority ?? "MEDIUM"} className={selectClassName}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Assignee</span>
          <select name="assigneeId" defaultValue={task?.assigneeId ?? ""} className={selectClassName}>
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
          <input
            name="dueDate"
            type="date"
            defaultValue={task?.dueDateInput ?? ""}
            className={inputClassName}
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
            {pending ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create task"}
          </Button>
        </div>
      </motion.form>
    </dialog>
  )
}
