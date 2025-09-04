// Performance optimization: In-memory caching with TTL
// Reduces database queries and improves response times

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class PerformanceCache {
  private static instance: PerformanceCache
  private cache = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timeout

  private constructor() {
    // Clean up expired entries every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 2 * 60 * 1000)
  }

  static getInstance(): PerformanceCache {
    if (!PerformanceCache.instance) {
      PerformanceCache.instance = new PerformanceCache()
    }
    return PerformanceCache.instance
  }

  // Get cached data or execute function if cache miss
  async get<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    ttlMs: number = 30000 // 30 seconds default
  ): Promise<T> {
    const cached = this.cache.get(key)
    const now = Date.now()

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < cached.ttl) {
      console.log(`🚀 Cache HIT for key: ${key}`)
      return cached.data
    }

    console.log(`🔄 Cache MISS for key: ${key}, fetching...`)
    
    try {
      const data = await fetchFunction()
      
      // Store in cache
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl: ttlMs
      })
      
      return data
    } catch (error) {
      // If we have stale data and fetch fails, return stale data
      if (cached) {
        console.log(`⚠️  Using stale cache for key: ${key}`)
        return cached.data
      }
      throw error
    }
  }

  // Invalidate specific cache entry
  invalidate(key: string): void {
    this.cache.delete(key)
    console.log(`🗑️  Cache invalidated for key: ${key}`)
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    )
    
    keysToDelete.forEach(key => this.cache.delete(key))
    console.log(`🗑️  Cache invalidated for pattern: ${pattern} (${keysToDelete.length} entries)`)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    console.log('🗑️  All cache cleared')
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: ${cleaned} expired entries removed`)
    }
  }

  // Get cache stats
  getStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    const valid = entries.filter(([_, entry]) => (now - entry.timestamp) < entry.ttl)
    
    return {
      total: entries.length,
      valid: valid.length,
      expired: entries.length - valid.length,
      size: JSON.stringify(Object.fromEntries(this.cache)).length
    }
  }
}

export const performanceCache = PerformanceCache.getInstance()

// Cache key generators
export const cacheKeys = {
  polls: () => 'polls:all',
  poll: (id: string) => `poll:${id}`,
  pollWithVotes: (id: string) => `poll:${id}:with-votes`,
  userVote: (pollId: string, userId: string) => `vote:${pollId}:${userId}`,
  pollStats: (id: string) => `stats:${id}`
}
