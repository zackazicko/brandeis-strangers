import { createClient } from '@supabase/supabase-js';

// Use hardcoded URL but get key from environment variable
const supabaseUrl = 'https://qahwzhxwqgzlfymtcnde.supabase.co';

// Enhanced environment variable handling
console.log('Environment variable diagnostics:');

// IMPORTANT: In React apps built with Create React App, all environment variables must be prefixed with REACT_APP_
// Vercel exposes environment variables to the browser only if they start with NEXT_PUBLIC_
const serviceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
                      
// The public anon key is less sensitive but still needed
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   'public-anon-key'; // Fallback value

// Log environment variable status (but not the actual values)
console.log('Service role key available:', !!serviceRoleKey);
console.log('Anon key available:', !!supabaseKey);

// Create the regular supabase client with the anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Create the admin client with the service role key, if available
export const supabaseAdmin = serviceRoleKey ? 
  createClient(supabaseUrl, serviceRoleKey) : 
  supabase; // Fallback to regular client if no service key available

// Simple connectivity test
(async () => {
  try {
    console.log('Testing Supabase connection...');
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
        console.warn('If you need admin access, add REACT_APP_SUPABASE_SERVICE_KEY to your environment variables.');
      }
    }
  } catch (err) {
    console.error('⚠️ Unexpected error connecting to Supabase:', err);
  }
})();

export default supabase;
