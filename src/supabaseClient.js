import { createClient } from '@supabase/supabase-js';

// Use hardcoded URL but get key from environment variable
const supabaseUrl = 'https://qahwzhxwqgzlfymtcnde.supabase.co';

// Support multiple ways to access the key for different environments
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 
                   process.env.SUPABASE_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log connection details (remove sensitive info in production)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key available:', !!supabaseKey);

// Create with more detailed options
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    headers: { 'x-application-name': 'brandeis-strangers' },
  },
};

// Create and export a default supabase client
const supabase = createClient(supabaseUrl, supabaseKey || 'public-anon-key', options);

// Test the connection
async function testConnection() {
  try {
    // Try to get table list to test connection
    const { data, error } = await supabase.from('_tables').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful!', data);
    }
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
  }
}

testConnection();

export default supabase;
