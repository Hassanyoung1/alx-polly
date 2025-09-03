import { NextRequest, NextResponse } from 'next/server'
import { createPoll } from '@/lib/polls'
import { createPollSchema } from '@/lib/schemas'

// POST /api/v1/poll/create - Create new poll (v1 RESTful endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body with Zod schema
    const validatedData = createPollSchema.parse(body)
    
    // Convert expiration date if provided
    let expiresAt = validatedData.expiresAt
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
    } else {
      expiresAt = undefined
    }

    // Create poll in database
    const poll = await createPoll({
      ...validatedData,
      expiresAt
    })

    // Return RESTful response format
    return NextResponse.json({
      success: true,
      message: 'Poll created successfully',
      data: poll
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating poll:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    )
  }
}
