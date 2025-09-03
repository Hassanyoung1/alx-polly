import { NextRequest, NextResponse } from 'next/server'
import { vote, getUserVote } from '@/lib/polls'

// POST /api/v1/poll/[id]/vote - Vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params
    const body = await request.json()
    const { optionId, userId } = body

    // Validation
    if (!optionId) {
      return NextResponse.json(
        { error: 'Option ID is required' },
        { status: 400 }
      )
    }

    // Create new vote in database
    const newVote = await vote(pollId, optionId, userId || null)

    return NextResponse.json(newVote, { status: 201 })
  } catch (error) {
    console.error('Error creating vote:', error)
    
    // Handle specific voting errors
    if (error instanceof Error) {
      if (error.message.includes('already voted')) {
        return NextResponse.json(
          { error: 'User has already voted on this poll' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Poll or option not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}

// GET /api/v1/poll/[id]/vote?userId=xxx - Get user's vote for a poll
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

    const userVote = await getUserVote(pollId, userId)

    return NextResponse.json(userVote || null)
  } catch (error) {
    console.error('Error fetching user vote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user vote' },
      { status: 500 }
    )
  }
}
