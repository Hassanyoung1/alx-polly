// Security monitoring dashboard component
// Shows security metrics and warnings for development/admin use

"use client"

import { useEffect, useState } from "react"
import { useSecureAuth } from "@/hooks/use-secure-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface SecurityMetrics {
  hasActiveSession: boolean
  sessionExpiresIn: number | null
  refreshCount: number
  deviceFingerprint: string | null
  loginAttempts: number
  isRateLimited: boolean
}

export function SecurityDashboard() {
  const { getSecurityStatus } = useSecureAuth()
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const updateMetrics = () => {
      const status = getSecurityStatus()
      setMetrics(status as SecurityMetrics)
      setLastUpdate(new Date())
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [getSecurityStatus])

  if (!metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
          <CardDescription>Loading security metrics...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const formatTimeRemaining = (ms: number | null): string => {
    if (!ms || ms <= 0) return 'Expired'
    
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const getSessionStatus = () => {
    if (!metrics.hasActiveSession) {
      return { status: 'No Session', color: 'secondary', icon: AlertTriangle }
    }
    
    if (metrics.sessionExpiresIn && metrics.sessionExpiresIn < 300000) { // Less than 5 minutes
      return { status: 'Expiring Soon', color: 'destructive', icon: AlertTriangle }
    }
    
    return { status: 'Active', color: 'default', icon: CheckCircle }
  }

  const sessionStatus = getSessionStatus()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
          <CardDescription>
            Real-time security metrics and session status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <sessionStatus.icon className="h-4 w-4" />
              <span className="font-medium">Session Status</span>
            </div>
            <Badge variant={sessionStatus.color as any}>
              {sessionStatus.status}
            </Badge>
          </div>

          {/* Session Expiry */}
          {metrics.hasActiveSession && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Session Expires In</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTimeRemaining(metrics.sessionExpiresIn)}
              </span>
            </div>
          )}

          {/* Refresh Count */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Session Refreshes</span>
            <span className="text-sm text-muted-foreground">
              {metrics.refreshCount}
            </span>
          </div>

          {/* Login Attempts */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Login Attempts</span>
            <span className="text-sm text-muted-foreground">
              {metrics.loginAttempts}
            </span>
          </div>

          {/* Device Fingerprint */}
          {metrics.deviceFingerprint && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Device ID</span>
              <span className="text-xs text-muted-foreground font-mono">
                {metrics.deviceFingerprint.slice(0, 8)}...
              </span>
            </div>
          )}

          {/* Security Warnings */}
          {metrics.isRateLimited && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Rate limit active due to multiple failed login attempts
              </AlertDescription>
            </Alert>
          )}

          {metrics.sessionExpiresIn && metrics.sessionExpiresIn < 300000 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Session expires soon. Please refresh or sign in again.
              </AlertDescription>
            </Alert>
          )}

          {/* Last Update */}
          <div className="text-xs text-muted-foreground text-right">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Security Best Practices */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Security Features Active</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Secure session storage (no localStorage)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Device fingerprinting for session binding</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Rate limiting for authentication</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>CSRF protection for state changes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Automatic session validation</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
