import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/v1/auth/signout - Sign out user
export async function POST(request: NextRequest) {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Signed out successfully'
    })
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: 'Sign out failed' },
      { status: 500 }
    )
  }
}

// Alternative GET method for compatibility
export async function GET() {
  return POST({} as NextRequest)
}
