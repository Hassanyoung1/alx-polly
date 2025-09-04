#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
console.log('URL:', supabaseUrl);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('\n=== Testing Supabase Connection ===');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('Data received:', data);
    
    // Test with the specific query from the API
    console.log('\n2. Testing API query structure...');
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (*)
      `)
      .order('created_at', { ascending: false });
    
    if (pollsError) {
      console.error('API Query Error:', pollsError);
      return;
    }
    
    console.log('✅ API query successful!');
    console.log('Polls found:', polls?.length || 0);
    if (polls?.length > 0) {
      console.log('First poll structure:', {
        id: polls[0].id,
        title: polls[0].title,
        options_count: polls[0].poll_options?.length || 0
      });
    }
    
  } catch (error) {
    console.error('Connection failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      cause: error.cause
    });
  }
}

testConnection();
