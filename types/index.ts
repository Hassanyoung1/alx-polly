import { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date | string
  updatedAt: Date | string
}

// For Supabase authentication
export type AuthUser = SupabaseUser

export interface Poll {
  id: string
  title: string
  description?: string
  created_by: string
  created_at: Date | string
  updated_at: Date | string
  expires_at?: Date | string
  is_active: boolean
  options: PollOption[]
  votes: Vote[]
}

export interface PollOption {
  id: string
  poll_id: string
  text: string
  order_num: number
  votes: Vote[]
}

export interface Vote {
  id: string
  poll_id: string
  option_id: string
  user_id?: string
  session_id?: string
  created_at: Date | string
}

export interface CreatePollRequest {
  title: string
  description?: string
  options: string[]
  expiresAt?: Date | string
}
