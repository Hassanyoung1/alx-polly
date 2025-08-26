"use client"

import { useState } from "react"
import { Poll, Vote } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@/lib/date-utils"

interface PollVotingProps {
  poll: Poll
  userVote?: Vote
  onVote: (optionId: string) => Promise<void>
}

export function PollVoting({ poll, userVote, onVote }: PollVotingProps) {
  const [selectedOption, setSelectedOption] = useState<string>(userVote?.optionId || "")
  const [isVoting, setIsVoting] = useState(false)

  const totalVotes = poll.votes.length
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date()
  const canVote = poll.isActive && !isExpired && !userVote

  const handleVote = async () => {
    if (!selectedOption || !canVote) return

    setIsVoting(true)
    try {
      await onVote(selectedOption)
    } catch (error) {
      console.error("Failed to vote:", error)
    } finally {
      setIsVoting(false)
    }
  }

  const getOptionVoteCount = (optionId: string) => {
    return poll.votes.filter(vote => vote.optionId === optionId).length
  }

  const getOptionPercentage = (optionId: string) => {
    if (totalVotes === 0) return 0
    return Math.round((getOptionVoteCount(optionId) / totalVotes) * 100)
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{poll.title}</h1>
          <div className="flex gap-2">
            {isExpired && <Badge variant="destructive">Expired</Badge>}
            {!poll.isActive && <Badge variant="secondary">Inactive</Badge>}
            {poll.isActive && !isExpired && <Badge>Active</Badge>}
          </div>
        </div>

        {poll.description && (
          <p className="text-muted-foreground mb-6">{poll.description}</p>
        )}

        <div className="space-y-3 mb-6">
          {poll.options.map((option) => {
            const voteCount = getOptionVoteCount(option.id)
            const percentage = getOptionPercentage(option.id)
            const isSelected = selectedOption === option.id
            const isUserVote = userVote?.optionId === option.id

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
            ✓ You voted for "{poll.options.find(o => o.id === userVote.optionId)?.text}"
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total votes: {totalVotes}</span>
            <span>Created {formatDistanceToNow(poll.createdAt)} ago</span>
          </div>
          {poll.expiresAt && (
            <div className="text-sm text-muted-foreground mt-1">
              {isExpired 
                ? `Expired ${formatDistanceToNow(poll.expiresAt)} ago`
                : `Expires in ${formatDistanceToNow(poll.expiresAt)}`
              }
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
