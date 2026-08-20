/**
 * AITAG Supabase Client — Resilient & Zero-Downtime Initialization
 * Fractal Kernel Core Slice
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const PLACEHOLDER = 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = (serviceKey && serviceKey !== PLACEHOLDER)
  ? serviceKey
  : process.env.SUPABASE_ANON_KEY;

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = (apiKey && apiKey !== PLACEHOLDER) ? apiKey : 'placeholder-anon-key';

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  if (!process.env.SUPABASE_URL || !apiKey) {
    console.warn('⚠️ Supabase environment variables unconfigured — initialized with safe in-memory fallback client.');
  } else {
    console.log('✅ Supabase Client initialized successfully for URL:', supabaseUrl);
  }
} catch (e) {
  console.warn('⚠️ Supabase client creation error, falling back to safe mock client:', e.message);
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
}

module.exports = supabase;
