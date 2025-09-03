"use client"

import { usePoll } from "@/hooks/use-polls"
import { EditPollForm } from "@/components/polls/edit-poll-form"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { use } from "react"

interface EditPollPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPollPage({ params }: EditPollPageProps) {
  const { id } = use(params)
  const { poll, isLoading, error } = usePoll(id)

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-4">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !poll) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Poll Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The poll you're trying to edit doesn't exist."}
          </p>
          <Link href="/polls">
            <Button variant="outline">← Back to Polls</Button>
          </Link>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <EditPollForm poll={poll} />
      </div>
    </ProtectedRoute>
  )
}
