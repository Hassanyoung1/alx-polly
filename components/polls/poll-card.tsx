"use client"

import { Poll } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@/lib/date-utils"

interface PollCardProps {
  poll: Poll
  onClick?: () => void
}

export function PollCard({ poll, onClick }: PollCardProps) {
  const totalVotes = poll.votes.length
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date()

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:bg-accent/50' : ''}`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{poll.title}</h3>
          <div className="flex gap-2">
            {isExpired && <Badge variant="destructive">Expired</Badge>}
            {!poll.isActive && <Badge variant="secondary">Inactive</Badge>}
            {poll.isActive && !isExpired && <Badge>Active</Badge>}
          </div>
        </div>
        
        {poll.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {poll.description}
          </p>
        )}

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{poll.options.length} options</span>
          <span>{totalVotes} votes</span>
          <span>Created {formatDistanceToNow(poll.createdAt)} ago</span>
        </div>

        {poll.expiresAt && (
          <div className="mt-2 text-sm text-muted-foreground">
            {isExpired 
              ? `Expired ${formatDistanceToNow(poll.expiresAt)} ago`
              : `Expires in ${formatDistanceToNow(poll.expiresAt)}`
            }
          </div>
        )}
      </div>
    </Card>
  )
}
