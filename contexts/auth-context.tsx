"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Session error:', error.message)
          // If there's an invalid refresh token, clear the session
          if (error.message.includes('refresh') || error.message.includes('Invalid')) {
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
          }
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        // Clear any invalid session data
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email || 'No user')
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully')
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setSession(null)
          setUser(null)
        } else if (event === 'SIGNED_IN') {
          console.log('User signed in')
          setSession(session)
          setUser(session?.user ?? null)
        }
        
        // Always update state regardless of event type
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Use Supabase client directly for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // The auth state change listener will handle updating user/session
      return { user: data.user, error: null }
    } catch (error) {
      console.error('SignIn error:', error)
      return { user: null, error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Use Supabase client directly for registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        throw error
      }

      // The auth state change listener will handle updating user/session
      return { user: data.user, error: null }
    } catch (error) {
      console.error('SignUp error:', error)
      return { user: null, error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
