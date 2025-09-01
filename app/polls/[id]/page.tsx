import { getPoll, getUserVote } from "@/lib/polls"
import { PollVoting } from "@/components/polls/poll-voting"
import { PollResultChart } from "@/components/polls/poll-result-chart"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PollPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PollPage({ params }: PollPageProps) {
  const { id } = await params
  const poll = await getPoll(id)

  if (!poll) {
    notFound()
  }

  // TODO: Get actual user ID from auth context
  // For now, skip user vote fetching to avoid UUID errors
  const userVote = null // await getUserVote(id, "current_user")

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-8">
        {/* Voting Interface */}
        <div className="max-w-2xl mx-auto">
          <PollVoting 
            poll={poll} 
            userVote={userVote || undefined}
            pollId={id}
          />
        </div>
        
        {/* Chart Results View */}
        {(poll.votes?.length || 0) > 0 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-muted-foreground">
                📊 Detailed Results Chart
              </h2>
            </div>
            <PollResultChart 
              poll={poll} 
              userVote={userVote || undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}
