// Security patch: Ownership-based authorization middleware
// Fixes: V-001, V-002 - Missing authorization controls and IDOR

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export interface AuthenticatedUser {
  id: string
  email: string
  role?: string
}

export interface AuthContext {
  user: AuthenticatedUser
  token: string
}

/**
 * Extract and validate JWT token from request
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthContext | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    // Validate token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.warn('[Security] Invalid token attempted:', { 
        ip: getClientIP(request),
        timestamp: new Date().toISOString(),
        error: error?.message 
      })
      return null
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
        role: user.user_metadata?.role || 'user'
      },
      token
    }
  } catch (error) {
    console.error('[Security] Token validation error:', error)
    return null
  }
}

/**
 * Verify user owns the specified resource
 */
export async function verifyResourceOwnership(
  resourceType: 'poll' | 'vote',
  resourceId: string,
  userId: string
): Promise<boolean> {
  try {
    switch (resourceType) {
      case 'poll': {
        const { data, error } = await supabase
          .from('polls')
          .select('created_by')
          .eq('id', resourceId)
          .single()
        
        if (error || !data) return false
        return data.created_by === userId
      }
      
      case 'vote': {
        const { data, error } = await supabase
          .from('votes')
          .select('user_id')
          .eq('id', resourceId)
          .single()
        
        if (error || !data) return false
        return data.user_id === userId
      }
      
      default:
        return false
    }
  } catch (error) {
    console.error('[Security] Ownership verification error:', error)
    return false
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthenticatedUser, requiredRole: string): boolean {
  const roleHierarchy = ['user', 'moderator', 'admin']
  const userRoleIndex = roleHierarchy.indexOf(user.role || 'user')
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole)
  
  return userRoleIndex >= requiredRoleIndex
}

/**
 * Secure wrapper for API route handlers
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<Response>,
  options: {
    requireOwnership?: { type: 'poll' | 'vote', idParam: string }
    requiredRole?: string
  } = {}
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    // Authenticate request
    const authContext = await authenticateRequest(request)
    if (!authContext) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check role if required
    if (options.requiredRole && !hasRole(authContext.user, options.requiredRole)) {
      console.warn('[Security] Insufficient privileges:', {
        userId: authContext.user.id,
        userRole: authContext.user.role,
        requiredRole: options.requiredRole,
        ip: getClientIP(request)
      })
      
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check ownership if required
    if (options.requireOwnership) {
      const resourceId = extractResourceId(request, args, options.requireOwnership.idParam)
      if (!resourceId) {
        return new Response(
          JSON.stringify({ error: 'Resource ID not found' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const isOwner = await verifyResourceOwnership(
        options.requireOwnership.type,
        resourceId,
        authContext.user.id
      )

      if (!isOwner) {
        console.warn('[Security] Unauthorized resource access:', {
          userId: authContext.user.id,
          resourceType: options.requireOwnership.type,
          resourceId,
          ip: getClientIP(request)
        })
        
        return new Response(
          JSON.stringify({ error: 'Resource not found' }), // Generic error to prevent enumeration
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Call the original handler with auth context
    return handler(request, authContext, ...args)
  }
}

function extractResourceId(request: NextRequest, args: any[], paramName: string): string | null {
  // Try to extract from URL params (Next.js dynamic routes)
  if (args.length > 0 && args[0].params) {
    return args[0].params[paramName] || null
  }
  
  // Try to extract from request body
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const idIndex = pathSegments.findIndex(segment => segment === paramName) + 1
    return pathSegments[idIndex] || null
  } catch {
    return null
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}
