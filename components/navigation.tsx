"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const { user, isAuthenticated, signOut } = useAuth()

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
            {isAuthenticated && (
              <Link 
                href="/polls/new" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Create Poll
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.name}
                </span>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
