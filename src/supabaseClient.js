import { createClient } from '@supabase/supabase-js';

// Use hardcoded URL but get key from environment variable
const supabaseUrl = 'https://qahwzhxwqgzlfymtcnde.supabase.co';

// Support multiple ways to access the key for different environments
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 
                   process.env.SUPABASE_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.warn('Supabase key not found! Make sure REACT_APP_SUPABASE_ANON_KEY is set in your environment.');
}

// Create and export a default supabase client
const supabase = createClient(supabaseUrl, supabaseKey || 'public-anon-key');
export default supabase;
