import { NextRequest, NextResponse } from 'next/server'
import { getPoll } from '@/lib/polls'

// GET /api/poll/get - Get specific poll
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
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

// Alternative POST method for consistency with other endpoints
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
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
