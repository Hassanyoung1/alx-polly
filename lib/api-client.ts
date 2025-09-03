// Standardized API client for v1 endpoints with centralized configuration
import { Poll, CreatePollRequest, Vote, AuthUser } from '@/types'
import { buildApiUrl, API_ENDPOINTS } from './api-config'

// Helper function to get auth headers
function getAuthHeaders(token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// ====================
// AUTH ENDPOINTS (RESTful)
// ====================

export async function signInAPI(email: string, password: string): Promise<{ user: AuthUser; session: any }> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Authentication failed')
  }

  const result = await response.json()
  return result.data || result // Handle both new and legacy response formats
}

export async function signUpAPI(email: string, password: string, name: string): Promise<{ user: AuthUser; session: any }> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.REGISTER), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password, name }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Registration failed')
  }

  const result = await response.json()
  return result.data || result // Handle both new and legacy response formats
}

export async function signOutAPI(token?: string): Promise<void> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT), {
    method: 'POST',
    headers: getAuthHeaders(token),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Logout failed')
  }
}

export async function getProfileAPI(token: string): Promise<AuthUser> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
    method: 'GET',
    headers: getAuthHeaders(token),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch profile')
  }

  const data = await response.json()
  return data.user || data
}

export async function updateProfileAPI(token: string, profileData: { name?: string; email?: string }): Promise<AuthUser> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(profileData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update profile')
  }

  const data = await response.json()
  return data.user || data
}

// ====================
// POLL ENDPOINTS (RESTful)
// ====================

export async function createPollAPI(pollData: CreatePollRequest): Promise<Poll> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.POLLS.BASE), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pollData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create poll')
  }

  const result = await response.json()
  return result.data || result
}

export async function updatePollAPI(pollId: string, pollData: Partial<CreatePollRequest>): Promise<Poll> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.POLLS.BY_ID(pollId)), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(pollData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update poll')
  }

  const result = await response.json()
  return result.data || result
}

export async function deletePollAPI(pollId: string): Promise<void> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.POLLS.BY_ID(pollId)), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to delete poll')
  }
}

export async function getPollAPI(pollId: string): Promise<Poll> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.POLLS.BY_ID(pollId)), {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to get poll')
  }

  const result = await response.json()
  return result.data || result
}

export async function listPollsAPI(includeInactive: boolean = false): Promise<Poll[]> {
  const url = buildApiUrl(API_ENDPOINTS.POLLS.BASE) + (includeInactive ? '?includeInactive=true' : '')
    
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to list polls')
  }

  const result = await response.json()
  return result.data || result
}

export async function togglePollStatusAPI(pollId: string, isActive: boolean): Promise<Poll> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.POLLS.BY_ID(pollId)), {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to toggle poll status')
  }

  const result = await response.json()
  return result.data || result
}

// ====================
// VOTING ENDPOINTS (RESTful)
// ====================

export async function voteAPI(pollId: string, optionId: string, userId?: string): Promise<Vote> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.POLLS.VOTE(pollId)), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      optionId,
      userId: userId || null
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to submit vote')
  }

  const result = await response.json()
  return result.data || result
}

export async function getUserVoteAPI(pollId: string, userId: string): Promise<Vote | null> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.POLLS.VOTE(pollId)) + `?userId=${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch user vote')
  }

  const result = await response.json()
  const vote = result.data || result
  return vote || null
}

// ====================
// LEGACY ENDPOINTS (Backward Compatibility)
// ====================

// These functions use the legacy poll endpoints for backward compatibility
export async function createPollLegacyAPI(pollData: CreatePollRequest): Promise<Poll> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.POLL.CREATE), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pollData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create poll')
  }

  return response.json()
}

export async function listPollsLegacyAPI(includeInactive: boolean = false): Promise<Poll[]> {
  const url = buildApiUrl(API_ENDPOINTS.POLL.LIST) + (includeInactive ? '?includeInactive=true' : '')
    
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to list polls')
  }

  return response.json()
}

// Profile detailed endpoints
export async function getProfileDetailedAPI(token: string): Promise<any> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.PROFILE.GET), {
    method: 'GET',
    headers: getAuthHeaders(token),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch profile')
  }

  return response.json()
}

export async function updateProfileDetailedAPI(token: string, profileData: { name?: string; email?: string }): Promise<any> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.PROFILE.UPDATE), {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(profileData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update profile')
  }

  return response.json()
}
