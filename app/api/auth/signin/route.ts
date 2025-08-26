import { NextRequest, NextResponse } from 'next/server'

// Mock user storage - in production, this would be a database
let users: any[] = []

// POST /api/auth/signin - Sign in user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Mock authentication - in production, verify against database
    const user = {
      id: "user_123",
      email,
      name: email.split("@")[0] // Use part of email as name for demo
    }

    await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
