import { LoginForm } from "@/components/auth/login-form"
import { ProtectedRoute } from "@/components/protected-route"

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false} redirectTo="/polls">
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </ProtectedRoute>
  )
}
