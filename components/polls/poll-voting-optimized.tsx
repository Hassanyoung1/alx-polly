"use client"

import { useState, useMemo, useCallback } from "react"
import { Poll, Vote } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, formatTimeUntil } from "@/lib/date-utils"
import { voteAction } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface PollVotingProps {
  poll: Poll
  userVote?: Vote
  pollId: string
}

interface OptionStats {
  id: string
  text: string
  voteCount: number
  percentage: number
  isUserChoice: boolean
}

interface PollMetrics {
  totalVotes: number
  optionStats: OptionStats[]
  currentTime: Date
  expirationTime: Date | null
  isExpired: boolean
  canVote: boolean
}

export function PollVoting({ poll, userVote, pollId }: PollVotingProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedOption, setSelectedOption] = useState<string>(userVote?.option_id || "")
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized poll metrics calculation (O(n) instead of O(n²))
  const pollMetrics = useMemo((): PollMetrics => {
    const votes = poll.votes || []
    const options = poll.options || []
    const totalVotes = votes.length
    
    // Pre-calculate vote counts for all options in single pass
    const voteCountMap = new Map<string, number>()
    votes.forEach(vote => {
      const currentCount = voteCountMap.get(vote.option_id) || 0
      voteCountMap.set(vote.option_id, currentCount + 1)
    })
    
    // Calculate statistics for each option
    const optionStats: OptionStats[] = options.map(option => {
      const voteCount = voteCountMap.get(option.id) || 0
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
      const isUserChoice = userVote?.option_id === option.id
      
      return {
        id: option.id,
        text: option.text,
        voteCount,
        percentage,
        isUserChoice
      }
    })
    
    // Calculate time-based properties
    const currentTime = new Date()
    const expirationTime = poll.expires_at ? new Date(poll.expires_at) : null
    const isExpired = expirationTime ? expirationTime < currentTime : false
    const canVote = poll.is_active && !isExpired && !userVote
    
    return {
      totalVotes,
      optionStats,
      currentTime,
      expirationTime,
      isExpired,
      canVote
    }
  }, [poll.votes, poll.options, poll.expires_at, poll.is_active, userVote])

  // Memoized vote handler to prevent unnecessary re-renders
  const handleVote = useCallback(async () => {
    if (!selectedOption) {
      setError("Please select an option")
      return
    }

    if (!user) {
      setError("You must be logged in to vote")
      return
    }

    setIsVoting(true)
    setError(null)

    try {
      const result = await voteAction(pollId, selectedOption, user.id)
      
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || "Failed to submit vote")
      }
    } catch (error) {
      console.error("Error voting:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsVoting(false)
    }
  }, [selectedOption, user, pollId, router])

  // Memoized option selection handler
  const handleOptionSelect = useCallback((optionId: string) => {
    if (pollMetrics.canVote) {
      setSelectedOption(optionId)
    }
  }, [pollMetrics.canVote])

  const { totalVotes, optionStats, isExpired, canVote } = pollMetrics

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
          {optionStats.map((optionStat) => {
            const isSelected = selectedOption === optionStat.id
            const { voteCount, percentage, isUserChoice } = optionStat

            return (
              <div key={optionStat.id} className="space-y-2">
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    canVote && isSelected
                      ? "border-primary bg-primary/5"
                      : isUserChoice
                      ? "border-green-500 bg-green-50"
                      : "border-border hover:bg-accent/50"
                  } ${!canVote ? "cursor-default" : ""}`}
                  onClick={() => handleOptionSelect(optionStat.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{optionStat.text}</span>
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
            ✓ You voted for &quot;{optionStats.find(opt => opt.isUserChoice)?.text || 'Unknown option'}&quot;
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
