"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Poll } from "@/types"
import { listPollsAPI, getPollAPI } from "@/lib/api-client"

// Client-side cache to prevent duplicate requests
const clientCache = new Map<string, { data: any, timestamp: number, ttl: number }>()

function getCachedData<T>(key: string, ttl: number = 30000): T | null {
  const cached = clientCache.get(key)
  if (cached && (Date.now() - cached.timestamp) < ttl) {
    return cached.data
  }
  return null
}

function setCachedData<T>(key: string, data: T, ttl: number = 30000) {
  clientCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestInProgress = useRef(false)

  const fetchPolls = useCallback(async (skipCache = false) => {
    // Prevent duplicate requests
    if (requestInProgress.current) {
      console.log('🔄 Request already in progress, skipping...')
      return
    }

    // Check cache first
    if (!skipCache) {
      const cachedPolls = getCachedData<Poll[]>('polls:all')
      if (cachedPolls) {
        console.log('🚀 Using cached polls data')
        setPolls(cachedPolls)
        setIsLoading(false)
        setError(null)
        return
      }
    }

    try {
      requestInProgress.current = true
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Fetching fresh polls data...')
      const data = await listPollsAPI()
      
      setPolls(data)
      setCachedData('polls:all', data, 60000) // Cache for 1 minute
      
      console.log(`✅ Fetched ${data.length} polls`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch polls")
      console.error('❌ Error fetching polls:', err)
    } finally {
      setIsLoading(false)
      requestInProgress.current = false
    }
  }, [])

  useEffect(() => {
    fetchPolls()
    
    // Cleanup function to prevent memory leaks
    return () => {
      requestInProgress.current = false
    }
  }, [fetchPolls])

  return {
    polls,
    isLoading,
    error,
    refetch: () => fetchPolls(true) // Force fresh data
  }
}

export function usePoll(id: string) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestInProgress = useRef(false)

  const fetchPoll = useCallback(async (skipCache = false) => {
    if (!id) return

    // Prevent duplicate requests
    if (requestInProgress.current) {
      console.log(`🔄 Request for poll ${id} already in progress, skipping...`)
      return
    }

    // Check cache first
    if (!skipCache) {
      const cachedPoll = getCachedData<Poll>(`poll:${id}`)
      if (cachedPoll) {
        console.log(`🚀 Using cached poll data for ${id}`)
        setPoll(cachedPoll)
        setIsLoading(false)
        setError(null)
        return
      }
    }

    try {
      requestInProgress.current = true
      setIsLoading(true)
      setError(null)
      
      console.log(`🔄 Fetching fresh poll data for ${id}...`)
      const data = await getPollAPI(id)
      
      setPoll(data)
      setCachedData(`poll:${id}`, data, 30000) // Cache for 30 seconds
      
      console.log(`✅ Fetched poll ${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch poll")
      console.error(`❌ Error fetching poll ${id}:`, err)
    } finally {
      setIsLoading(false)
      requestInProgress.current = false
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchPoll()
    }
    
    // Cleanup function
    return () => {
      requestInProgress.current = false
    }
  }, [id, fetchPoll])

  return {
    poll,
    isLoading,
    error,
    refetch: () => fetchPoll(true) // Force fresh data
  }
}
