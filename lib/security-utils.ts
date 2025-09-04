// Security patch: Rate limiting and vote integrity
// Fixes: V-005, V-006 - Rate limiting and race conditions

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRule {
  windowMs: number
  maxRequests: number
  blockDurationMs?: number
}

interface RateLimitEntry {
  count: number
  windowStart: number
  blockUntil?: number
}

class RateLimiter {
  private static instance: RateLimiter
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  private constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.windowStart + 60 * 60 * 1000 < now) { // Clean entries older than 1 hour
        this.store.delete(key)
      }
    }
  }

  private getKey(identifier: string, endpoint: string): string {
    return `${identifier}:${endpoint}`
  }

  async checkLimit(
    identifier: string, 
    endpoint: string, 
    rule: RateLimitRule
  ): Promise<{ allowed: boolean; remainingRequests: number; resetTime: number }> {
    const key = this.getKey(identifier, endpoint)
    const now = Date.now()
    const entry = this.store.get(key)

    // Check if currently blocked
    if (entry?.blockUntil && entry.blockUntil > now) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.blockUntil
      }
    }

    // Reset window if expired
    if (!entry || now - entry.windowStart >= rule.windowMs) {
      this.store.set(key, {
        count: 1,
        windowStart: now
      })
      return {
        allowed: true,
        remainingRequests: rule.maxRequests - 1,
        resetTime: now + rule.windowMs
      }
    }

    // Check if limit exceeded
    if (entry.count >= rule.maxRequests) {
      // Block for additional time if configured
      if (rule.blockDurationMs) {
        entry.blockUntil = now + rule.blockDurationMs
        this.store.set(key, entry)
      }
      
      console.warn('[Security] Rate limit exceeded:', {
        identifier,
        endpoint,
        count: entry.count,
        limit: rule.maxRequests,
        timestamp: new Date().toISOString()
      })

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.windowStart + rule.windowMs
      }
    }

    // Increment count
    entry.count++
    this.store.set(key, entry)

    return {
      allowed: true,
      remainingRequests: rule.maxRequests - entry.count,
      resetTime: entry.windowStart + rule.windowMs
    }
  }
}

// Rate limiting rules for different endpoints
const RATE_LIMITS: Record<string, RateLimitRule> = {
  'auth:login': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    blockDurationMs: 15 * 60 * 1000 // Block for 15 minutes after limit
  },
  'auth:register': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    blockDurationMs: 60 * 60 * 1000 // Block for 1 hour after limit
  },
  'poll:vote': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10 // Max 10 votes per minute per user
  },
  'poll:create': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20 // Max 20 polls per hour
  },
  'api:general': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // General API rate limit
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    try {
      const token = authHeader.substring(7) // Remove 'Bearer '
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.sub) {
        return `user:${payload.sub}`
      }
    } catch {
      // Fall back to IP if token parsing fails
    }
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`
  }
  
  if (realIP) {
    return `ip:${realIP}`
  }
  
  return 'ip:unknown'
}

export async function withRateLimit(
  request: NextRequest,
  endpoint: string,
  customRule?: RateLimitRule
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(request)
  const rule = customRule || RATE_LIMITS[endpoint] || RATE_LIMITS['api:general']
  
  const rateLimiter = RateLimiter.getInstance()
  const result = await rateLimiter.checkLimit(identifier, endpoint, rule)
  
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
    
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: retryAfter
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': rule.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString()
        }
      }
    )
  }

  // Add rate limit headers to successful responses
  request.headers.set('X-RateLimit-Limit', rule.maxRequests.toString())
  request.headers.set('X-RateLimit-Remaining', result.remainingRequests.toString())
  request.headers.set('X-RateLimit-Reset', result.resetTime.toString())

  return null // No rate limit violation
}

// Atomic vote operation to prevent race conditions and duplicate votes
export async function atomicVoteOperation(
  pollId: string,
  optionId: string,
  userId: string | null,
  supabase: any
): Promise<any> {
  // Generate session ID for anonymous votes
  const sessionId = userId ? null : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Use enhanced database function for atomic vote submission
    const { data, error } = await supabase.rpc('atomic_vote_submission', {
      p_poll_id: pollId,
      p_option_id: optionId,
      p_user_id: userId,
      p_session_id: sessionId
    })
    
    if (error) {
      console.error('[Security] Database vote submission error:', error)
      throw new Error('Failed to submit vote')
    }
    
    // Parse the JSON response from the database function
    const result = typeof data === 'string' ? JSON.parse(data) : data
    
    if (!result.success) {
      if (result.error.includes('already voted')) {
        throw new Error('You have already voted on this poll')
      }
      throw new Error(result.error)
    }
    
    return result.data
  } catch (error) {
    console.error('[Security] Atomic vote operation failed:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to submit vote')
  }
}
