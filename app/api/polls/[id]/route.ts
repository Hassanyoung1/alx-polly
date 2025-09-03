import { NextRequest, NextResponse } from 'next/server'
import { getPoll, updatePoll, deletePoll, togglePollStatus } from '../../../../lib/polls'

// Legacy API endpoint for backward compatibility
// GET /api/polls/[id] - Get specific poll
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Validate UUID format - if not UUID, return 400
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid poll ID format. Poll ID must be a valid UUID.' },
        { status: 400 }
      )
    }
    
    const poll = await getPoll(id)
    
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    )
  }
}

// PUT /api/polls/[id] - Update poll
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.options || !Array.isArray(body.options) || body.options.length < 2) {
      return NextResponse.json(
        { error: 'Invalid poll data. Title and at least 2 options are required.' },
        { status: 400 }
      )
    }
    
    const poll = await updatePoll(id, body)
    
    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error updating poll:', error)
    return NextResponse.json(
      { error: 'Failed to update poll' },
      { status: 500 }
    )
  }
}

// DELETE /api/polls/[id] - Delete poll
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

// PATCH /api/polls/[id] - Toggle poll status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { is_active } = await request.json()
    
    // Validate is_active field
    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active field must be a boolean' },
        { status: 400 }
      )
    }
    
    const poll = await togglePollStatus(id, is_active)
    
    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error toggling poll status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle poll status' },
      { status: 500 }
    )
  }
}
