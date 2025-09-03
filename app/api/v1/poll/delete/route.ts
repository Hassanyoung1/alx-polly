import { NextRequest, NextResponse } from 'next/server'
import { deletePoll } from '@/lib/polls'

// DELETE /api/poll/delete - Delete poll
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract poll ID from request body
    const { id } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      )
    }
    
    const success = await deletePoll(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete poll' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Poll deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting poll:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Poll not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to delete poll' },
      { status: 500 }
    )
  }
}

// Alternative POST method for frameworks that don't support DELETE with body
export async function POST(request: NextRequest) {
  return DELETE(request)
}
