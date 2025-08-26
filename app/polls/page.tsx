"use client"

import { usePolls } from "@/hooks/use-polls"
import { PollList } from "@/components/polls/poll-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PollsPage() {
  const { polls, isLoading, error } = usePolls()
  const router = useRouter()

  const handlePollClick = (poll: any) => {
    router.push(`/polls/${poll.id}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Polls</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading polls...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Polls</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Polls</h1>
        <Link href="/polls/new">
          <Button>Create New Poll</Button>
        </Link>
      </div>
      
      <PollList 
        polls={polls} 
        onPollClick={handlePollClick}
        emptyMessage="No polls available. Create your first poll!"
      />
    </div>
  );
}
