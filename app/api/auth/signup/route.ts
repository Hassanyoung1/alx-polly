import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/auth/signup - Sign up new user (using Supabase)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Return user data
    return NextResponse.json({
      user: data.user,
      session: data.session
    }, { status: 201 })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
