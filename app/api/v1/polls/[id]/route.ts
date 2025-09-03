import { NextRequest, NextResponse } from 'next/server'
import { getPoll, updatePoll, deletePoll, togglePollStatus } from '@/lib/polls'

// GET /api/v1/polls/[id] - Get specific poll
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const poll = await getPoll(id)
    
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: poll
    })
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    )
  }
}

// PUT /api/v1/polls/[id] - Update poll
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updatedPoll = await updatePoll(id, body)
    
    return NextResponse.json({
      success: true,
      message: 'Poll updated successfully',
      data: updatedPoll
    })
  } catch (error) {
    console.error('Error updating poll:', error)
    return NextResponse.json(
      { error: 'Failed to update poll' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/polls/[id] - Delete poll
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deletePoll(id)
    
    return NextResponse.json({
      success: true,
      message: 'Poll deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting poll:', error)
    return NextResponse.json(
      { error: 'Failed to delete poll' },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/polls/[id] - Toggle poll status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isActive } = body
    
    const updatedPoll = await togglePollStatus(id, isActive)
    
    return NextResponse.json({
      success: true,
      message: 'Poll status updated successfully',
      data: updatedPoll
    })
  } catch (error) {
    console.error('Error updating poll status:', error)
    return NextResponse.json(
      { error: 'Failed to update poll status' },
      { status: 500 }
    )
  }
}
