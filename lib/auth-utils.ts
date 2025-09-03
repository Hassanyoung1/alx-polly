import { supabase } from '@/lib/supabase'

/**
 * Utility functions for handling authentication issues
 */

export async function clearAuthData() {
  try {
    // Sign out from Supabase (this clears localStorage)
    await supabase.auth.signOut()
    
    // Clear any additional localStorage items if needed
    if (typeof window !== 'undefined') {
      // Clear Supabase specific items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
    }
    
    console.log('Auth data cleared successfully')
    return true
  } catch (error) {
    console.error('Error clearing auth data:', error)
    return false
  }
}

export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('Session refresh failed:', error.message)
      // If refresh fails, clear invalid data
      await clearAuthData()
      return { session: null, error }
    }
    
    console.log('Session refreshed successfully')
    return { session: data.session, error: null }
  } catch (error) {
    console.error('Error refreshing session:', error)
    await clearAuthData()
    return { session: null, error }
  }
}

export function checkAuthHealth() {
  return new Promise((resolve) => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.warn('Auth health check failed:', error.message)
        resolve(false)
      } else {
        console.log('Auth health check passed')
        resolve(!!data.session)
      }
    }).catch(() => {
      resolve(false)
    })
  })
}
