import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUT /api/v1/profile/update - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email } = body

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    // Validate and update name if provided
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Name must be at least 2 characters' },
          { status: 400 }
        )
      }
      updateData.data = { ...updateData.data, full_name: name.trim() }
    }

    // Validate and update email if provided
    if (email !== undefined) {
      if (!email || !email.includes('@')) {
        return NextResponse.json(
          { error: 'Valid email is required' },
          { status: 400 }
        )
      }
      updateData.email = email.trim()
    }

    // Update user
    const { data, error } = await supabase.auth.updateUser(updateData)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Return updated profile data
    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name || '',
      email_verified: data.user.email_confirmed_at ? true : false,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at,
      last_sign_in_at: data.user.last_sign_in_at
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// POST method for compatibility
export async function POST(request: NextRequest) {
  return PUT(request)
}
