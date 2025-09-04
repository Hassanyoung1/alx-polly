// Security patch: Secure registration endpoint
// Fixes: V-005 - Rate limiting on auth endpoints

import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/security-utils'
import { supabase } from '@/lib/supabase'

// POST /api/v1/auth/register - Register new user (RESTful endpoint with security)
export async function POST(request: NextRequest) {
  // Apply strict rate limiting for registration
  const rateLimitResponse = await withRateLimit(request, 'auth:register')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    const { email, password, name } = body

    // Enhanced validation
    if (!email?.trim() || !password?.trim() || !name?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Strong password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, and numbers' },
        { status: 400 }
      )
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    // Log security event
    console.log('[Security] Registration attempt:', {
      email: email.trim(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      timestamp: new Date().toISOString()
    })

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

    // Return user data with proper RESTful response
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: data.user,
        session: data.session
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
