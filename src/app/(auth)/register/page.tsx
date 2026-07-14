/**
 * Registration page route (/register).
 *
 * Server component shell that delegates rendering and form logic to RegisterForm.
 * Account creation and email confirmation are handled inside the form component.
 */
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return <RegisterForm />
}
