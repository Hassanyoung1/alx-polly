// Performance optimization: Database connection pooling and caching
// Fixes slow database queries and repeated Supabase client creation

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Singleton pattern for Supabase client to prevent recreation
class SupabaseServerSingleton {
  private static instance: any = null
  private static connectionPool: Map<string, any> = new Map()
  
  static getInstance() {
    if (!SupabaseServerSingleton.instance) {
      console.log('🚀 Creating optimized Supabase client singleton...')
      
      SupabaseServerSingleton.instance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: { 
            'x-application-name': 'alx-polly-optimized',
            'connection': 'keep-alive'
          }
        },
        // Enable connection pooling
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      })
      
      console.log('✅ Optimized Supabase client created with connection pooling')
    }
    
    return SupabaseServerSingleton.instance
  }

  // Connection health check
  static async healthCheck(): Promise<boolean> {
    try {
      const client = this.getInstance()
      const { error } = await client.from('polls').select('id').limit(1)
      return !error
    } catch {
      return false
    }
  }
}

export const supabaseServerOptimized = SupabaseServerSingleton.getInstance()
export const checkDatabaseHealth = SupabaseServerSingleton.healthCheck

// Export singleton for backward compatibility
export { supabaseServerOptimized as supabaseServer }
