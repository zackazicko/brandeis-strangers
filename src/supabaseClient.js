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

// Helper function to manage local storage for admin data
export const localAdmin = {
  // Store a profile in local storage
  storeProfile: (profile) => {
    try {
      const profiles = JSON.parse(localStorage.getItem('brandeis_admin_profiles') || '[]');
      // Add ID and timestamp if missing
      if (!profile.id) profile.id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      if (!profile.created_at) profile.created_at = new Date().toISOString();
      
      // Add to beginning of array
      profiles.unshift(profile);
      localStorage.setItem('brandeis_admin_profiles', JSON.stringify(profiles));
      console.log('Profile stored locally for admin view:', profile);
      return true;
    } catch (err) {
      console.error('Failed to store profile locally:', err);
      return false;
    }
  },
  
  // Get all profiles from local storage
  getProfiles: () => {
    try {
      return JSON.parse(localStorage.getItem('brandeis_admin_profiles') || '[]');
    } catch (err) {
      console.error('Failed to retrieve profiles from local storage:', err);
      return [];
    }
  },
  
  // Store feedback in local storage
  storeFeedback: (feedback) => {
    try {
      const feedbackItems = JSON.parse(localStorage.getItem('brandeis_admin_feedback') || '[]');
      // Add ID and timestamp if missing
      if (!feedback.id) feedback.id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      if (!feedback.created_at) feedback.created_at = new Date().toISOString();
      
      // Add to beginning of array
      feedbackItems.unshift(feedback);
      localStorage.setItem('brandeis_admin_feedback', JSON.stringify(feedbackItems));
      console.log('Feedback stored locally for admin view:', feedback);
      return true;
    } catch (err) {
      console.error('Failed to store feedback locally:', err);
      return false;
    }
  },
  
  // Get all feedback from local storage
  getFeedback: () => {
    try {
      return JSON.parse(localStorage.getItem('brandeis_admin_feedback') || '[]');
    } catch (err) {
      console.error('Failed to retrieve feedback from local storage:', err);
      return [];
    }
  }
};

// Create the admin client with the service role key, if available
export const supabaseAdmin = serviceRoleKey ? 
  createClient(supabaseUrl, serviceRoleKey) : 
  supabase; // Fallback to regular client if no service key available

// Show a warning about missing service key
if (!serviceRoleKey) {
  console.error('⚠️ IMPORTANT: Service role key is missing - admin functionality will use local storage fallback');
  console.error('Regular users can still submit data via the public anon key');
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
        console.warn('⚠️ Admin functionality will use local storage for displaying user data');
        console.warn('Data will still be sent to Supabase with the anon key when users submit forms');
      }
    }
  } catch (err) {
    console.error('⚠️ Unexpected error connecting to Supabase:', err);
  }
})();

export default supabase;
