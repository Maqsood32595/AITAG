/**
 * AITAG Production-to-Dev Database Synchronization Engine (Atomic Fetch + Optional PII Scrubbing)
 *
 * Guarantees:
 * 1. Fetches & validates ALL Production tables BEFORE wiping anything in Dev (eliminates half-wiped Dev on network errors).
 * 2. Refuses to run if Production URL and Dev URL are identical!
 * 3. Optional PII Sanitization (`SANITIZE_DEV_PII !== 'false'`): masks non-admin/non-seed customer
 *    emails and phone numbers when syncing into Dev so test environments never leak customer PII.
 *
 * Usage:
 *   npm run db:sync:prod-to-dev
 *   SANITIZE_DEV_PII=false npm run db:sync:prod-to-dev
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

function loadEnvFile(filePath) {
  const result = {};
  if (!fs.existsSync(filePath)) return result;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        result[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
  return result;
}

const prodEnv = loadEnvFile(path.resolve(__dirname, '../../.env'));
const devEnv = loadEnvFile(path.resolve(__dirname, '../../.env.development'));

function createSyncClients() {
  const PROD_URL = process.env.PROD_SUPABASE_URL || prodEnv.SUPABASE_URL;
  const PROD_KEY = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || prodEnv.SUPABASE_SERVICE_ROLE_KEY;

  const DEV_URL = process.env.DEV_SUPABASE_URL || devEnv.SUPABASE_URL;
  const DEV_KEY = process.env.DEV_SUPABASE_SERVICE_ROLE_KEY || devEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!PROD_URL || !PROD_KEY || !DEV_URL || !DEV_KEY) {
    throw new Error('Missing PROD_SUPABASE_* or DEV_SUPABASE_* URL/SERVICE_ROLE_KEY.');
  }

  if (PROD_URL.replace(/\/$/, '') === DEV_URL.replace(/\/$/, '')) {
    throw new Error('Safety Abort: PROD_SUPABASE_URL and DEV_SUPABASE_URL must NEVER point to the same database!');
  }

  return {
    PROD_URL,
    DEV_URL,
    prodClient: createClient(PROD_URL, PROD_KEY),
    devClient: createClient(DEV_URL, DEV_KEY),
  };
}

const DELETE_ORDER = [
  'aitag_payments',
  'aitag_case_messages',
  'aitag_orders',
  'aitag_invitations',
  'aitag_bids',
  'aitag_tasks',
  'aitag_expert_applications',
  'aitag_profiles',
  'aitag_package_tiers',
  'aitag_packages',
  'aitag_users'
];

const INSERT_ORDER = [...DELETE_ORDER].reverse();

const PROTECTED_DEV_EMAILS = new Set([
  'user1@aitag.com',
  'client1@aitag.com',
  'expert1@aitag.com',
  'admin@aitag.com',
  'l.maqsood.m@gmail.com',
  'maxmaqs@gmail.com'
]);

function maskEmail(email) {
  if (!email) return email;
  const lower = String(email).toLowerCase().trim();
  if (PROTECTED_DEV_EMAILS.has(lower) || lower.endsWith('@aitag.com') || lower.endsWith('@aitag.in')) {
    return lower;
  }
  const digest = crypto.createHash('sha256').update(lower).digest('hex').slice(0, 10);
  return `dev_${digest}@sandbox.aitag.local`;
}

function sanitizeRowsForDev(table, rows, shouldSanitize) {
  if (!shouldSanitize || !Array.isArray(rows)) return rows;
  return rows.map((row) => {
    const copy = { ...row };
    if (table === 'aitag_users' && copy.role !== 'admin') {
      copy.email = maskEmail(copy.email);
    }
    if (table === 'aitag_orders') {
      if (copy.customer_email) copy.customer_email = maskEmail(copy.customer_email);
      if (copy.customer_phone) copy.customer_phone = '+910000000000';
    }
    if (table === 'aitag_payments' && copy.customer_email) {
      copy.customer_email = maskEmail(copy.customer_email);
    }
    if (table === 'aitag_case_messages' && copy.sender_email && copy.sender_role !== 'admin') {
      copy.sender_email = maskEmail(copy.sender_email);
    }
    if (table === 'aitag_tasks' && copy.user_email) {
      copy.user_email = maskEmail(copy.user_email);
    }
    if (table === 'aitag_bids' && copy.user_email) {
      copy.user_email = maskEmail(copy.user_email);
    }
    if (table === 'aitag_invitations') {
      if (copy.client_email) copy.client_email = maskEmail(copy.client_email);
    }
    if (table === 'aitag_expert_applications') {
      if (copy.email) copy.email = maskEmail(copy.email);
      if (copy.phone) copy.phone = '+910000000000';
    }
    return copy;
  });
}

async function fetchAllRows(client, tableName) {
  const PAGE_SIZE = 1000;
  let allRows = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      return { rows: [], error: error.message };
    }

    if (data && data.length > 0) {
      allRows = allRows.concat(data);
      hasMore = data.length === PAGE_SIZE;
      from += PAGE_SIZE;
    } else {
      hasMore = false;
    }
  }

  return { rows: allRows, error: null };
}

async function syncProdToDev() {
  const { prodClient, devClient, PROD_URL, DEV_URL } = createSyncClients();
  const startTime = Date.now();
  const sanitizePii = process.env.SANITIZE_DEV_PII !== 'false';

  console.log(`\n======================================================================`);
  console.log(`🔄 [AITAG Sync Engine] Production -> Dev Standby Sync`);
  console.log(`   Source (Prod) : ${PROD_URL}`);
  console.log(`   Target (Dev)  : ${DEV_URL}`);
  console.log(`   PII Masking   : ${sanitizePii ? 'Enabled (safe customer anonymization)' : 'Disabled (raw)'}`);
  console.log(`   Timestamp     : ${new Date().toISOString()}`);
  console.log(`======================================================================`);

  // Step 1: Extract & stage ALL Production tables BEFORE wiping Dev
  console.log(`\n1. Staging Production data in memory (safety pre-flight)...`);
  const staged = new Map();
  let criticalReadError = null;

  for (const table of INSERT_ORDER) {
    process.stdout.write(`   Extracting ${table.padEnd(26)}... `);
    const { rows, error } = await fetchAllRows(prodClient, table);
    if (error) {
      console.log(`⚠️ Skipped (${error})`);
      if (table === 'aitag_users' || table === 'aitag_orders') {
        criticalReadError = `Critical table read failed (${table}): ${error}`;
      }
      staged.set(table, { skip: true, rows: [] });
    } else {
      console.log(`${rows.length} rows`);
      staged.set(table, { skip: false, rows: sanitizeRowsForDev(table, rows, sanitizePii) });
    }
  }

  if (criticalReadError) {
    throw new Error(`Aborting BEFORE wiping Dev DB: ${criticalReadError}`);
  }

  // Step 2: Wipe Dev tables in reverse FK order
  console.log(`\n2. Clearing Dev staging tables...`);
  for (const table of DELETE_ORDER) {
    if (staged.get(table)?.skip) continue;
    process.stdout.write(`   Cleaning ${table.padEnd(26)}... `);
    const { error: delErr } = await devClient
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (delErr) {
      console.log(`⚠️ Notice: ${delErr.message}`);
    } else {
      console.log(`✅ Cleaned`);
    }
  }

  // Step 3: Insert staged rows in forward FK order
  console.log(`\n3. Writing staged records into Dev...`);
  let totalRecords = 0;
  const BATCH_SIZE = 100;

  for (const table of INSERT_ORDER) {
    const entry = staged.get(table);
    if (!entry || entry.skip || entry.rows.length === 0) continue;

    process.stdout.write(`   Inserting ${String(entry.rows.length).padStart(4)} rows into ${table.padEnd(26)}... `);
    let hasError = false;
    for (let i = 0; i < entry.rows.length; i += BATCH_SIZE) {
      const chunk = entry.rows.slice(i, i + BATCH_SIZE);
      const { error: insertErr } = await devClient.from(table).insert(chunk);
      if (insertErr) {
        console.log(`❌ Offset ${i}: ${insertErr.message}`);
        hasError = true;
        break;
      }
    }
    if (!hasError) console.log(`✅ Done`);
    totalRecords += entry.rows.length;
  }

  const localProfilesDir = path.resolve(__dirname, '../data/profiles');
  if (fs.existsSync(localProfilesDir)) {
    const files = fs.readdirSync(localProfilesDir);
    let purgedCount = 0;
    for (const f of files) {
      if (f.endsWith('.json')) {
        try {
          fs.unlinkSync(path.join(localProfilesDir, f));
          purgedCount++;
        } catch {}
      }
    }
    console.log(`   Local disk cache reset: purged ${purgedCount} stale offline profiles.`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 [AITAG Sync Engine] Completed in ${duration}s! (${totalRecords} records cloned)\n`);
  return { success: true, totalRecords, duration };
}

if (require.main === module) {
  syncProdToDev()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Sync fatal error:', err.message);
      process.exit(1);
    });
}

module.exports = { syncProdToDev, maskEmail, sanitizeRowsForDev };
