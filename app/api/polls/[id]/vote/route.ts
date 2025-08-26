import { NextRequest, NextResponse } from 'next/server'

// Mock data for votes - in production, this would be in a database
let votes: any[] = [
  { id: "vote1", pollId: "1", optionId: "opt1", userId: "user1", createdAt: new Date().toISOString() },
  { id: "vote2", pollId: "1", optionId: "opt2", userId: "user2", createdAt: new Date().toISOString() },
  { id: "vote3", pollId: "1", optionId: "opt1", userId: "user3", createdAt: new Date().toISOString() },
]

// POST /api/polls/[id]/vote - Vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params
    const body = await request.json()
    const { optionId, userId } = body

    // Validation
    if (!optionId || !userId) {
      return NextResponse.json(
        { error: 'Option ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if user already voted on this poll
    const existingVote = votes.find(vote => 
      vote.pollId === pollId && vote.userId === userId
    )

    if (existingVote) {
      return NextResponse.json(
        { error: 'User has already voted on this poll' },
        { status: 400 }
      )
    }

    // Create new vote
    const newVote = {
      id: `vote_${Date.now()}`,
      pollId,
      optionId,
      userId,
      createdAt: new Date().toISOString()
    }

    votes.push(newVote)

    await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
    return NextResponse.json(newVote, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}

// GET /api/polls/[id]/vote?userId=xxx - Get user's vote for a poll
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userVote = votes.find(vote => 
      vote.pollId === pollId && vote.userId === userId
    )

    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate API delay
    return NextResponse.json(userVote || null)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user vote' },
      { status: 500 }
    )
  }
}
