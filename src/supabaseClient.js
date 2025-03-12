import { createClient } from '@supabase/supabase-js';

// Use hardcoded URL but get key from environment variable
const supabaseUrl = 'https://qahwzhxwqgzlfymtcnde.supabase.co';

// Enhanced environment variable handling for Vercel deployment
console.log('Supabase environment variables checking...');

// Vercel exposes environment variables to the browser only if they start with NEXT_PUBLIC_
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

// Use the provided anon key or the hardcoded one from the console logs
const providedAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaHd6aHh3cWd6bGZ5bXRjbmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mzk5MjMsImV4cCI6MjA1NzExNTkyM30.58_hiFuTYtikitJOthuBTLlNiQZuWyvqZWESl0o9Tzc';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || providedAnonKey;

// Log environment variable status with detailed information
console.log('Service role key available:', !!serviceRoleKey);
console.log('Anon key available:', !!supabaseKey);

// Create the regular supabase client with the anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Create the admin client with the service role key, if available
export const supabaseAdmin = serviceRoleKey ? 
  createClient(supabaseUrl, serviceRoleKey) : 
  supabase; // Fallback to regular client if no service key available

// Show a warning about missing service key
if (!serviceRoleKey) {
  console.error('⚠️ IMPORTANT: Service role key is missing from environment variables');
  console.error('The admin panel requires this key to function properly');
  console.error('Please add NEXT_PUBLIC_SUPABASE_SERVICE_KEY to your Vercel environment variables');
  console.error('Instructions: https://vercel.com/docs/projects/environment-variables');
}

// Simple connectivity test
(async () => {
  try {
    console.log('Testing basic Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('⚠️ Supabase connection error:', error);
    } else {
      console.log('✅ Basic Supabase connection established successfully!');
      
      // Only test admin functionality if service key is present
      if (serviceRoleKey) {
        try {
          console.log('Testing admin client with service role key...');
          const { count, error: adminError } = await supabaseAdmin
            .from('main')
            .select('*', { count: 'exact', head: true });
            
          if (adminError) {
            console.error('⚠️ Admin client test failed:', adminError);
            console.error('This likely means your service key is invalid or has insufficient permissions.');
          } else {
            console.log(`✅ Admin client working correctly! Found ${count || 0} rows in main table.`);
          }
        } catch (e) {
          console.error('⚠️ Admin client test exception:', e);
        }
      } else {
        console.warn('⚠️ No service role key available - admin functionality will be limited.');
        console.warn('If you need admin access, add NEXT_PUBLIC_SUPABASE_SERVICE_KEY to your Vercel environment variables.');
      }
    }
  } catch (err) {
    console.error('⚠️ Unexpected error connecting to Supabase:', err);
  }
})();

export default supabase;
