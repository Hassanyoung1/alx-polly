// Security middleware for API endpoints
// Provides: Rate limiting, CSRF protection, token validation, and request logging

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface RateLimitData {
  count: number
  resetTime: number
}

interface SecurityConfig {
  rateLimitWindowMs: number
  maxRequestsPerWindow: number
  csrfTokenHeader: string
  requireCsrfForMethods: string[]
}

class SecurityMiddleware {
  private static rateLimitStore = new Map<string, RateLimitData>()
  private static csrfTokens = new Set<string>()
  
  private static readonly config: SecurityConfig = {
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    maxRequestsPerWindow: 100,
    csrfTokenHeader: 'x-csrf-token',
    requireCsrfForMethods: ['POST', 'PUT', 'DELETE', 'PATCH']
  }

  // Generate CSRF token
  static generateCsrfToken(): string {
    const token = crypto.randomUUID()
    this.csrfTokens.add(token)
    
    // Clean up old tokens after 1 hour
    setTimeout(() => {
      this.csrfTokens.delete(token)
    }, 3600000)
    
    return token
  }

  // Validate CSRF token
  static validateCsrfToken(token: string): boolean {
    const isValid = this.csrfTokens.has(token)
    if (isValid) {
      // One-time use token
      this.csrfTokens.delete(token)
    }
    return isValid
  }

  // Rate limiting by IP
  static checkRateLimit(ip: string): { allowed: boolean; remainingRequests: number } {
    const now = Date.now()
    const key = `rate_limit_${ip}`
    const current = this.rateLimitStore.get(key)

    // Reset if window has passed
    if (!current || now > current.resetTime) {
      const newData: RateLimitData = {
        count: 1,
        resetTime: now + this.config.rateLimitWindowMs
      }
      this.rateLimitStore.set(key, newData)
      return {
        allowed: true,
        remainingRequests: this.config.maxRequestsPerWindow - 1
      }
    }

    // Check if limit exceeded
    if (current.count >= this.config.maxRequestsPerWindow) {
      return {
        allowed: false,
        remainingRequests: 0
      }
    }

    // Increment count
    current.count++
    this.rateLimitStore.set(key, current)

    return {
      allowed: true,
      remainingRequests: this.config.maxRequestsPerWindow - current.count
    }
  }

  // Enhanced token validation
  static validateToken(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
      if (!token) {
        return { valid: false, error: 'Token missing' }
      }

      // Remove Bearer prefix if present
      const cleanToken = token.replace('Bearer ', '')

      // Basic JWT format validation
      const parts = cleanToken.split('.')
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' }
      }

      // Decode and validate payload
      const payload = JSON.parse(atob(parts[1]))
      const now = Math.floor(Date.now() / 1000)

      if (!payload.exp) {
        return { valid: false, error: 'Token missing expiration' }
      }

      if (payload.exp < now) {
        return { valid: false, error: 'Token expired' }
      }

      if (!payload.sub) {
        return { valid: false, error: 'Token missing user ID' }
      }

      return { valid: true, payload }
    } catch (error) {
      return { valid: false, error: 'Token decode failed' }
    }
  }

  // Get client IP address
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return request.ip || 'unknown'
  }

  // Log security events
  static logSecurityEvent(event: string, details: any, ip: string): void {
    const timestamp = new Date().toISOString()
    console.log(`[SECURITY] ${timestamp} - ${event}`, {
      ip,
      ...details
    })
    
    // In production, send to security monitoring service
    // Example: sendToSecurityMonitoring({ timestamp, event, details, ip })
  }

  // Main security check function
  static async validateRequest(request: NextRequest): Promise<{
    success: boolean
    response?: NextResponse
    csrfToken?: string
  }> {
    const ip = this.getClientIP(request)
    const method = request.method
    const pathname = request.nextUrl.pathname

    // Rate limiting check
    const rateLimitResult = this.checkRateLimit(ip)
    if (!rateLimitResult.allowed) {
      this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        method,
        pathname,
        remainingRequests: rateLimitResult.remainingRequests
      }, ip)

      return {
        success: false,
        response: NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { 
            status: 429,
            headers: {
              'Retry-After': '900', // 15 minutes
              'X-RateLimit-Remaining': '0'
            }
          }
        )
      }
    }

    // CSRF protection for state-changing requests
    if (this.config.requireCsrfForMethods.includes(method)) {
      const csrfToken = request.headers.get(this.config.csrfTokenHeader)
      
      if (!csrfToken || !this.validateCsrfToken(csrfToken)) {
        this.logSecurityEvent('CSRF_VALIDATION_FAILED', {
          method,
          pathname,
          hasToken: !!csrfToken
        }, ip)

        return {
          success: false,
          response: NextResponse.json(
            { error: 'Invalid or missing CSRF token' },
            { status: 403 }
          )
        }
      }
    }

    // Token validation for protected endpoints
    if (pathname.startsWith('/api/') && !pathname.includes('/auth/login') && !pathname.includes('/auth/register')) {
      const authHeader = request.headers.get('Authorization')
      
      if (authHeader) {
        const tokenValidation = this.validateToken(authHeader)
        
        if (!tokenValidation.valid) {
          this.logSecurityEvent('TOKEN_VALIDATION_FAILED', {
            method,
            pathname,
            error: tokenValidation.error
          }, ip)

          return {
            success: false,
            response: NextResponse.json(
              { error: 'Invalid or expired token' },
              { status: 401 }
            )
          }
        }
      }
    }

    // Generate new CSRF token for responses
    const newCsrfToken = this.generateCsrfToken()

    this.logSecurityEvent('REQUEST_VALIDATED', {
      method,
      pathname,
      remainingRequests: rateLimitResult.remainingRequests
    }, ip)

    return {
      success: true,
      csrfToken: newCsrfToken
    }
  }

  // Add security headers to response
  static addSecurityHeaders(response: NextResponse, csrfToken?: string): NextResponse {
    // Basic security headers (CSP is now handled in next.config.ts)
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Only set CSP for API routes to avoid conflicts with Next.js headers
    if (response.url?.includes('/api/')) {
      response.headers.set(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ')
      )
    }

    // CSRF token
    if (csrfToken) {
      response.headers.set('X-CSRF-Token', csrfToken)
    }

    return response
  }
}

export { SecurityMiddleware }
