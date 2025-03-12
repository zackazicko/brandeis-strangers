import { createClient } from '@supabase/supabase-js';

// Use hardcoded URL but get key from environment variable
const supabaseUrl = 'https://qahwzhxwqgzlfymtcnde.supabase.co';

// Environment diagnostics
console.log('Environment variable diagnostics in supabaseClient.js:');
console.log('- REACT_APP_SUPABASE_SERVICE_KEY exists:', !!process.env.REACT_APP_SUPABASE_SERVICE_KEY);
console.log('- REACT_APP_SUPABASE_ANON_KEY exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);

// Support multiple ways to access the key for different environments
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 
                   process.env.SUPABASE_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Get the service role key for admin operations
const serviceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

// Log connection details (remove sensitive info in production)
console.log('Connecting to Supabase...');
if (!serviceRoleKey) {
  console.warn('⚠️ REACT_APP_SUPABASE_SERVICE_KEY not found in environment variables!');
  console.warn('Admin functionality will be limited. Please ensure your .env file contains this key.');
  console.warn('Make sure:');
  console.warn('1. Each environment variable is on its own line in .env');
  console.warn('2. There are no spaces around the = sign');
  console.warn('3. Values with special characters are quoted');
  console.warn('4. You\'ve restarted your development server after changes');
} else {
  console.log('✅ Service role key available - admin functionality should work');
}

// Create and export a default supabase client
const supabase = createClient(supabaseUrl, supabaseKey || 'public-anon-key');

// Create admin client with service role key
export const supabaseAdmin = serviceRoleKey ? 
  createClient(supabaseUrl, serviceRoleKey) : 
  supabase; // Fallback to regular client if no service key available

// Simple test
(async () => {
  try {
    // Check if we can at least connect
    // eslint-disable-next-line no-unused-vars
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection established successfully!');
      
      // Test admin client if available
      if (serviceRoleKey) {
        console.log('Service role key detected - admin functionality should be available');
        
        // Test a direct query to main table
        try {
          const { count, error: testError } = await supabaseAdmin
            .from('main')
            .select('*', { count: 'exact', head: true });
            
          if (testError) {
            console.error('Admin client test error:', testError);
          } else {
            console.log('Admin client test successful, found', count, 'rows in main table');
          }
        } catch (e) {
          console.error('Admin client test exception:', e);
        }
      }
    }
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
  }
})();

export default supabase;
