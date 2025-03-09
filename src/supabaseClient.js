import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qahwzhxwqgzlfymtcnde.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create and export a *default* supabase client
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
