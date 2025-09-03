"use client"

import { useState, useEffect } from "react"
import { AuthUser } from "@/types"
import { signInAPI, signUpAPI, signOutAPI, getProfileAPI } from "@/lib/api-client"

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored token in localStorage
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      checkAuth(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const checkAuth = async (authToken?: string) => {
    try {
      const tokenToUse = authToken || token
      if (!tokenToUse) {
        setUser(null)
        setIsLoading(false)
        return
      }
      
      const currentUser = await getProfileAPI(tokenToUse)
      setUser(currentUser)
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { user, session } = await signInAPI(email, password)
    setUser(user)
    if (session?.access_token) {
      setToken(session.access_token)
      localStorage.setItem('auth_token', session.access_token)
    }
    return user
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { user, session } = await signUpAPI(email, password, name)
    setUser(user)
    if (session?.access_token) {
      setToken(session.access_token)
      localStorage.setItem('auth_token', session.access_token)
    }
    return user
  }

  const signOut = async () => {
    try {
      if (token) {
        await signOutAPI(token)
      }
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
    } catch (error) {
      console.error("Sign out failed:", error)
      // Still clear the user state locally even if API call fails
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refetch: () => checkAuth()
  }
}
