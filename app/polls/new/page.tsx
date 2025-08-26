"use client"

import { CreatePollForm } from "@/components/polls/create-poll-form"
import { CreatePollRequest } from "@/types"
import { pollService } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function NewPollPage() {
  const router = useRouter()

  const handleCreatePoll = async (pollData: CreatePollRequest) => {
    try {
      const newPoll = await pollService.createPoll(pollData)
      router.push(`/polls/${newPoll.id}`)
    } catch (error) {
      console.error("Failed to create poll:", error)
      // TODO: Add toast notification for error
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <CreatePollForm onSubmit={handleCreatePoll} />
    </div>
  );
}
