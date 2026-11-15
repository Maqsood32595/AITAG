/**
 * AITAG Supabase Client — Resilient & Zero-Downtime Initialization
 * Fractal Kernel Core Slice
 * Unified Database: byekbjxiowkrtwpsxevz
 */
const path = require('path');
const fs = require('fs');

const devEnvPath = path.resolve(__dirname, '../.env.development');
if (fs.existsSync(devEnvPath) && (process.env.PORT === '8000' || process.env.NODE_ENV === 'development' || process.env.USE_DEV_DB === 'true')) {
  require('dotenv').config({ path: devEnvPath, override: true });
}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Unified Single Database across All Environments (Local, Render, Cloud Run)
const UNIFIED_SUPABASE_URL = 'https://byekbjxiowkrtwpsxevz.supabase.co';
const UNIFIED_SUPABASE_ANON = 'sb_publishable_73Bgkq70Z7b2yQffYwRAAg_0DFxoWjd';

const PLACEHOLDER = 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = (serviceKey && serviceKey !== PLACEHOLDER)
  ? serviceKey
  : (process.env.SUPABASE_ANON_KEY || UNIFIED_SUPABASE_ANON);

const supabaseUrl = process.env.SUPABASE_URL || UNIFIED_SUPABASE_URL;
const supabaseKey = (apiKey && apiKey !== PLACEHOLDER) ? apiKey : UNIFIED_SUPABASE_ANON;

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  const isDevDb = supabaseUrl.includes('trdwewugrqdpopzqhkuk');
  console.log(`✅ [SUPABASE] Connected to ${isDevDb ? 'Dev / Standby Replica' : 'Production'} Database:`, supabaseUrl);
} catch (e) {
  console.warn('⚠️ Supabase client creation error, falling back to default client:', e.message);
  supabase = createClient(UNIFIED_SUPABASE_URL, UNIFIED_SUPABASE_ANON);
}

module.exports = supabase;
