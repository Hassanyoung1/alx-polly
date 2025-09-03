import { NextRequest, NextResponse } from 'next/server'
import { getPolls, createPoll } from '../../../lib/polls'

// Legacy API endpoint for backward compatibility
// GET /api/polls - Get all polls
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    const allPolls = await getPolls()
    
    // Filter inactive polls if needed
    const polls = includeInactive ? allPolls : allPolls.filter(poll => poll.is_active !== false)
    
    return NextResponse.json(polls)
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    )
  }
}

// POST /api/polls - Create new poll
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, options, expiresAt } = body

    // Validation
    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Title and at least 2 options are required' },
        { status: 400 }
      )
    }

    const newPoll = await createPoll({
      title,
      description,
      options,
      expiresAt
    })

    return NextResponse.json(newPoll, { status: 201 })
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    )
  }
}
