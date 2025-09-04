// Security patch: Secure poll endpoints with authorization
// Fixes: V-001, V-002 - Missing authorization controls and IDOR

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/security-utils'
import { getPoll, updatePoll, deletePoll, togglePollStatus } from '@/lib/polls'

// GET /api/v1/polls/[id] - Get specific poll (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(request, 'api:general')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

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

// PUT /api/v1/polls/[id] - Update poll (requires ownership)
export const PUT = withAuth(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    
    try {
      const body = await request.json()
      
      // Validate input
      if (!body.title?.trim()) {
        return NextResponse.json(
          { error: 'Poll title is required' },
          { status: 400 }
        )
      }
      
      const updatedPoll = await updatePoll(id, body)
      
      return NextResponse.json({
        success: true,
        message: 'Poll updated successfully',
        data: updatedPoll
      })
    } catch (error) {
      console.error('[Security] Poll update failed:', error)
      return NextResponse.json(
        { error: 'Failed to update poll' },
        { status: 500 }
      )
    }
  },
  { 
    requireOwnership: { type: 'poll', idParam: 'id' }
  }
)

// DELETE /api/v1/polls/[id] - Delete poll (requires ownership)
export const DELETE = withAuth(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    
    try {
      await deletePoll(id)
      
      return NextResponse.json({
        success: true,
        message: 'Poll deleted successfully'
      })
    } catch (error) {
      console.error('[Security] Poll deletion failed:', error)
      return NextResponse.json(
        { error: 'Failed to delete poll' },
        { status: 500 }
      )
    }
  },
  { 
    requireOwnership: { type: 'poll', idParam: 'id' }
  }
)

// PATCH /api/v1/polls/[id] - Toggle poll status (requires ownership)
export const PATCH = withAuth(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    
    try {
      const body = await request.json()
      const { isActive } = body
      
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'isActive must be a boolean value' },
          { status: 400 }
        )
      }
      
      const updatedPoll = await togglePollStatus(id, isActive)
      
      return NextResponse.json({
        success: true,
        message: 'Poll status updated successfully',
        data: updatedPoll
      })
    } catch (error) {
      console.error('[Security] Poll status update failed:', error)
      return NextResponse.json(
        { error: 'Failed to update poll status' },
        { status: 500 }
      )
    }
  },
  { 
    requireOwnership: { type: 'poll', idParam: 'id' }
  }
)
