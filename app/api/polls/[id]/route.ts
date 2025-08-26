import { NextRequest, NextResponse } from 'next/server'

// Mock data - same as in main polls route
// In production, this would be shared from a database
const polls = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Help us understand the community preferences",
    createdBy: "user1",
    createdAt: new Date("2025-08-20").toISOString(),
    updatedAt: new Date("2025-08-20").toISOString(),
    expiresAt: new Date("2025-09-20").toISOString(),
    isActive: true,
    options: [
      { id: "opt1", pollId: "1", text: "JavaScript", order: 1, votes: [] },
      { id: "opt2", pollId: "1", text: "Python", order: 2, votes: [] },
      { id: "opt3", pollId: "1", text: "TypeScript", order: 3, votes: [] },
      { id: "opt4", pollId: "1", text: "Rust", order: 4, votes: [] },
    ],
    votes: [
      { id: "vote1", pollId: "1", optionId: "opt1", userId: "user1", createdAt: new Date().toISOString() },
      { id: "vote2", pollId: "1", optionId: "opt2", userId: "user2", createdAt: new Date().toISOString() },
      { id: "vote3", pollId: "1", optionId: "opt1", userId: "user3", createdAt: new Date().toISOString() },
    ]
  },
  {
    id: "2", 
    title: "Best time for team meetings?",
    createdBy: "user2",
    createdAt: new Date("2025-08-25").toISOString(),
    updatedAt: new Date("2025-08-25").toISOString(),
    isActive: true,
    options: [
      { id: "opt5", pollId: "2", text: "9:00 AM", order: 1, votes: [] },
      { id: "opt6", pollId: "2", text: "2:00 PM", order: 2, votes: [] },
      { id: "opt7", pollId: "2", text: "4:00 PM", order: 3, votes: [] },
    ],
    votes: []
  }
]

// GET /api/polls/[id] - Get specific poll
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await new Promise(resolve => setTimeout(resolve, 200)) // Simulate API delay
    
    const poll = polls.find(p => p.id === id)
    
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(poll)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    )
  }
}
