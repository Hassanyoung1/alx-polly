"use client"

import { usePoll } from "@/hooks/use-polls"
import { PollVoting } from "@/components/polls/poll-voting"
import { pollService } from "@/lib/api"
import { useEffect, useState, use } from "react"
import { Vote } from "@/types"

interface PollPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PollPage({ params }: PollPageProps) {
  const { id } = use(params)
  const { poll, isLoading, error, refetch } = usePoll(id)
  const [userVote, setUserVote] = useState<Vote | undefined>(undefined)

  useEffect(() => {
    if (poll) {
      // TODO: Get actual user ID from auth context
      pollService.getUserVote(poll.id, "current_user").then(vote => {
        setUserVote(vote || undefined)
      })
    }
  }, [poll])

  const handleVote = async (optionId: string) => {
    if (!poll) return

    try {
      const vote = await pollService.vote(poll.id, optionId)
      setUserVote(vote)
      refetch() // Refresh poll data to get updated vote counts
    } catch (error) {
      console.error("Failed to vote:", error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading poll...</p>
        </div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-red-500">
            {error || "Poll not found"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <PollVoting 
        poll={poll} 
        userVote={userVote}
        onVote={handleVote}
      />
    </div>
  )
}
