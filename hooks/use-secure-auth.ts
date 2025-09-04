// Security-hardened authentication hook
// Replaces localStorage with secure session management

"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthUser } from "@/types"
import { signInAPI, signUpAPI, signOutAPI, getProfileAPI } from "@/lib/api-client"
import { secureSession } from "@/lib/secure-session"

interface SecurityMetrics {
  loginAttempts: number
  lastLoginAttempt: number
  isRateLimited: boolean
}

export function useSecureAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    loginAttempts: 0,
    lastLoginAttempt: 0,
    isRateLimited: false
  })

  // Rate limiting for login attempts
  const checkLoginRateLimit = useCallback((): boolean => {
    const now = Date.now()
    const timeSinceLastAttempt = now - securityMetrics.lastLoginAttempt
    
    // Reset attempts after 15 minutes
    if (timeSinceLastAttempt > 900000) {
      setSecurityMetrics(prev => ({ ...prev, loginAttempts: 0, isRateLimited: false }))
      return true
    }
    
    // Block after 5 failed attempts within 15 minutes
    if (securityMetrics.loginAttempts >= 5) {
      setSecurityMetrics(prev => ({ ...prev, isRateLimited: true }))
      console.warn('[Security] Login rate limit exceeded')
      return false
    }
    
    return true
  }, [securityMetrics])

  // Validate current session on mount and periodically
  useEffect(() => {
    const validateSession = async () => {
      try {
        const currentSession = secureSession.getCurrentSession()
        
        if (currentSession) {
          // Verify session is still valid with server
          const profile = await getProfileAPI('')
          setUser(profile)
          console.log('[Security] Session validated successfully')
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('[Security] Session validation failed:', error)
        secureSession.clearSession()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    validateSession()

    // Set up periodic session validation (every 5 minutes)
    const validationInterval = setInterval(validateSession, 300000)
    
    return () => clearInterval(validationInterval)
  }, [])

  // Enhanced sign-in with security checks
  const signIn = async (email: string, password: string): Promise<AuthUser> => {
    if (!checkLoginRateLimit()) {
      throw new Error('Too many login attempts. Please try again later.')
    }

    try {
      setSecurityMetrics(prev => ({
        ...prev,
        lastLoginAttempt: Date.now()
      }))

      const { user: authUser, session } = await signInAPI(email, password)
      
      if (!session?.access_token) {
        throw new Error('Invalid session data received')
      }

      // Create secure session instead of storing in localStorage
      const sessionData = secureSession.createSession(
        { userId: authUser.id, email: authUser.email },
        session.access_token
      )

      if (!sessionData) {
        throw new Error('Failed to create secure session')
      }

      setUser(authUser)
      setSecurityMetrics(prev => ({ ...prev, loginAttempts: 0, isRateLimited: false }))
      
      console.log('[Security] Secure sign-in completed')
      return authUser
    } catch (error) {
      setSecurityMetrics(prev => ({
        ...prev,
        loginAttempts: prev.loginAttempts + 1
      }))
      throw error
    }
  }

  // Enhanced sign-up with validation
  const signUp = async (email: string, password: string, name: string): Promise<AuthUser> => {
    // Basic validation
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format')
    }

    try {
      const { user: authUser, session } = await signUpAPI(email, password, name)
      
      if (session?.access_token) {
        const sessionData = secureSession.createSession(
          { userId: authUser.id, email: authUser.email },
          session.access_token
        )

        if (sessionData) {
          setUser(authUser)
          console.log('[Security] Secure sign-up completed')
        }
      }
      
      return authUser
    } catch (error) {
      console.error('[Security] Sign-up failed:', error)
      throw error
    }
  }

  // Secure sign-out with session clearing
  const signOut = async (): Promise<void> => {
    try {
      const currentSession = secureSession.getCurrentSession()
      
      if (currentSession) {
        // Attempt to notify server of logout
        try {
          await signOutAPI('')
        } catch (error) {
          console.warn('[Security] Server logout notification failed:', error)
          // Continue with local logout even if server call fails
        }
      }

      // Clear secure session and local state
      secureSession.clearSession()
      setUser(null)
      
      console.log('[Security] Secure sign-out completed')
    } catch (error) {
      console.error('[Security] Sign-out error:', error)
      // Force local cleanup even if there's an error
      secureSession.clearSession()
      setUser(null)
    }
  }

  // Manual session refresh
  const refreshSession = async (): Promise<boolean> => {
    try {
      const currentSession = secureSession.getCurrentSession()
      if (!currentSession) return false

      // In a real implementation, you'd call a refresh endpoint
      // For now, we'll validate the current session
      const profile = await getProfileAPI('')
      if (profile) {
        const success = await secureSession.refreshSession('')
        if (success) {
          console.log('[Security] Session refreshed successfully')
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('[Security] Session refresh failed:', error)
      secureSession.clearSession()
      setUser(null)
      return false
    }
  }

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<void> => {
    try {
      const currentSession = secureSession.getCurrentSession()
      
      if (currentSession) {
        const profile = await getProfileAPI('')
        setUser(profile)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('[Security] Auth check failed:', error)
      secureSession.clearSession()
      setUser(null)
    }
  }, [])

  // Get security status for monitoring
  const getSecurityStatus = () => {
    const sessionMetrics = secureSession.getSecurityMetrics()
    return {
      ...sessionMetrics,
      loginAttempts: securityMetrics.loginAttempts,
      isRateLimited: securityMetrics.isRateLimited
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshSession,
    checkAuth,
    getSecurityStatus,
    securityMetrics: {
      ...securityMetrics,
      ...secureSession.getSecurityMetrics()
    }
  }
}
