import { PollResultChart } from "@/components/polls/poll-result-chart"
import { Poll, Vote } from "@/types"

// Mock poll data with votes for testing the chart
const mockPoll: Poll = {
  id: "test-poll-1",
  title: "What's your favorite programming language?",
  description: "Help us understand the community preferences for our next project",
  created_by: "user1",
  created_at: new Date("2025-08-20").toISOString(),
  updated_at: new Date("2025-08-20").toISOString(),
  expires_at: new Date("2025-12-20").toISOString(),
  is_active: true,
  options: [
    { id: "opt1", poll_id: "test-poll-1", text: "JavaScript", order_num: 1, votes: [] },
    { id: "opt2", poll_id: "test-poll-1", text: "Python", order_num: 2, votes: [] },
    { id: "opt3", poll_id: "test-poll-1", text: "TypeScript", order_num: 3, votes: [] },
    { id: "opt4", poll_id: "test-poll-1", text: "Rust", order_num: 4, votes: [] },
    { id: "opt5", poll_id: "test-poll-1", text: "Go", order_num: 5, votes: [] },
  ],
  votes: [
    { id: "vote1", poll_id: "test-poll-1", option_id: "opt1", user_id: "user1", created_at: new Date().toISOString() },
    { id: "vote2", poll_id: "test-poll-1", option_id: "opt2", user_id: "user2", created_at: new Date().toISOString() },
    { id: "vote3", poll_id: "test-poll-1", option_id: "opt1", user_id: "user3", created_at: new Date().toISOString() },
    { id: "vote4", poll_id: "test-poll-1", option_id: "opt3", user_id: "user4", created_at: new Date().toISOString() },
    { id: "vote5", poll_id: "test-poll-1", option_id: "opt1", user_id: "user5", created_at: new Date().toISOString() },
    { id: "vote6", poll_id: "test-poll-1", option_id: "opt2", user_id: "user6", created_at: new Date().toISOString() },
    { id: "vote7", poll_id: "test-poll-1", option_id: "opt4", user_id: "user7", created_at: new Date().toISOString() },
    { id: "vote8", poll_id: "test-poll-1", option_id: "opt1", user_id: "user8", created_at: new Date().toISOString() },
    { id: "vote9", poll_id: "test-poll-1", option_id: "opt3", user_id: "user9", created_at: new Date().toISOString() },
    { id: "vote10", poll_id: "test-poll-1", option_id: "opt2", user_id: "user10", created_at: new Date().toISOString() },
    { id: "vote11", poll_id: "test-poll-1", option_id: "opt1", user_id: "user11", created_at: new Date().toISOString() },
    { id: "vote12", poll_id: "test-poll-1", option_id: "opt4", user_id: "user12", created_at: new Date().toISOString() },
  ]
}

const mockUserVote: Vote = {
  id: "vote1",
  poll_id: "test-poll-1", 
  option_id: "opt1",
  user_id: "current_user",
  created_at: new Date().toISOString()
}

const emptyPoll: Poll = {
  ...mockPoll,
  id: "empty-poll",
  title: "Which framework should we use for the next project?",
  description: "This poll has no votes yet - be the first to vote!",
  votes: []
}

export default function ChartTestPage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">📊 PollResultChart Component Demo</h1>
          <p className="text-muted-foreground text-lg">
            Showcase of the new chart visualization component for ALX Polly
          </p>
        </div>

        {/* Example 1: Chart with user vote and many votes */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-blue-500">1.</span>
            Poll with Multiple Votes & User Selection
          </h2>
          <PollResultChart 
            poll={mockPoll} 
            userVote={mockUserVote}
          />
        </div>

        {/* Example 2: Chart without user vote */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-green-500">2.</span>
            Poll Results (No User Vote)
          </h2>
          <PollResultChart 
            poll={mockPoll}
          />
        </div>

        {/* Example 3: Empty poll */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-yellow-500">3.</span>
            Empty Poll (No Votes Yet)
          </h2>
          <PollResultChart 
            poll={emptyPoll}
          />
        </div>

        {/* Example 4: Expired poll */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-red-500">4.</span>
            Expired Poll
          </h2>
          <PollResultChart 
            poll={{
              ...mockPoll,
              id: "expired-poll",
              title: "What was your favorite feature in 2024?",
              expires_at: new Date("2025-01-01").toISOString()
            }}
            userVote={mockUserVote}
          />
        </div>

        {/* Features highlight */}
        <div className="bg-accent/30 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">✨ Component Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">🎨 Visual Design</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 8 distinct color palette</li>
                <li>• Animated progress bars</li>
                <li>• Responsive layout</li>
                <li>• Consistent with ALX Polly design</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Data Visualization</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Vote counts and percentages</li>
                <li>• Sorted by popularity</li>
                <li>• Winner announcement</li>
                <li>• User vote highlighting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🚀 User Experience</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Empty state handling</li>
                <li>• Status badges</li>
                <li>• Mobile responsive</li>
                <li>• Accessible design</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 Technical</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• TypeScript interfaces</li>
                <li>• Shadcn UI components</li>
                <li>• Tailwind CSS styling</li>
                <li>• Zero configuration</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>
            PollResultChart component successfully implemented for ALX Polly • 
            <span className="text-green-600 font-medium"> ✅ Production Ready</span>
          </p>
        </div>
      </div>
    </div>
  )
}
