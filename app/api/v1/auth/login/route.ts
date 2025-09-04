// Security patch: Secure authentication endpoint
// Fixes: V-005 - Rate limiting on auth endpoints

import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/security-utils'
import { supabase } from '@/lib/supabase'

// POST /api/v1/auth/login - Login user (RESTful endpoint with security)
export async function POST(request: NextRequest) {
  // Apply strict rate limiting for authentication
  const rateLimitResponse = await withRateLimit(request, 'auth:login')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    const { email, password } = body

    // Enhanced validation
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Log security event
    console.log('[Security] Login attempt:', {
      email: email.trim(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      timestamp: new Date().toISOString()
    })

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      console.warn('[Security] Login failed:', {
        email: email.trim(),
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json(
        { error: 'Invalid email or password' }, // Generic error message
        { status: 401 }
      )
    }

    console.log('[Security] Login successful:', {
      userId: data.user?.id,
      email: email.trim(),
      timestamp: new Date().toISOString()
    })

    // Return user data with proper RESTful response
    return NextResponse.json({
          success: true,
      message: 'Login successful',
      data: {
        user: data.user,
        session: data.session
      }
    }, { status: 200 })
  } catch (error) {
    console.error('[Security] Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
