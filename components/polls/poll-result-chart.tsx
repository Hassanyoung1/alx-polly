"use client"

import { Poll, Vote } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, formatTimeUntil } from "@/lib/date-utils"

interface PollResultChartProps {
  poll: Poll
  userVote?: Vote
  showVotingInterface?: boolean
}

export function PollResultChart({ poll, userVote, showVotingInterface = false }: PollResultChartProps) {
  const totalVotes = poll.votes?.length || 0
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date()

  const getOptionVoteCount = (optionId: string) => {
    return poll.votes?.filter(vote => vote.option_id === optionId).length || 0
  }

  const getOptionPercentage = (optionId: string) => {
    if (totalVotes === 0) return 0
    return Math.round((getOptionVoteCount(optionId) / totalVotes) * 100)
  }

  // Sort options by vote count for better visualization
  const sortedOptions = [...(poll.options || [])].sort((a, b) => {
    return getOptionVoteCount(b.id) - getOptionVoteCount(a.id)
  })

  // Color palette for chart visualization
  const getOptionColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500"
    ]
    return colors[index % colors.length]
  }

  const getOptionColorLight = (index: number) => {
    const colors = [
      "bg-blue-100",
      "bg-green-100",
      "bg-yellow-100", 
      "bg-purple-100",
      "bg-pink-100",
      "bg-indigo-100",
      "bg-red-100",
      "bg-teal-100"
    ]
    return colors[index % colors.length]
  }

  return (
    <Card>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{poll.title}</h2>
          <div className="flex gap-2">
            {isExpired && <Badge variant="destructive">Expired</Badge>}
            {!poll.is_active && <Badge variant="secondary">Inactive</Badge>}
            {poll.is_active && !isExpired && <Badge>Active</Badge>}
          </div>
        </div>

        {poll.description && (
          <p className="text-muted-foreground mb-6">{poll.description}</p>
        )}

        {/* Chart Visualization */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Poll Results</h3>
          
          {totalVotes === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📊</div>
              <p>No votes yet. Be the first to vote!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedOptions.map((option, index) => {
                const voteCount = getOptionVoteCount(option.id)
                const percentage = getOptionPercentage(option.id)
                const isUserVote = userVote?.option_id === option.id
                const colorClass = getOptionColor(index)
                const colorLightClass = getOptionColorLight(index)

                return (
                  <div key={option.id} className="space-y-2">
                    {/* Option Header */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                        <span className="font-medium">{option.text}</span>
                        {isUserVote && (
                          <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                            Your Vote
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage}%)
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${colorClass} h-3 rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      {/* Percentage Label on Bar (for larger percentages) */}
                      {percentage > 15 && (
                        <div 
                          className="absolute top-0 h-3 flex items-center text-white text-xs font-medium px-2"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage}%
                        </div>
                      )}
                    </div>

                    {/* Visual Bar Chart (Alternative horizontal representation) */}
                    <div className={`${colorLightClass} rounded-lg p-2 border border-gray-200`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                          <span className="text-sm font-medium">{option.text}</span>
                        </div>
                        <span className="text-sm font-semibold">{voteCount}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-accent/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalVotes}</div>
            <div className="text-sm text-muted-foreground">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{poll.options?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Options</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {(poll.options?.length || 0) > 0 ? Math.round(totalVotes / (poll.options?.length || 1)) : 0}
            </div>
            <div className="text-sm text-muted-foreground">Avg per Option</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {totalVotes > 0 ? Math.max(...(poll.options || []).map(opt => getOptionPercentage(opt.id))) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Leading Option</div>
          </div>
        </div>

        {/* Winner Announcement */}
        {totalVotes > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-green-600">🏆</div>
              <h4 className="font-semibold text-green-800">Current Leader</h4>
            </div>
            <div className="text-green-700">
              <span className="font-medium">
                {sortedOptions[0]?.text}
              </span>
              {" "}with {getOptionVoteCount(sortedOptions[0]?.id)} votes ({getOptionPercentage(sortedOptions[0]?.id)}%)
            </div>
          </div>
        )}

        {/* User Vote Status */}
        {userVote && (
          <div className="text-center text-green-600 font-medium mb-4">
            ✓ You voted for "{poll.options?.find(o => o.id === userVote.option_id)?.text || 'Unknown option'}"
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row justify-between gap-2 text-sm text-muted-foreground">
            <span>Created {formatDistanceToNow(poll.created_at)} ago</span>
            {poll.expires_at && (
              <span>
                {isExpired 
                  ? `Expired ${formatDistanceToNow(poll.expires_at)} ago`
                  : `Expires in ${formatTimeUntil(poll.expires_at)}`
                }
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
