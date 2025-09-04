// Security patch: Secure voting endpoint with race condition protection
// Fixes: V-005, V-006 - Rate limiting and race conditions

import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, atomicVoteOperation } from '@/lib/security-utils'
import { supabase } from '@/lib/supabase'
import { vote, getUserVote } from '@/lib/polls'

// POST /api/v1/polls/[id]/vote - Submit vote (with security enhancements)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting first
  const rateLimitResponse = await withRateLimit(request, 'poll:vote')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { id: pollId } = await params
    const body = await request.json()
    const { optionId } = body

    // Validate input
    if (!optionId?.trim()) {
      return NextResponse.json(
        { error: 'Option ID is required' },
        { status: 400 }
      )
    }

    // Get user ID from auth header (optional for anonymous voting)
    let userId: string | null = null
    const authHeader = request.headers.get('authorization')
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const { data: { user }, error } = await supabase.auth.getUser(token)
        if (!error && user) {
          userId = user.id
        }
      } catch (error) {
        console.warn('[Security] Invalid auth token in vote request')
      }
    }

    // Use atomic vote operation to prevent race conditions
    const vote = await atomicVoteOperation(pollId, optionId, userId, supabase)
    
    console.log('[Security] Vote submitted:', {
      pollId,
      optionId,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Vote submitted successfully',
      data: vote
    }, { status: 201 })
    
  } catch (error) {
        if (error instanceof Error && error.message.includes('already voted')) {
      return NextResponse.json(
        { error: 'You have already voted on this poll' },
        { status: 409 }
      )
    }
    
    console.error('[Security] Vote submission failed:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}

// GET /api/v1/polls/[id]/vote - Get user's vote (secure endpoint)
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
    const { id: pollId } = await params
    
    // Get user ID from auth header
    let userId: string | null = null
    const authHeader = request.headers.get('authorization')
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const { data: { user }, error } = await supabase.auth.getUser(token)
        if (!error && user) {
          userId = user.id
        }
      } catch (error) {
        console.warn('[Security] Invalid auth token in vote check request')
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required to check vote status' },
        { status: 401 }
      )
    }

    const userVote = await getUserVote(pollId, userId)

    return NextResponse.json({
      success: true,
      data: userVote
    })
  } catch (error) {
    console.error('[Security] Error fetching user vote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user vote' },
      { status: 500 }
    )
  }
}
