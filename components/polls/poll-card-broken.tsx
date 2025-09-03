"use client"

import { Poll } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, formatTimeUntil } from "@/lib/date-utils"
import { PollActions } from "./poll-actions"
import Link from "next/link"
import React, { useMemo } from "react"

interface PollCardProps {
  poll: Poll
}

export const PollCard = React.memo(function PollCard({ poll }: PollCardProps) {
  // Memoize expensive calculations
  const pollStats = useMemo(() => {
    const totalVotes = poll.votes?.length || 0
    const currentTime = new Date()
    const expirationTime = poll.expires_at ? new Date(poll.expires_at) : null
    const isExpired = expirationTime && expirationTime < currentTime

    return {
      totalVotes,
      isExpired,
      expirationTime,
      currentTime
    }
  }, [poll.votes?.length, poll.expires_at])

  // Memoize badge status
  const badgeContent = useMemo(() => {
    const badges = []
    
    if (pollStats.isExpired) {
      badges.push(<Badge key="expired" variant="destructive">Expired</Badge>)
    }
    
    if (!poll.is_active) {
      badges.push(<Badge key="inactive" variant="secondary">Inactive</Badge>)
    } else if (!pollStats.isExpired) {
      badges.push(<Badge key="active">Active</Badge>)
    }
    
    return badges
  }, [poll.is_active, pollStats.isExpired])

  // Memoize time display text
  const timeDisplay = useMemo(() => {
    if (pollStats.isExpired) {
      return `Expired ${formatDistanceToNow(pollStats.expirationTime!)} ago`
    }
    
    if (pollStats.expirationTime) {
      return `${formatTimeUntil(pollStats.expirationTime)} remaining`
    }
    
    return `Created ${formatDistanceToNow(new Date(poll.created_at))}`
  }, [pollStats.isExpired, pollStats.expirationTime, poll.created_at])

  return (
    <Link href={`/polls/${poll.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-accent/50">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1 pr-2">{poll.title}</h3>
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                {badgeContent}
              </div>
              <PollActions 
                pollId={poll.id}
                pollTitle={poll.title}
                isActive={poll.is_active}
              />
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
            <span>{pollStats.totalVotes} votes</span>
            <span>{timeDisplay}</span>
          </div>

          {poll.expires_at && (
            <div className="mt-2 text-sm text-muted-foreground">
              {timeDisplay}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
})
