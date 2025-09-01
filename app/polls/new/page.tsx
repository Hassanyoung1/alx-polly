import { CreatePollForm } from "@/components/polls/create-poll-form"
import { ProtectedRoute } from "@/components/protected-route"

export default function NewPollPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 max-w-2xl">
        <CreatePollForm />
      </div>
    </ProtectedRoute>
  )
}
