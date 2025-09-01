"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              ALX Polly
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold">
              ALX Polly
            </Link>
            <Link 
              href="/polls" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Polls
            </Link>
            {user && (
              <Link 
                href="/polls/new" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Create Poll
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.user_metadata?.full_name || user.email}
                </span>
                <Link href="/profile">
                  <Button variant="outline" size="sm">Profile</Button>
                </Link>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
