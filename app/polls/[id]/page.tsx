"use client"

import { usePoll } from "@/hooks/use-polls"
import { PollVoting } from "@/components/polls/poll-voting"
import { PollResultChart } from "@/components/polls/poll-result-chart"
import { PollShare } from "@/components/polls/poll-share"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { use } from "react"

interface PollPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PollPage({ params }: PollPageProps) {
  const { id } = use(params)
  const { poll, isLoading, error } = usePoll(id)

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-4 max-w-4xl">
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
        <div className="container mx-auto p-4 max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Poll Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The poll you're looking for doesn't exist."}
          </p>
          <Link href="/polls">
            <Button variant="outline">← Back to Polls</Button>
          </Link>
        </div>
      </ProtectedRoute>
    )
  }

  // TODO: Get actual user vote from context when available
  const userVote = null

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="space-y-8">
          {/* Poll Header with Actions */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{poll.title}</h1>
                <Badge variant={poll.is_active ? "default" : "secondary"}>
                  {poll.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {poll.description && (
                <p className="text-muted-foreground">{poll.description}</p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link href={`/polls/${id}/edit`}>
                <Button variant="outline" size="sm">
                  ✏️ Edit
                </Button>
              </Link>
              <Link href="/polls">
                <Button variant="outline" size="sm">
                  ← Back to Polls
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column: Voting Interface */}
            <div>
              <PollVoting 
                poll={poll} 
                userVote={userVote || undefined}
                pollId={id}
              />
            </div>

            {/* Right Column: Sharing and Results */}
            <div className="space-y-6">
              {/* Poll Sharing Component */}
              <PollShare poll={poll} />

              {/* Chart Results View */}
              {(poll.votes?.length || 0) > 0 && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-muted-foreground">
                      📊 Detailed Results Chart
                    </h2>
                  </div>
                  <PollResultChart 
                    poll={poll} 
                    userVote={userVote || undefined}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
