/**
 * AITAG Supabase Client — Resilient & Zero-Downtime Initialization
 * Fractal Kernel Core Slice
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

const DEFAULT_DEV_URL = 'https://trdwewugrqdpopzqhkuk.supabase.co';
const DEFAULT_DEV_ANON = 'sb_publishable_NRgHXL9Yk-8u8EN4YOi2UQ_EtxXIyGE';
const DEFAULT_PROD_URL = 'https://byekbjxiowkrtwpsxevz.supabase.co';
const DEFAULT_PROD_ANON = 'sb_publishable_73Bgkq70Z7b2yQffYwRAAg_0DFxoWjd';

const isDev = process.env.NODE_ENV === 'development' || process.env.PORT === '8000' || process.env.USE_DEV_DB === 'true';
const fallbackUrl = isDev ? DEFAULT_DEV_URL : DEFAULT_PROD_URL;
const fallbackAnon = isDev ? DEFAULT_DEV_ANON : DEFAULT_PROD_ANON;

const PLACEHOLDER = 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = (serviceKey && serviceKey !== PLACEHOLDER)
  ? serviceKey
  : (process.env.SUPABASE_ANON_KEY || fallbackAnon);

const supabaseUrl = process.env.SUPABASE_URL || fallbackUrl;
const supabaseKey = (apiKey && apiKey !== PLACEHOLDER) ? apiKey : fallbackAnon;

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase Client initialized successfully for URL:', supabaseUrl);
} catch (e) {
  console.warn('⚠️ Supabase client creation error, falling back to default client:', e.message);
  supabase = createClient(fallbackUrl, fallbackAnon);
}

module.exports = supabase;
