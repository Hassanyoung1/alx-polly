"use client"

import { useState, useEffect } from "react"
import { Poll } from "@/types"
import { pollService } from "@/lib/api"

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPolls = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await pollService.getPolls()
      setPolls(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch polls")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [])

  return {
    polls,
    isLoading,
    error,
    refetch: fetchPolls
  }
}

export function usePoll(id: string) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPoll = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await pollService.getPoll(id)
      setPoll(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch poll")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPoll()
    }
  }, [id])

  return {
    poll,
    isLoading,
    error,
    refetch: fetchPoll
  }
}
