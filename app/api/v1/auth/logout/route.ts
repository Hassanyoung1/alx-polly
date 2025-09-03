import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/v1/auth/logout - Logout user (RESTful endpoint)
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Sign out with Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    }, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
