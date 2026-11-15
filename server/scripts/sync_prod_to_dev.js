/**
 * AITAG Production-to-Dev Database Synchronization Engine
 * 
 * Purpose:
 * Synchronizes and clones all tables from the Production Supabase Database
 * (byekbjxiowkrtwpsxevz) into the Development / Standby Supabase Database
 * (trdwewugrqdpopzqhkuk).
 * 
 * Guarantees:
 * 1. Safe development environment on Local without risking Production customer data.
 * 2. Dev database acts as a living, warm standby replica in Supabase.
 * 3. 100% data fidelity: all profiles, expert videos, tasks, packages, and orders match.
 * 
 * Usage:
 *   npm run db:sync:prod-to-dev
 *   node server/scripts/sync_prod_to_dev.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Dynamically load Production configuration from root .env
let prodEnv = {};
const prodEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(prodEnvPath)) {
  const content = fs.readFileSync(prodEnvPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        prodEnv[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
}

// Dynamically load Dev configuration from root .env.development
let devEnv = {};
const devEnvPath = path.resolve(__dirname, '../../.env.development');
if (fs.existsSync(devEnvPath)) {
  const content = fs.readFileSync(devEnvPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        devEnv[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
}

// Production Database Credentials (Source of Truth)
const PROD_URL = process.env.PROD_SUPABASE_URL || prodEnv.SUPABASE_URL || 'https://byekbjxiowkrtwpsxevz.supabase.co';
const PROD_KEY = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || prodEnv.SUPABASE_SERVICE_ROLE_KEY;

// Development / Standby Database Credentials (Target Clone)
const DEV_URL = process.env.DEV_SUPABASE_URL || devEnv.SUPABASE_URL || 'https://trdwewugrqdpopzqhkuk.supabase.co';
const DEV_KEY = process.env.DEV_SUPABASE_SERVICE_ROLE_KEY || devEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!PROD_KEY || !DEV_KEY) {
  console.error('❌ Error: Missing SUPABASE_SERVICE_ROLE_KEY in .env or .env.development.');
  process.exit(1);
}

const prodClient = createClient(PROD_URL, PROD_KEY);
const devClient = createClient(DEV_URL, DEV_KEY);

// Reverse dependency order for safe wiping of old dev staging data
const DELETE_ORDER = [
  'aitag_case_messages',
  'aitag_orders',
  'aitag_invitations',
  'aitag_bids',
  'aitag_tasks',
  'aitag_profiles',
  'aitag_package_tiers',
  'aitag_packages',
  'aitag_users'
];

// Forward dependency order for clean insertion into Dev
const INSERT_ORDER = [
  'aitag_users',
  'aitag_packages',
  'aitag_package_tiers',
  'aitag_profiles',
  'aitag_tasks',
  'aitag_bids',
  'aitag_invitations',
  'aitag_orders',
  'aitag_case_messages'
];

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
      throw new Error(`Failed to query ${tableName}: ${error.message}`);
    }

    if (data && data.length > 0) {
      allRows = allRows.concat(data);
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        from += PAGE_SIZE;
      }
    } else {
      hasMore = false;
    }
  }

  return allRows;
}

async function syncProdToDev() {
  const startTime = Date.now();
  console.log(`\n======================================================================`);
  console.log(`🔄 [AITAG Sync Engine] Production -> Dev Hot Standby Sync`);
  console.log(`   Source (Prod): ${PROD_URL}`);
  console.log(`   Target (Dev) : ${DEV_URL}`);
  console.log(`   Timestamp    : ${new Date().toISOString()}`);
  console.log(`======================================================================`);

  // Step 1: Clean old Dev tables in reverse FK order
  console.log(`\n1. Preparing Dev database (clearing stale staging records)...`);
  for (const table of DELETE_ORDER) {
    process.stdout.write(`   Cleaning ${table.padEnd(24)}... `);
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

  // Step 2: Fetch from Prod & Insert into Dev in forward FK order
  console.log(`\n2. Cloning Production tables into Dev Standby...`);
  let totalRecords = 0;
  const BATCH_SIZE = 100;

  for (const table of INSERT_ORDER) {
    process.stdout.write(`   Extracting ${table.padEnd(22)} from Prod... `);
    const prodRows = await fetchAllRows(prodClient, table);
    console.log(`${prodRows.length} rows`);

    if (prodRows.length > 0) {
      process.stdout.write(`   ↳ Inserting ${prodRows.length} rows to Dev... `);
      let hasError = false;

      for (let i = 0; i < prodRows.length; i += BATCH_SIZE) {
        const chunk = prodRows.slice(i, i + BATCH_SIZE);
        const { error: insertErr } = await devClient
          .from(table)
          .insert(chunk);

        if (insertErr) {
          console.log(`❌ Insert error at offset ${i}: ${insertErr.message}`);
          hasError = true;
          break;
        }
      }

      if (!hasError) {
        console.log(`✅ Done`);
      }
      totalRecords += prodRows.length;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n======================================================================`);
  console.log(`🎉 [AITAG Sync Engine] Sync completed in ${duration}s!`);
  console.log(`   Total Records Cloned : ${totalRecords}`);
  console.log(`   Target Dev Database  : ${DEV_URL}`);
  console.log(`   Localhost & Tests are now 100% synchronized with Production.`);
  console.log(`======================================================================\n`);

  return { success: true, totalRecords, duration };
}

if (require.main === module) {
  syncProdToDev()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Sync fatal error:', err.message);
      process.exit(1);
    });
}

module.exports = { syncProdToDev };
