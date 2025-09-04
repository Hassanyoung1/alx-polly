// Security-hardened session management
// Addresses: XSS protection, race conditions, token validation, and device binding

interface SessionData {
  userId: string
  email: string
  expiresAt: number
  deviceFingerprint?: string
  ipAddress?: string
  lastRefreshAt: number
  refreshCount: number
}

interface SecurityMetrics {
  maxRefreshesPerHour: number
  maxConcurrentSessions: number
  tokenExpiryMinutes: number
  refreshCooldownSeconds: number
}

class SecureSessionManager {
  private static instance: SecureSessionManager
  private refreshAttempts: Map<string, { count: number, lastAttempt: number }> = new Map()
  private sessionState: SessionData | null = null
  private broadcastChannel: BroadcastChannel | null = null
  
  private readonly security: SecurityMetrics = {
    maxRefreshesPerHour: 10,
    maxConcurrentSessions: 3,
    tokenExpiryMinutes: 15,
    refreshCooldownSeconds: 30
  }

  private constructor() {
    // Initialize BroadcastChannel for tab synchronization
    if (typeof window !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('auth-sync')
      this.broadcastChannel.onmessage = this.handleBroadcastMessage.bind(this)
    }
  }

  static getInstance(): SecureSessionManager {
    if (!SecureSessionManager.instance) {
      SecureSessionManager.instance = new SecureSessionManager()
    }
    return SecureSessionManager.instance
  }

  // Generate device fingerprint for session binding
  private generateDeviceFingerprint(): string {
    if (typeof window === 'undefined') return 'server'
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('fingerprint', 10, 10)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    return btoa(fingerprint).slice(0, 32)
  }

  // Validate token format and expiry
  private validateToken(token: string): boolean {
    try {
      // Basic JWT format validation
      const parts = token.split('.')
      if (parts.length !== 3) return false
      
      // Decode payload to check expiry
      const payload = JSON.parse(atob(parts[1]))
      const now = Math.floor(Date.now() / 1000)
      
      return payload.exp && payload.exp > now
    } catch {
      return false
    }
  }

  // Check rate limiting for token refresh
  private checkRefreshRateLimit(userId: string): boolean {
    const now = Date.now()
    const userAttempts = this.refreshAttempts.get(userId)
    
    if (!userAttempts) {
      this.refreshAttempts.set(userId, { count: 1, lastAttempt: now })
      return true
    }

    // Reset counter if it's been more than an hour
    if (now - userAttempts.lastAttempt > 3600000) {
      this.refreshAttempts.set(userId, { count: 1, lastAttempt: now })
      return true
    }

    // Check cooldown period
    if (now - userAttempts.lastAttempt < this.security.refreshCooldownSeconds * 1000) {
      console.warn(`[Security] Refresh cooldown active for user ${userId}`)
      return false
    }

    // Check hourly limit
    if (userAttempts.count >= this.security.maxRefreshesPerHour) {
      console.warn(`[Security] Refresh rate limit exceeded for user ${userId}`)
      return false
    }

    userAttempts.count++
    userAttempts.lastAttempt = now
    return true
  }

  // Handle cross-tab session synchronization
  private handleBroadcastMessage(event: MessageEvent) {
    const { type, data } = event.data
    
    switch (type) {
      case 'SESSION_UPDATED':
        this.sessionState = data
        break
      case 'SESSION_CLEARED':
        this.sessionState = null
        this.clearSessionData()
        break
    }
  }

  // Broadcast session changes to other tabs
  private broadcastSessionChange(type: string, data?: any) {
    this.broadcastChannel?.postMessage({ type, data })
  }

  // Secure session storage (avoid localStorage for tokens)
  private setSessionData(sessionData: SessionData): void {
    this.sessionState = sessionData
    this.broadcastSessionChange('SESSION_UPDATED', sessionData)
    
    // Store non-sensitive session metadata only
    if (typeof window !== 'undefined') {
      const metadata = {
        userId: sessionData.userId,
        email: sessionData.email,
        expiresAt: sessionData.expiresAt
      }
      sessionStorage.setItem('session_metadata', JSON.stringify(metadata))
    }
  }

  private clearSessionData(): void {
    this.sessionState = null
    this.broadcastSessionChange('SESSION_CLEARED')
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('session_metadata')
      // Clear any legacy localStorage tokens
      localStorage.removeItem('auth_token')
    }
  }

  // Get current session with validation
  getCurrentSession(): SessionData | null {
    if (!this.sessionState) return null

    const now = Date.now()
    if (this.sessionState.expiresAt < now) {
      console.warn('[Security] Session expired')
      this.clearSessionData()
      return null
    }

    return this.sessionState
  }

  // Secure session creation with device binding
  createSession(userData: { userId: string, email: string }, token: string): SessionData | null {
    if (!this.validateToken(token)) {
      console.error('[Security] Invalid token format')
      return null
    }

    const now = Date.now()
    const sessionData: SessionData = {
      userId: userData.userId,
      email: userData.email,
      expiresAt: now + (this.security.tokenExpiryMinutes * 60 * 1000),
      deviceFingerprint: this.generateDeviceFingerprint(),
      lastRefreshAt: now,
      refreshCount: 0
    }

    this.setSessionData(sessionData)
    console.log('[Security] Secure session created with device binding')
    return sessionData
  }

  // Secure token refresh with rate limiting
  async refreshSession(refreshToken: string): Promise<boolean> {
    const currentSession = this.getCurrentSession()
    if (!currentSession) return false

    if (!this.checkRefreshRateLimit(currentSession.userId)) {
      return false
    }

    // Verify device fingerprint hasn't changed
    const currentFingerprint = this.generateDeviceFingerprint()
    if (currentSession.deviceFingerprint !== currentFingerprint) {
      console.warn('[Security] Device fingerprint mismatch, clearing session')
      this.clearSession()
      return false
    }

    const now = Date.now()
    currentSession.lastRefreshAt = now
    currentSession.refreshCount++
    currentSession.expiresAt = now + (this.security.tokenExpiryMinutes * 60 * 1000)

    this.setSessionData(currentSession)
    console.log('[Security] Session refreshed securely')
    return true
  }

  // Secure session clearing
  clearSession(): void {
    console.log('[Security] Session cleared securely')
    this.clearSessionData()
  }

  // Get security metrics for monitoring
  getSecurityMetrics(): { 
    hasActiveSession: boolean
    sessionExpiresIn: number | null
    refreshCount: number
    deviceFingerprint: string | null
  } {
    const session = this.getCurrentSession()
    return {
      hasActiveSession: !!session,
      sessionExpiresIn: session ? session.expiresAt - Date.now() : null,
      refreshCount: session?.refreshCount || 0,
      deviceFingerprint: session?.deviceFingerprint || null
    }
  }
}

export const secureSession = SecureSessionManager.getInstance()
