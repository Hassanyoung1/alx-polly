"use client"

import { useState } from "react"
import { Poll, Vote } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, formatTimeUntil } from "@/lib/date-utils"
import { voteAction } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface PollVotingProps {
  poll: Poll
  userVote?: Vote
  pollId: string
}

export function PollVoting({ poll, userVote, pollId }: PollVotingProps) {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string>(userVote?.option_id || "")
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalVotes = poll.votes?.length || 0
  const currentTime = new Date()
  const expirationTime = poll.expires_at ? new Date(poll.expires_at) : null
  const isExpired = expirationTime && expirationTime < currentTime
  const canVote = poll.is_active && !isExpired && !userVote

  const handleVote = async () => {
    if (!selectedOption || !canVote) return

    setIsVoting(true)
    setError(null)

    try {
      // TODO: Get actual user ID from auth context
      // For now, use undefined to allow anonymous voting
      const result = await voteAction(pollId, selectedOption, undefined)

      if (result.success) {
        // Refresh the page to show updated vote counts
        router.refresh()
      } else {
        setError(result.error || "Failed to submit vote")
      }
    } catch (error) {
      setError("An unexpected error occurred")
      console.error("Failed to vote:", error)
    } finally {
      setIsVoting(false)
    }
  }

  const getOptionVoteCount = (optionId: string) => {
    return poll.votes?.filter(vote => vote.option_id === optionId).length || 0
  }

  const getOptionPercentage = (optionId: string) => {
    if (totalVotes === 0) return 0
    return Math.round((getOptionVoteCount(optionId) / totalVotes) * 100)
  }

  return (
    <Card>
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{poll.title}</h1>
          <div className="flex gap-2">
            {isExpired && <Badge variant="destructive">Expired</Badge>}
            {!poll.is_active && <Badge variant="secondary">Inactive</Badge>}
            {poll.is_active && !isExpired && <Badge>Active</Badge>}
          </div>
        </div>

        {poll.description && (
          <p className="text-muted-foreground mb-6">{poll.description}</p>
        )}

        <div className="space-y-3 mb-6">
          {(poll.options || []).map((option) => {
            const voteCount = getOptionVoteCount(option.id)
            const percentage = getOptionPercentage(option.id)
            const isSelected = selectedOption === option.id
            const isUserVote = userVote?.option_id === option.id

            return (
              <div key={option.id} className="space-y-2">
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    canVote && isSelected
                      ? "border-primary bg-primary/5"
                      : isUserVote
                      ? "border-green-500 bg-green-50"
                      : "border-border hover:bg-accent/50"
                  } ${!canVote ? "cursor-default" : ""}`}
                  onClick={() => canVote && setSelectedOption(option.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{option.text}</span>
                    {userVote && (
                      <span className="text-sm text-muted-foreground">
                        {voteCount} votes ({percentage}%)
                      </span>
                    )}
                  </div>
                  
                  {userVote && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {canVote && (
          <Button
            onClick={handleVote}
            disabled={!selectedOption || isVoting}
            className="w-full"
          >
            {isVoting ? "Voting..." : "Submit Vote"}
          </Button>
        )}

        {userVote && (
          <div className="text-center text-green-600 font-medium">
            ✓ You voted for "{poll.options?.find(o => o.id === userVote.option_id)?.text || 'Unknown option'}"
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total votes: {totalVotes}</span>
            <span>Created {formatDistanceToNow(poll.created_at)} ago</span>
          </div>
          {poll.expires_at && (
            <div className="text-sm text-muted-foreground mt-1">
              {isExpired 
                ? `Expired ${formatDistanceToNow(poll.expires_at)} ago`
                : `Expires in ${formatTimeUntil(poll.expires_at)}`
              }
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
