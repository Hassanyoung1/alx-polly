"use client"

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { clearAuthData, refreshSession, checkAuthHealth } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'

export default function AuthDiagnosticsPage() {
  const { user, session, loading } = useAuth()
  const [authHealth, setAuthHealth] = useState<boolean | null>(null)
  const [diagnosticResults, setDiagnosticResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (message: string) => {
    setDiagnosticResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runAuthDiagnostics = async () => {
    setIsRunning(true)
    setDiagnosticResults([])
    
    addResult('Starting authentication diagnostics...')
    
    // Check current auth state
    addResult(`Current user: ${user?.email || 'None'}`)
    addResult(`Current session: ${session ? 'Present' : 'None'}`)
    
    // Check auth health
    const health = await checkAuthHealth()
    setAuthHealth(health as boolean)
    addResult(`Auth health: ${health ? 'Good' : 'Poor'}`)
    
    // Try to get session directly
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        addResult(`Session error: ${error.message}`)
      } else {
        addResult(`Direct session check: ${data.session ? 'Valid' : 'None'}`)
      }
    } catch (error) {
      addResult(`Session check failed: ${error}`)
    }
    
    // Check localStorage for auth tokens
    if (typeof window !== 'undefined') {
      const authKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      )
      addResult(`Local storage auth keys: ${authKeys.length} found`)
      authKeys.forEach(key => {
        const value = localStorage.getItem(key)
        addResult(`  ${key}: ${value ? 'Present' : 'Empty'}`)
      })
    }
    
    setIsRunning(false)
    addResult('Diagnostics complete')
  }

  const handleClearAuth = async () => {
    addResult('Clearing authentication data...')
    const success = await clearAuthData()
    addResult(success ? 'Auth data cleared successfully' : 'Failed to clear auth data')
    
    // Refresh the page to apply changes
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleRefreshSession = async () => {
    addResult('Attempting to refresh session...')
    const { session: newSession, error } = await refreshSession()
    if (error) {
      addResult(`Session refresh failed: ${error instanceof Error ? error.message : String(error)}`)
    } else {
      addResult(`Session refresh ${newSession ? 'successful' : 'resulted in no session'}`)
    }
  }

  useEffect(() => {
    if (!loading) {
      runAuthDiagnostics()
    }
  }, [loading])

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Authentication Diagnostics</h1>
        <p className="text-muted-foreground">
          Diagnose and fix authentication issues with your ALX Polly application.
        </p>
      </div>

      {/* Auth Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Authentication Status</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>Loading:</span>
            <Badge variant={loading ? 'secondary' : 'default'}>
              {loading ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span>User:</span>
            <Badge variant={user ? 'default' : 'destructive'}>
              {user?.email || 'Not signed in'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span>Session:</span>
            <Badge variant={session ? 'default' : 'destructive'}>
              {session ? 'Valid' : 'None'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span>Auth Health:</span>
            <Badge variant={
              authHealth === null ? 'secondary' : 
              authHealth ? 'default' : 'destructive'
            }>
              {authHealth === null ? 'Checking...' : authHealth ? 'Good' : 'Poor'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={runAuthDiagnostics}
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </Button>
          
          <Button 
            onClick={handleRefreshSession}
            disabled={isRunning}
            variant="outline"
          >
            Refresh Session
          </Button>
          
          <Button 
            onClick={handleClearAuth}
            disabled={isRunning}
            variant="destructive"
          >
            Clear Auth Data
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/auth/login'}
            variant="default"
          >
            Go to Login
          </Button>
        </div>
      </Card>

      {/* Diagnostic Results */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Diagnostic Log</h2>
        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          {diagnosticResults.length === 0 ? (
            <p className="text-muted-foreground">No diagnostics run yet.</p>
          ) : (
            <div className="space-y-1">
              {diagnosticResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Quick Fix Suggestions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Common Solutions</h2>
        <div className="space-y-3">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800">Invalid Refresh Token Error</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This usually happens when the refresh token has expired. Click "Clear Auth Data" and then sign in again.
            </p>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800">Session Not Found</h3>
            <p className="text-sm text-blue-700 mt-1">
              Try refreshing the session first. If that fails, clear auth data and sign in again.
            </p>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800">Everything Working</h3>
            <p className="text-sm text-green-700 mt-1">
              If auth health shows "Good" and you have a valid session, the authentication is working correctly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
