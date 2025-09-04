// Security monitoring endpoint
// Provides security metrics and monitoring capabilities

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'

// GET /api/v1/security/status - Get security status (admin only)
export const GET = withAuth(
  async (request: NextRequest, authContext) => {
    try {
      // Get security metrics from the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      // Get recent security events
      const { data: securityEvents, error: eventsError } = await supabase
        .from('security_events')
        .select('event_type, created_at, details')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(100)

      if (eventsError) {
        console.error('[Security] Failed to fetch security events:', eventsError)
      }

      // Get rate limiting violations
      const rateLimitViolations = securityEvents?.filter(event => 
        event.event_type === 'RATE_LIMIT_EXCEEDED'
      ) || []

      // Get failed authentication attempts
      const failedAuthAttempts = securityEvents?.filter(event => 
        event.event_type === 'AUTHENTICATION_FAILED'
      ) || []

      // Get suspicious activity patterns
      const suspiciousActivity = securityEvents?.filter(event => 
        ['TOKEN_VALIDATION_FAILED', 'CSRF_VALIDATION_FAILED', 'UNAUTHORIZED_ACCESS'].includes(event.event_type)
      ) || []

      // Get poll activity metrics
      const { data: recentPolls, error: pollsError } = await supabase
        .from('polls')
        .select('id, created_at, created_by')
        .gte('created_at', twentyFourHoursAgo)

      const { data: recentVotes, error: votesError } = await supabase
        .from('votes')
        .select('id, created_at, user_id, poll_id')
        .gte('created_at', twentyFourHoursAgo)

      // Calculate security score
      let securityScore = 100
      
      // Deduct points for security issues
      securityScore -= Math.min(rateLimitViolations.length * 2, 20) // Max -20 for rate limit violations
      securityScore -= Math.min(failedAuthAttempts.length * 1, 15) // Max -15 for auth failures
      securityScore -= Math.min(suspiciousActivity.length * 5, 30) // Max -30 for suspicious activity

      const securityStatus = {
        score: Math.max(securityScore, 0),
        status: securityScore >= 80 ? 'healthy' : securityScore >= 60 ? 'warning' : 'critical',
        metrics: {
          rateLimitViolations: rateLimitViolations.length,
          failedAuthAttempts: failedAuthAttempts.length,
          suspiciousActivity: suspiciousActivity.length,
          totalSecurityEvents: securityEvents?.length || 0
        },
        activity: {
          newPolls: recentPolls?.length || 0,
          newVotes: recentVotes?.length || 0,
          activeUsers: new Set(recentVotes?.map(v => v.user_id).filter(Boolean)).size
        },
        timestamp: new Date().toISOString()
      }

      console.log('[Security] Security status requested:', {
        userId: authContext.user.id,
        score: securityStatus.score,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        data: securityStatus
      })
    } catch (error) {
      console.error('[Security] Security status check failed:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve security status' },
        { status: 500 }
      )
    }
  },
  { 
    requiredRole: 'admin' 
  }
)

// POST /api/v1/security/alert - Report security alert (admin only)
export const POST = withAuth(
  async (request: NextRequest, authContext) => {
    try {
      const body = await request.json()
      const { alertType, description, severity = 'medium' } = body

      // Validate input
      if (!alertType?.trim() || !description?.trim()) {
        return NextResponse.json(
          { error: 'Alert type and description are required' },
          { status: 400 }
        )
      }

      if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
        return NextResponse.json(
          { error: 'Invalid severity level' },
          { status: 400 }
        )
      }

      // Log security alert
      const { error: logError } = await supabase.rpc('log_security_event', {
        p_event_type: 'SECURITY_ALERT',
        p_user_id: authContext.user.id,
        p_ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        p_user_agent: request.headers.get('user-agent'),
        p_request_path: '/api/v1/security/alert',
        p_details: {
          alertType,
          description,
          severity,
          reportedBy: authContext.user.email
        }
      })

      if (logError) {
        console.error('[Security] Failed to log security alert:', logError)
      }

      console.log('[Security] Security alert reported:', {
        alertType,
        severity,
        reportedBy: authContext.user.email,
        timestamp: new Date().toISOString()
      })

      // In production, you might want to send notifications here
      // Example: await sendSecurityAlert({ alertType, description, severity })

      return NextResponse.json({
        success: true,
        message: 'Security alert reported successfully'
      }, { status: 201 })
    } catch (error) {
      console.error('[Security] Security alert reporting failed:', error)
      return NextResponse.json(
        { error: 'Failed to report security alert' },
        { status: 500 }
      )
    }
  },
  { 
    requiredRole: 'admin' 
  }
)
