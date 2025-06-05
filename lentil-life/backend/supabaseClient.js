require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase URL or Anonymous Key in environment variables.');
  console.error('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file (for local development) or in your hosting environment variables.');
  // Optionally, you could throw an error here to prevent the app from starting without proper config
  // throw new Error('Supabase URL or Anonymous Key is missing.');
}

const supabase = supabaseKey && supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log('Supabase client initialized.');
} else {
  console.error('Supabase client failed to initialize due to missing credentials.');
}

module.exports = supabase; 