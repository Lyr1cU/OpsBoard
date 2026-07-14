/**
 * Login page route (/login).
 *
 * Server component shell that delegates rendering and form logic to LoginForm.
 * Supabase email/password and OAuth flows are handled inside the form component.
 */
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return <LoginForm />
}
