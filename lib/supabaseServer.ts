import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔧 Initializing supabaseServer...')
console.log('🔧 URL available:', !!supabaseUrl)
console.log('🔧 Service key available:', !!supabaseServiceKey)
console.log('🔧 URL value:', supabaseUrl)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables for server client')
  throw new Error('Missing Supabase environment variables for server client')
}

console.log('🔧 Creating Supabase client...')
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
console.log('✅ Supabase server client created successfully')










