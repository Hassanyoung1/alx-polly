/**
 * Example usage of PollResultChart component
 * 
 * This file demonstrates how to use the PollResultChart component
 * with sample poll data for visualization.
 */

import { PollResultChart } from "@/components/polls/poll-result-chart"
import { Poll, Vote } from "@/types"

// Sample poll data for demonstration
const samplePoll: Poll = {
  id: "sample-poll-1",
  title: "What's your favorite programming language?",
  description: "Help us understand the community preferences for our next project",
  created_by: "user1",
  created_at: new Date("2025-01-20").toISOString(),
  updated_at: new Date("2025-01-20").toISOString(),
  expires_at: new Date("2025-02-20").toISOString(),
  is_active: true,
  options: [
    { id: "opt1", poll_id: "sample-poll-1", text: "JavaScript", order_num: 1, votes: [] },
    { id: "opt2", poll_id: "sample-poll-1", text: "Python", order_num: 2, votes: [] },
    { id: "opt3", poll_id: "sample-poll-1", text: "TypeScript", order_num: 3, votes: [] },
    { id: "opt4", poll_id: "sample-poll-1", text: "Rust", order_num: 4, votes: [] },
    { id: "opt5", poll_id: "sample-poll-1", text: "Go", order_num: 5, votes: [] },
  ],
  votes: [
    { id: "vote1", poll_id: "sample-poll-1", option_id: "opt1", user_id: "user1", created_at: new Date().toISOString() },
    { id: "vote2", poll_id: "sample-poll-1", option_id: "opt2", user_id: "user2", created_at: new Date().toISOString() },
    { id: "vote3", poll_id: "sample-poll-1", option_id: "opt1", user_id: "user3", created_at: new Date().toISOString() },
    { id: "vote4", poll_id: "sample-poll-1", option_id: "opt3", user_id: "user4", created_at: new Date().toISOString() },
    { id: "vote5", poll_id: "sample-poll-1", option_id: "opt1", user_id: "user5", created_at: new Date().toISOString() },
    { id: "vote6", poll_id: "sample-poll-1", option_id: "opt2", user_id: "user6", created_at: new Date().toISOString() },
    { id: "vote7", poll_id: "sample-poll-1", option_id: "opt4", user_id: "user7", created_at: new Date().toISOString() },
    { id: "vote8", poll_id: "sample-poll-1", option_id: "opt1", user_id: "user8", created_at: new Date().toISOString() },
    { id: "vote9", poll_id: "sample-poll-1", option_id: "opt3", user_id: "user9", created_at: new Date().toISOString() },
    { id: "vote10", poll_id: "sample-poll-1", option_id: "opt2", user_id: "user10", created_at: new Date().toISOString() },
  ]
}

const sampleUserVote: Vote = {
  id: "vote1",
  poll_id: "sample-poll-1", 
  option_id: "opt1",
  user_id: "current_user",
  created_at: new Date().toISOString()
}

/**
 * Example Component Usage
 * 
 * Basic usage:
 * <PollResultChart poll={poll} />
 * 
 * With user vote:
 * <PollResultChart poll={poll} userVote={userVote} />
 * 
 * With voting interface disabled:
 * <PollResultChart poll={poll} userVote={userVote} showVotingInterface={false} />
 */
export default function PollResultChartExample() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">PollResultChart Component Examples</h1>
          <p className="text-muted-foreground">
            Showcasing different configurations of the PollResultChart component
          </p>
        </div>

        {/* Example 1: Basic chart with user vote */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Example 1: Chart with User Vote</h2>
          <PollResultChart 
            poll={samplePoll} 
            userVote={sampleUserVote}
          />
        </div>

        {/* Example 2: Chart without user vote */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Example 2: Chart without User Vote</h2>
          <PollResultChart 
            poll={samplePoll}
          />
        </div>

        {/* Example 3: Chart with no votes */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Example 3: Poll with No Votes</h2>
          <PollResultChart 
            poll={{
              ...samplePoll,
              id: "empty-poll",
              title: "Which framework should we use next?",
              description: "This poll has no votes yet",
              votes: []
            }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Component Props Documentation:
 * 
 * @param poll - The poll object containing title, description, options, and votes
 * @param userVote - Optional. The current user's vote to highlight their selection
 * @param showVotingInterface - Optional. Whether to show voting controls (future feature)
 * 
 * Features:
 * - Colorful progress bars with percentages
 * - Sorted options by vote count (highest first)
 * - Statistics summary (total votes, options, etc.)
 * - Winner announcement for the leading option
 * - User vote highlighting
 * - Responsive design for mobile and desktop
 * - Empty state handling for polls with no votes
 * - Expiration status and badges
 * - Color-coded visualization with 8 distinct colors
 */
