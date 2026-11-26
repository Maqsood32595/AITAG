/**
 * AITAG Supabase Client — Fail-Safe Multi-Environment Initialization
 * Fractal Kernel Core Slice
 * Notice: Production defaults are never hardcoded to avoid accidental local writes to Prod DB.
 */
const path = require('path');
const fs = require('fs');

const forceProdTarget = process.env.BACKUP_TARGET === 'production';
const devEnvPath = path.resolve(__dirname, '../.env.development');

if (
  !forceProdTarget &&
  fs.existsSync(devEnvPath) &&
  (process.env.PORT === '8000' || process.env.NODE_ENV === 'development' || process.env.USE_DEV_DB === 'true')
) {
  require('dotenv').config({ path: devEnvPath, override: true });
}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const PLACEHOLDER = 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE';
const rawUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rawKey = (serviceKey && serviceKey !== PLACEHOLDER) ? serviceKey : process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (rawUrl && rawKey && rawKey !== PLACEHOLDER) {
  try {
    supabase = createClient(rawUrl, rawKey);
    const isDevDb = rawUrl.includes('trdwewugrqdpopzqhkuk');
    console.log(`✅ [SUPABASE] Connected to ${isDevDb ? 'Dev / Standby Replica' : 'Production'} Database:`, rawUrl);
  } catch (e) {
    console.warn('⚠️ Supabase client initialization notice:', e.message);
  }
} else if (process.env.NODE_ENV === 'test' || process.env.PIET_RUN === 'true') {
  console.log('ℹ️ [SUPABASE] Running in isolated in-RAM test mode (no Supabase env credentials supplied).');
} else {
  console.warn('⚠️ [SUPABASE] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY; server will rely on resilient in-memory fallbacks.');
}

module.exports = supabase;
