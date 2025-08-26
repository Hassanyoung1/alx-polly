"use client"

import { Poll } from "@/types"
import { PollCard } from "./poll-card"

interface PollListProps {
  polls: Poll[]
  onPollClick?: (poll: Poll) => void
  emptyMessage?: string
}

export function PollList({ polls, onPollClick, emptyMessage = "No polls found" }: PollListProps) {
  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No Polls Yet</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          poll={poll}
          onClick={() => onPollClick?.(poll)}
        />
      ))}
    </div>
  )
}
