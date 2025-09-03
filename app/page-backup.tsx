"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import React, { useMemo } from "react"

// Loading spinner component - memoized to prevent re-renders
const LoadingSpinner = React.memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
))
LoadingSpinner.displayName = 'LoadingSpinner'

// Feature cards data - moved outside component to prevent recreation
const FEATURES = [
  {
    icon: "🗳️",
    title: "Easy Voting",
    description: "Simple and intuitive interface for creating and participating in polls"
  },
  {
    icon: "📊",
    title: "Real-time Results",
    description: "See voting results update in real-time as participants cast their votes"
  },
  {
    icon: "🔗",
    title: "Easy Sharing",
    description: "Share your polls via direct links and gather responses from anywhere"
  }
] as const

export default function Home() {
  const { user, loading } = useAuth()

  const actionButtons = useMemo(() => {
    if (user) {
      return (
        <>
          <Link href="/polls">
            <Button size="lg" className="text-lg px-8 py-3">
              View Polls
            </Button>
          </Link>
          <Link href="/polls/new">
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Create Poll
            </Button>
          </Link>
        </>
      )
    }
    
    return (
      <>
        <Link href="/auth">
          <Button size="lg" className="text-lg px-8 py-3">
            Get Started
          </Button>
        </Link>
        <Link href="/polls">
          <Button variant="outline" size="lg" className="text-lg px-8 py-3">
            Browse Polls
          </Button>
        </Link>
      </>
    )
  }, [user])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to ALX Polly
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create engaging polls, gather opinions, and make data-driven decisions. 
            Share your polls with the world and see real-time results.
          </p>
          <div className="flex gap-4 justify-center">
            {actionButtons}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {FEATURES.map((feature, index) => (
            <Card key={feature.title} className="p-6">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
          
          <Card className="p-6">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
            <p className="text-muted-foreground">
              Share your polls via direct links and gather responses from anywhere
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-accent/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of users who are already creating amazing polls with Polly
          </p>
          <Link href="/auth">
            <Button size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
