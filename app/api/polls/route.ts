import { NextRequest, NextResponse } from 'next/server'

// Mock data - in production, this would come from a database
let polls = [
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

// GET /api/polls - Get all polls
export async function GET() {
  try {
    await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
    return NextResponse.json(polls)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    )
  }
}

// POST /api/polls - Create new poll
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, options, expiresAt } = body

    // Validation
    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Title and at least 2 options are required' },
        { status: 400 }
      )
    }

    const newPoll = {
      id: `poll_${Date.now()}`,
      title,
      description: description || '',
      createdBy: "current_user", // TODO: Get from auth
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
      isActive: true,
      options: options.map((text: string, index: number) => ({
        id: `opt_${Date.now()}_${index}`,
        pollId: `poll_${Date.now()}`,
        text,
        order: index + 1,
        votes: []
      })),
      votes: []
    }

    polls.push(newPoll)

    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
    return NextResponse.json(newPoll, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    )
  }
}
