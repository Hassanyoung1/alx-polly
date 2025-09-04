// Security patch: Secure polls endpoints
// Fixes: V-001, V-005 - Authorization and rate limiting

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/security-utils'
import { getPolls, createPoll } from '@/lib/polls'

// GET /api/v1/polls - List all polls (public endpoint with rate limiting)
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(request, 'api:general')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    // For now, getPolls doesn't support filtering, so we get all polls
    const allPolls = await getPolls()
    
    // Filter inactive polls if needed
    const polls = includeInactive ? allPolls : allPolls.filter(poll => poll.is_active !== false)
    
    return NextResponse.json({
      success: true,
      data: polls
    })
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    )
  }
}

// POST /api/v1/polls - Create new poll (requires authentication)
export const POST = withAuth(
  async (request: NextRequest, authContext) => {
    // Apply rate limiting for poll creation
    const rateLimitResponse = await withRateLimit(request, 'poll:create')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    try {
      const body = await request.json()
      const { title, description, options, expiresAt } = body

      // Enhanced validation
      if (!title?.trim()) {
        return NextResponse.json(
          { error: 'Poll title is required' },
          { status: 400 }
        )
      }

      if (title.length > 200) {
        return NextResponse.json(
          { error: 'Poll title must be 200 characters or less' },
          { status: 400 }
        )
      }

      if (!options || !Array.isArray(options) || options.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 poll options are required' },
          { status: 400 }
        )
      }

      if (options.length > 10) {
        return NextResponse.json(
          { error: 'Maximum 10 poll options allowed' },
          { status: 400 }
        )
      }

      // Validate options content
      for (const option of options) {
        if (!option?.trim()) {
          return NextResponse.json(
            { error: 'All poll options must have text' },
            { status: 400 }
          )
        }
        if (option.length > 100) {
          return NextResponse.json(
            { error: 'Poll options must be 100 characters or less' },
            { status: 400 }
          )
        }
      }

      // Validate expiry date if provided
      if (expiresAt) {
        const expiryDate = new Date(expiresAt)
        if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
          return NextResponse.json(
            { error: 'Expiry date must be in the future' },
            { status: 400 }
          )
        }
      }

      const newPoll = await createPoll({
        title: title.trim(),
        description: description?.trim(),
        options: options.map((opt: string) => opt.trim()),
        expiresAt,
        createdBy: authContext.user.id
      })

      console.log('[Security] Poll created:', {
        pollId: newPoll.id,
        userId: authContext.user.id,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: 'Poll created successfully',
        data: newPoll
      }, { status: 201 })
    } catch (error) {
      console.error('[Security] Poll creation failed:', error)
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }
  }
)
