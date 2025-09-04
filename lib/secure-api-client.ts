// Security-enhanced API client
// Addresses: CSRF protection, proper error handling, request validation

import { Poll, CreatePollRequest, Vote, AuthUser } from '@/types'
import { buildApiUrl, API_ENDPOINTS } from './api-config'

interface ApiResponse<T> {
  data?: T
  error?: string
  success?: boolean
}

class SecureApiClient {
  private static csrfToken: string | null = null
  private static requestQueue: Map<string, Promise<any>> = new Map()

  // Get CSRF token from server
  private static async getCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken

    try {
      const response = await fetch('/api/csrf-token', { method: 'GET' })
      const data = await response.json()
      this.csrfToken = data.token
      return this.csrfToken || ''
    } catch (error) {
      console.error('[Security] Failed to get CSRF token:', error)
      return ''
    }
  }

  // Enhanced request with security features
  private static async secureRequest<T>(
    url: string,
    options: RequestInit,
    requireAuth = true
  ): Promise<T> {
    const method = options.method || 'GET'
    const requestKey = `${method}:${url}`

    // Prevent duplicate concurrent requests
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)
    }

    const requestPromise = this.executeSecureRequest<T>(url, options, requireAuth)
    this.requestQueue.set(requestKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.requestQueue.delete(requestKey)
    }
  }

  private static async executeSecureRequest<T>(
    url: string,
    options: RequestInit,
    requireAuth: boolean
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // Add CSRF token for state-changing requests
    const statefulMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
    if (statefulMethods.includes(options.method || 'GET')) {
      const csrfToken = await this.getCsrfToken()
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }
    }

    // Add auth token if required and available
    if (requireAuth) {
      // Note: In production, this should come from secure session storage
      // For now, we'll check if session exists without exposing token
      const sessionExists = typeof window !== 'undefined' && 
        sessionStorage.getItem('session_metadata')
      
      if (!sessionExists) {
        throw new Error('Authentication required')
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'same-origin' // Include cookies for session management
    })

    // Update CSRF token from response headers
    const newCsrfToken = response.headers.get('X-CSRF-Token')
    if (newCsrfToken) {
      this.csrfToken = newCsrfToken
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
      
      // Log security-relevant errors
      if (response.status === 401) {
        console.warn('[Security] Authentication failed')
      } else if (response.status === 403) {
        console.warn('[Security] Authorization failed')
      } else if (response.status === 429) {
        console.warn('[Security] Rate limit exceeded')
      }

      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Secure authentication methods
  static async signIn(email: string, password: string): Promise<{ user: AuthUser; session: any }> {
    const response = await this.secureRequest<ApiResponse<{ user: AuthUser; session: any }>>(
      buildApiUrl(API_ENDPOINTS.AUTH.LOGIN),
      {
        method: 'POST',
        body: JSON.stringify({ email, password })
      },
      false // Don't require auth for login
    )

    if (!response.data) {
      throw new Error(response.error || 'Authentication failed')
    }

    return response.data
  }

  static async signUp(email: string, password: string, name: string): Promise<{ user: AuthUser; session: any }> {
    // Client-side validation
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format')
    }

    if (name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long')
    }

    const response = await this.secureRequest<ApiResponse<{ user: AuthUser; session: any }>>(
      buildApiUrl(API_ENDPOINTS.AUTH.REGISTER),
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name: name.trim() })
      },
      false
    )

    if (!response.data) {
      throw new Error(response.error || 'Registration failed')
    }

    return response.data
  }

  static async signOut(): Promise<void> {
    try {
      await this.secureRequest<void>(
        buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT),
        { method: 'POST' }
      )
    } catch (error) {
      console.warn('[Security] Server logout failed:', error)
      // Continue with local cleanup
    }
  }

  static async getProfile(): Promise<AuthUser> {
    const response = await this.secureRequest<AuthUser>(
      buildApiUrl(API_ENDPOINTS.AUTH.PROFILE),
      { method: 'GET' }
    )

    return response
  }

  // Secure poll methods with validation
  static async createPoll(pollData: CreatePollRequest): Promise<Poll> {
    // Client-side validation
    if (!pollData.title?.trim()) {
      throw new Error('Poll title is required')
    }

    if (!pollData.options || pollData.options.length < 2) {
      throw new Error('Poll must have at least 2 options')
    }

    if (pollData.options.some(opt => !opt.trim())) {
      throw new Error('All poll options must be non-empty')
    }

    const response = await this.secureRequest<ApiResponse<Poll>>(
      buildApiUrl(API_ENDPOINTS.POLLS.CREATE),
      {
        method: 'POST',
        body: JSON.stringify(pollData)
      }
    )

    if (!response.data) {
      throw new Error(response.error || 'Failed to create poll')
    }

    return response.data
  }

  static async getPolls(includeInactive = false): Promise<Poll[]> {
    const url = buildApiUrl(API_ENDPOINTS.POLLS.LIST) + 
      (includeInactive ? '?includeInactive=true' : '')

    const response = await this.secureRequest<Poll[]>(url, { method: 'GET' }, false)
    return response
  }

  static async getPoll(pollId: string): Promise<Poll> {
    if (!pollId?.trim()) {
      throw new Error('Poll ID is required')
    }

    const response = await this.secureRequest<Poll>(
      buildApiUrl(API_ENDPOINTS.POLLS.BY_ID(pollId)),
      { method: 'GET' },
      false
    )

    return response
  }

  static async updatePoll(pollId: string, pollData: Partial<CreatePollRequest>): Promise<Poll> {
    if (!pollId?.trim()) {
      throw new Error('Poll ID is required')
    }

    const response = await this.secureRequest<ApiResponse<Poll>>(
      buildApiUrl(API_ENDPOINTS.POLLS.BY_ID(pollId)),
      {
        method: 'PUT',
        body: JSON.stringify(pollData)
      }
    )

    if (!response.data) {
      throw new Error(response.error || 'Failed to update poll')
    }

    return response.data
  }

  static async deletePoll(pollId: string): Promise<void> {
    if (!pollId?.trim()) {
      throw new Error('Poll ID is required')
    }

    await this.secureRequest<void>(
      buildApiUrl(API_ENDPOINTS.POLLS.BY_ID(pollId)),
      { method: 'DELETE' }
    )
  }

  static async vote(pollId: string, optionId: string): Promise<Vote> {
    if (!pollId?.trim() || !optionId?.trim()) {
      throw new Error('Poll ID and option ID are required')
    }

    const response = await this.secureRequest<ApiResponse<Vote>>(
      buildApiUrl(API_ENDPOINTS.POLLS.VOTE(pollId)),
      {
        method: 'POST',
        body: JSON.stringify({ optionId })
      },
      false // Allow anonymous voting
    )

    if (!response.data) {
      throw new Error(response.error || 'Failed to submit vote')
    }

    return response.data
  }

  // Security monitoring
  static getSecurityMetrics() {
    return {
      hasCsrfToken: !!this.csrfToken,
      pendingRequests: this.requestQueue.size,
      timestamp: Date.now()
    }
  }
}

export default SecureApiClient
