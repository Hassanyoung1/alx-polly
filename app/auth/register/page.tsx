import { RegisterForm } from "@/components/auth/register-form"
import { ProtectedRoute } from "@/components/protected-route"

export default function RegisterPage() {
  return (
    <ProtectedRoute requireAuth={false} redirectTo="/polls">
      <div className="min-h-screen flex items-center justify-center p-4">
        <RegisterForm />
      </div>
    </ProtectedRoute>
  )
}
