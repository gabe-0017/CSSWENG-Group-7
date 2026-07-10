// supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

console.log('[supabase] using key type:', process.env.SUPABASE_SERVICE_KEY ? 'service_role' : 'anon (SUPABASE_SERVICE_KEY not found)');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key in environment variables.');
}

// Service role key is used server-side to bypass RLS for trusted backend operations.
// Never expose this key to the browser or frontend code.
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;