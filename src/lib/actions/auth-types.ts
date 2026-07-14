/**
 * Auth action state types for OpsBoard.
 *
 * Server Actions that handle login and registration return a small state object
 * instead of throwing on validation or provider errors. Client forms (e.g. useActionState)
 * read `error` or `success` to show inline feedback without a full page reload.
 */

/** Shape returned by login/register Server Actions to drive form UI feedback. */
export type AuthActionState = {
  /** Human-readable validation or Supabase auth error message. */
  error?: string
  /** Confirmation message when signup succeeds but email confirmation is required. */
  success?: string
}
