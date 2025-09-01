"use client"

import { Poll } from "@/types"
import { PollCard } from "./poll-card"

interface PollListProps {
  polls: Poll[]
}

export function PollList({ polls }: PollListProps) {
  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No Polls Yet</h3>
        <p className="text-muted-foreground">No polls available. Create your first poll!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          poll={poll}
        />
      ))}
    </div>
  )
}
