// Performance monitoring component
// Tracks load times and cache performance

"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { performanceCache } from '@/lib/performance-cache'

interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  cacheHitRate: number
  totalRequests: number
  componentsRendered: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
    totalRequests: 0,
    componentsRendered: 0
  })
  
  const [cacheStats, setCacheStats] = useState<any>({})

  useEffect(() => {
    // Measure page load time
    const pageLoadTime = performance.now()
    
    // Update component render count
    setMetrics(prev => ({
      ...prev,
      pageLoadTime: Math.round(pageLoadTime),
      componentsRendered: prev.componentsRendered + 1
    }))

    // Update cache stats
    const stats = performanceCache.getStats()
    setCacheStats(stats)
  }, [])

  const refreshStats = () => {
    const stats = performanceCache.getStats()
    setCacheStats(stats)
  }

  const clearCache = () => {
    performanceCache.clear()
    refreshStats()
  }

  const getPerformanceRating = () => {
    if (metrics.pageLoadTime < 1000) return { label: "Excellent", color: "bg-green-500" }
    if (metrics.pageLoadTime < 3000) return { label: "Good", color: "bg-yellow-500" }
    if (metrics.pageLoadTime < 5000) return { label: "Fair", color: "bg-orange-500" }
    return { label: "Poor", color: "bg-red-500" }
  }

  const rating = getPerformanceRating()

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Performance Monitor</h3>
        <Badge className={`${rating.color} text-white`}>
          {rating.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-muted-foreground">Page Load</div>
          <div className="font-semibold">{metrics.pageLoadTime}ms</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-muted-foreground">Components</div>
          <div className="font-semibold">{metrics.componentsRendered}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-muted-foreground">Cache Entries</div>
          <div className="font-semibold">{cacheStats.total || 0}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-muted-foreground">Cache Size</div>
          <div className="font-semibold">{Math.round((cacheStats.size || 0) / 1024)}KB</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Valid Cache:</span>
          <span className="font-semibold text-green-600">{cacheStats.valid || 0}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Expired Cache:</span>
          <span className="font-semibold text-red-600">{cacheStats.expired || 0}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={refreshStats} 
          variant="outline" 
          size="sm"
        >
          Refresh Stats
        </Button>
        <Button 
          onClick={clearCache} 
          variant="destructive" 
          size="sm"
        >
          Clear Cache
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        Performance optimizations active: Database connection pooling, response caching, duplicate request prevention
      </div>
    </Card>
  )
}
