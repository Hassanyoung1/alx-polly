export interface User {
  id: string
  email: string
  name: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Poll {
  id: string
  title: string
  description?: string
  createdBy: string
  createdAt: Date | string
  updatedAt: Date | string
  expiresAt?: Date | string
  isActive: boolean
  options: PollOption[]
  votes: Vote[]
}

export interface PollOption {
  id: string
  pollId: string
  text: string
  order: number
  votes: Vote[]
}

export interface Vote {
  id: string
  pollId: string
  optionId: string
  userId?: string
  sessionId?: string
  createdAt: Date | string
}

export interface CreatePollRequest {
  title: string
  description?: string
  options: string[]
  expiresAt?: Date | string
}

export interface AuthUser {
  id: string
  email: string
  name: string
}
