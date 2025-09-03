import { NextRequest, NextResponse } from 'next/server'
import { updatePoll } from '@/lib/polls'

// PUT /api/poll/update - Update poll
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract poll ID from request body
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      )
    }
    
    // Validate required fields
    if (!updateData.title || !updateData.options || !Array.isArray(updateData.options) || updateData.options.length < 2) {
      return NextResponse.json(
        { error: 'Invalid poll data. Title and at least 2 options are required.' },
        { status: 400 }
      )
    }
    
    // Convert expiration date if provided
    let expiresAt = updateData.expiresAt
    if (expiresAt && expiresAt.trim() !== '') {
      try {
        const localDate = new Date(expiresAt)
        if (!isNaN(localDate.getTime())) {
          expiresAt = localDate.toISOString()
        } else {
          return NextResponse.json(
            { error: 'Invalid date format' },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        )
      }
    }
    
    const poll = await updatePoll(id, {
      ...updateData,
      expiresAt
    })
    
    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error updating poll:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Poll not found' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid poll data provided' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update poll' },
      { status: 500 }
    )
  }
}
