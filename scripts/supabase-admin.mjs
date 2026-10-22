#!/usr/bin/env node
/**
 * AITAG Supabase Database Administration & Audit Tool
 * Executes queries and status checks using Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN in environment or passed via CLI.
 */

const token = process.env.SUPABASE_ACCESS_TOKEN;
const PROD_REF = 'byekbjxiowkrtwpsxevz';
const DEV_REF = 'trdwewugrqdpopzqhkuk';

if (!token) {
  console.error('Error: SUPABASE_ACCESS_TOKEN environment variable is required.');
  console.error('Example: $env:SUPABASE_ACCESS_TOKEN="sbp_..." ; node scripts/supabase-admin.mjs status');
  process.exit(1);
}

async function queryProject(projectRef, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Query failed on ${projectRef} [${res.status}]: ${text}`);
  }
  return await res.json();
}

async function auditRLS(refName, refId) {
  console.log(`\n=== Auditing ${refName} (${refId}) ===`);
  const tables = await queryProject(refId, `
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename LIKE 'aitag_%'
    ORDER BY tablename;
  `);

  console.log('Tables & Row-Level Security:');
  let secureCount = 0;
  for (const t of tables) {
    const isSecure = t.rowsecurity;
    if (isSecure) secureCount++;
    console.log(`  ${isSecure ? '✅' : '❌'} ${t.tablename.padEnd(24)} : RLS ${isSecure ? 'ENABLED' : 'DISABLED'}`);
  }

  const policies = await queryProject(refId, `
    SELECT tablename, policyname, cmd, roles 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    ORDER BY tablename, policyname;
  `);

  console.log(`\nActive Policies (${policies.length}):`);
  for (const p of policies) {
    console.log(`  🛡️  ${p.tablename.padEnd(22)} [${p.cmd}] "${p.policyname}"`);
  }

  console.log(`\nStatus: ${secureCount}/${tables.length} tables secured with RLS.`);
}

const command = process.argv[2] || 'status';

async function main() {
  if (command === 'status' || command === 'audit') {
    await auditRLS('Production', PROD_REF);
    await auditRLS('Development', DEV_REF);
  } else {
    console.log(`Unknown command: ${command}. Available: status`);
  }
}

main().catch(err => {
  console.error('Execution error:', err.message);
  process.exit(1);
});
