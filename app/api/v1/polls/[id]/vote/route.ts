import { NextRequest, NextResponse } from 'next/server'
import { vote, getUserVote } from '@/lib/polls'

// POST /api/v1/polls/[id]/vote - Submit vote
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

    const newVote = await vote(pollId, optionId, userId || null)

    return NextResponse.json({
      success: true,
      message: 'Vote submitted successfully',
      data: newVote
    }, { status: 201 })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}

// GET /api/v1/polls/[id]/vote?userId=xxx - Get user's vote
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

    return NextResponse.json({
      success: true,
      data: userVote
    })
  } catch (error) {
    console.error('Error fetching user vote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user vote' },
      { status: 500 }
    )
  }
}
