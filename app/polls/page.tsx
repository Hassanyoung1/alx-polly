"use client"

import { PollList } from "@/components/polls/poll-list"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"
import { usePolls } from "@/hooks/use-polls"

export default function PollsPage() {
  const { polls, isLoading, error } = usePolls()

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Unable to Load Polls</h3>
            <p className="text-muted-foreground mb-4">
              There was an error connecting to the database. Please try creating a new poll.
            </p>
            <Link href="/polls/new">
              <Button>Create Your First Poll</Button>
            </Link>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No Polls Yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first poll! Gather opinions and make data-driven decisions.
            </p>
            <Link href="/polls/new">
              <Button>Create Your First Poll</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Polls</h1>
              <Link href="/polls/new">
                <Button>Create New Poll</Button>
              </Link>
            </div>
            
            <PollList polls={polls} />
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
