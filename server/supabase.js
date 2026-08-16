/**
 * AITAG Supabase Client — Shared across all Fractal Kernel feature slices
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Detect placeholder — never send it to Supabase
const PLACEHOLDER = 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = (serviceKey && serviceKey !== PLACEHOLDER)
  ? serviceKey
  : process.env.SUPABASE_ANON_KEY;

if (!apiKey || apiKey === PLACEHOLDER) {
  console.error('❌ No valid Supabase API key found. Check your .env file.');
}

const supabase = createClient(process.env.SUPABASE_URL, apiKey);

module.exports = supabase;
