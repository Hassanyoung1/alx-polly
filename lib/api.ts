// API service - now using real Next.js API routes
import { Poll, CreatePollRequest, Vote, AuthUser } from "@/types"

const API_BASE = '/api'

// Note: getApiConfig is available for future use if needed
// const getApiConfig = () => ({
//   baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

export const pollService = {
  // Get all polls
  getPolls: async (): Promise<Poll[]> => {
    const response = await fetch(`${API_BASE}/polls`)
    if (!response.ok) {
      throw new Error('Failed to fetch polls')
    }
    return response.json()
  },

  // Get poll by ID
  getPoll: async (id: string): Promise<Poll | null> => {
    const response = await fetch(`${API_BASE}/polls/${id}`)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error('Failed to fetch poll')
    }
    return response.json()
  },

  // Create new poll
  createPoll: async (pollData: CreatePollRequest): Promise<Poll> => {
    const response = await fetch(`${API_BASE}/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pollData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create poll')
    }
    
    return response.json()
  },

  // Vote on a poll
  vote: async (pollId: string, optionId: string): Promise<Vote> => {
    const response = await fetch(`${API_BASE}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        optionId,
        userId: "current_user" // TODO: Get from auth context
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit vote')
    }
    
    return response.json()
  },

  // Get user's vote for a poll
  getUserVote: async (pollId: string, userId: string): Promise<Vote | null> => {
    const response = await fetch(`${API_BASE}/polls/${pollId}/vote?userId=${userId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user vote')
    }
    const vote = await response.json()
    return vote || null
  }
}

export const authService = {
  // Sign in
  signIn: async (email: string, password: string): Promise<AuthUser> => {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Authentication failed')
    }
    
    const user = await response.json()
    
    // Store user in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user))
    }

    return user
  },

  // Sign up
  signUp: async (email: string, password: string, name: string): Promise<AuthUser> => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }
    
    const user = await response.json()
    
    // Store user in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user))
    }

    return user
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Check localStorage for persisted user
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("auth_user")
      if (storedUser) {
        try {
          return JSON.parse(storedUser)
        } catch {
          // Clear invalid stored data
          localStorage.removeItem("auth_user")
        }
      }
    }

    return null
  },

  // Sign out
  signOut: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user")
    }
  }
}
