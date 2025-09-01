"use client"

import { Poll } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, formatTimeUntil } from "@/lib/date-utils"
import Link from "next/link"

interface PollCardProps {
  poll: Poll
}

export function PollCard({ poll }: PollCardProps) {
  const totalVotes = poll.votes?.length || 0
  const currentTime = new Date()
  const expirationTime = poll.expires_at ? new Date(poll.expires_at) : null
  const isExpired = expirationTime && expirationTime < currentTime

  return (
    <Link href={`/polls/${poll.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-accent/50">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{poll.title}</h3>
            <div className="flex gap-2">
              {isExpired && <Badge variant="destructive">Expired</Badge>}
              {!poll.is_active && <Badge variant="secondary">Inactive</Badge>}
              {poll.is_active && !isExpired && <Badge>Active</Badge>}
            </div>
          </div>
          
          {poll.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {poll.description}
            </p>
          )}

          {/* Display poll options */}
          {poll.options && poll.options.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium mb-2">Options:</p>
              <div className="space-y-1">
                {poll.options.slice(0, 3).map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded">{index + 1}</span>
                    <span className="text-sm text-muted-foreground truncate">{option.text}</span>
                  </div>
                ))}
                {poll.options.length > 3 && (
                  <p className="text-xs text-muted-foreground italic">
                    +{poll.options.length - 3} more options
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{poll.options?.length || 0} options</span>
            <span>{totalVotes} votes</span>
            <span>Created {formatDistanceToNow(poll.created_at)} ago</span>
          </div>

          {poll.expires_at && (
            <div className="mt-2 text-sm text-muted-foreground">
              {isExpired 
                ? `Expired ${formatDistanceToNow(poll.expires_at)} ago`
                : `Expires in ${formatTimeUntil(poll.expires_at)}`
              }
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
