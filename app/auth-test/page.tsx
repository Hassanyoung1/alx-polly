// Test page to verify authentication
"use client"

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export default function AuthTestPage() {
  const { user, session, loading, signIn, signOut } = useAuth()

  const handleTestLogin = async () => {
    console.log('Testing login with demo credentials...')
    const result = await signIn('demo@alxpolly.com', 'demo123456')
    console.log('Login result:', result)
  }

  if (loading) {
    return <div className="p-8">Loading authentication...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>User Status:</strong> {user ? 'Logged In' : 'Not Logged In'}
        </div>
        
        {user && (
          <div>
            <strong>User Email:</strong> {user.email}
          </div>
        )}
        
        <div>
          <strong>Session:</strong> {session ? 'Active' : 'None'}
        </div>
        
        <div className="space-x-4">
          {!user ? (
            <Button onClick={handleTestLogin}>
              Test Login (demo@alxpolly.com)
            </Button>
          ) : (
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
