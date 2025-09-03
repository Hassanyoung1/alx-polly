// Simple script to create a test user for ALX Polly
// Run with: node create-test-user.js

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...')
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'demo@alxpolly.com',
      password: 'demo123456',
      user_metadata: {
        full_name: 'Demo User'
      },
      email_confirm: true // Skip email confirmation
    })

    if (error) {
      console.error('❌ Error creating user:', error.message)
      return
    }

    console.log('✅ Test user created successfully!')
    console.log('📧 Email: demo@alxpolly.com')
    console.log('🔑 Password: demo123456')
    console.log('👤 User ID:', data.user.id)
    console.log('')
    console.log('🚀 You can now test the authentication by:')
    console.log('1. Go to http://localhost:3002/auth/login')
    console.log('2. Use the credentials above to sign in')
    console.log('3. You should be redirected to /polls')

  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }
}

createTestUser()
