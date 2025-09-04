// Security patch: Secure poll API endpoints
// Fixes: V-001, V-002, V-003, V-006 - Authorization, IDOR, vote manipulation, race conditions

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { withRateLimit, atomicVoteOperation } from '@/lib/security-utils'
import { supabase } from '@/lib/supabase'

// Secure poll update endpoint
export const PUT = withAuth(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    const { id: pollId } = await params
    
    try {
      const body = await request.json()
      const { title, description, options, expiresAt } = body
      
      // Validate input
      if (!title?.trim()) {
        return NextResponse.json(
          { error: 'Poll title is required' },
          { status: 400 }
        )
      }
      
      if (!options || !Array.isArray(options) || options.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 poll options are required' },
          { status: 400 }
        )
      }
      
      // Update poll with ownership verification (handled by withAuth middleware)
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .update({
          title: title.trim(),
          description: description?.trim() || null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', pollId)
        .eq('created_by', authContext.user.id) // Double-check ownership
        .select()
        .single()
      
      if (pollError) throw pollError
      
      // Update options (delete old ones and insert new ones)
      await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', pollId)
      
      const optionsData = options.map((text: string, index: number) => ({
        poll_id: pollId,
        text: text.trim(),
        order_num: index + 1
      }))
      
      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData)
      
      if (optionsError) throw optionsError
      
      console.log('[Security] Poll updated:', {
        pollId,
        userId: authContext.user.id,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({
        success: true,
        message: 'Poll updated successfully',
        data: poll
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

// Secure poll deletion endpoint
export const DELETE = withAuth(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    const { id: pollId } = await params
    
    try {
      // Delete in correct order to handle foreign key constraints
      await supabase
        .from('votes')
        .delete()
        .eq('poll_id', pollId)
      
      await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', pollId)
      
      const { error: pollError } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId)
        .eq('created_by', authContext.user.id) // Double-check ownership
      
      if (pollError) throw pollError
      
      console.log('[Security] Poll deleted:', {
        pollId,
        userId: authContext.user.id,
        timestamp: new Date().toISOString()
      })
      
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

// Secure voting endpoint with rate limiting and race condition protection
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
    
    // Verify poll exists and is active
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, is_active, expires_at')
      .eq('id', pollId)
      .single()
    
    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }
    
    if (!poll.is_active) {
      return NextResponse.json(
        { error: 'Poll is not active' },
        { status: 400 }
      )
    }
    
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Poll has expired' },
        { status: 400 }
      )
    }
    
    // Verify option exists for this poll
    const { data: option, error: optionError } = await supabase
      .from('poll_options')
      .select('id')
      .eq('id', optionId)
      .eq('poll_id', pollId)
      .single()
    
    if (optionError || !option) {
      return NextResponse.json(
        { error: 'Invalid option for this poll' },
        { status: 400 }
      )
    }
    
    // Submit vote atomically
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
