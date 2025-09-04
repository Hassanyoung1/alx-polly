// CSRF token endpoint
import { NextRequest, NextResponse } from 'next/server'
import { SecurityMiddleware } from '@/lib/security-middleware'

export async function GET(request: NextRequest) {
  try {
    const token = SecurityMiddleware.generateCsrfToken()
    
    return NextResponse.json(
      { token },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-CSRF-Token': token
        }
      }
    )
  } catch (error) {
    console.error('CSRF token generation failed:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
