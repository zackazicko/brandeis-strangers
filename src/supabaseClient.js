import { createClient } from '@supabase/supabase-js';

// Use hardcoded URL but get key from environment variable
const supabaseUrl = 'https://qahwzhxwqgzlfymtcnde.supabase.co';

// Enhanced environment variable handling for Vercel deployment
console.log('Checking for Supabase configuration...');

// Create a runtime config object that can be used for debugging
window.runtimeConfig = window.runtimeConfig || {};

// Get service key from environment variable
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

// Use the provided anon key 
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaHd6aHh3cWd6bGZ5bXRjbmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzIyNjksImV4cCI6MjA1ODcwODI2OX0.msCVyE6tBzPIPAccyDbNsnAFxCtCLmM4Ab4fYnk3R-E';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || anonKey;

// Store configuration status in runtime config for debugging
window.runtimeConfig.serviceKeyAvailable = !!serviceRoleKey;
window.runtimeConfig.anonKeyAvailable = !!supabaseKey;

// Log environment variable status with detailed information
console.log('Service role key available:', !!serviceRoleKey);
console.log('Anon key available:', !!supabaseKey);

// Create the regular supabase client with the anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Get service role key or try alternative approaches
const getServiceRoleKey = () => {
  // Check if we already have the service key from env vars
  if (serviceRoleKey) {
    return serviceRoleKey;
  }
  
  // Log the issue
  console.warn('Service key not found in environment variables, checking for runtime config...');
  
  // See if it was set later via runtime config
  if (window.SUPABASE_SERVICE_KEY) {
    console.log('Found service key in window.SUPABASE_SERVICE_KEY');
    return window.SUPABASE_SERVICE_KEY;
  }
  
  // Return null if not found
  console.error('Service key not available through any method');
  return null;
};

// Create the admin client, checking multiple sources for the key
export const supabaseAdmin = (() => {
  const key = getServiceRoleKey();
  return key ? createClient(supabaseUrl, key) : supabase;
})();

// Show a warning about missing service key
if (!getServiceRoleKey()) {
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
      
      // Only test admin functionality if service key is available
      const serviceKey = getServiceRoleKey();
      if (serviceKey) {
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
      }
    }
  } catch (err) {
    console.error('⚠️ Unexpected error connecting to Supabase:', err);
  }
})();

export default supabase;
