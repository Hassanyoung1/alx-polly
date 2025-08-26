"use client"

import { useState, useEffect } from "react"
import { AuthUser } from "@/types"
import { authService } from "@/lib/api"

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const user = await authService.signIn(email, password)
    setUser(user)
    return user
  }

  const signUp = async (email: string, password: string, name: string) => {
    const user = await authService.signUp(email, password, name)
    setUser(user)
    return user
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out failed:", error)
      // Still clear the user state locally even if API call fails
      setUser(null)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refetch: checkAuth
  }
}
