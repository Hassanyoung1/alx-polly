import { getPolls } from "@/lib/polls"
import { PollList } from "@/components/polls/poll-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PollsPage() {
  const polls = await getPolls()

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Polls</h1>
        <Link href="/polls/new">
          <Button>Create New Poll</Button>
        </Link>
      </div>
      
      <PollList polls={polls} />
    </div>
  )
}
