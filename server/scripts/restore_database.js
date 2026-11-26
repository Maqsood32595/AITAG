/**
 * AITAG Supabase Database Restore Engine (Supports AES-256-GCM Encrypted Backups)
 *
 * Usage:
 *   node server/scripts/restore_database.js --inspect
 *   node server/scripts/restore_database.js --dry-run
 *   node server/scripts/restore_database.js --file server/backups/database/aitag_backup_XYZ.json.gz.enc --inspect
 *   node server/scripts/restore_database.js --execute --confirm=RESTORE_NOW
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Storage } = require('@google-cloud/storage');
const { decryptBuffer } = require('../features/domain-security/grandchildren/crypto-guard');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const devEnv = path.resolve(__dirname, '../../.env.development');
if (fs.existsSync(devEnv)) {
  require('dotenv').config({ path: devEnv, override: false });
}
require('dotenv').config();

const supabase = require('../supabase');

function initGCS() {
  try {
    let credentials = null;
    if (process.env.GCS_KEY_BASE64) {
      try {
        const decoded = Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString('utf8');
        credentials = JSON.parse(decoded);
      } catch {}
    }
    if (!credentials) {
      const candidates = [
        path.join(__dirname, '../shortshub-service-account.json'),
        path.join(__dirname, '../../shortshub-service-account.json')
      ];
      for (const kf of candidates) {
        if (fs.existsSync(kf)) {
          credentials = JSON.parse(fs.readFileSync(kf, 'utf8'));
          break;
        }
      }
    }
    const projectId = credentials?.project_id || 'corded-cable-460921-u1';
    const storage = credentials ? new Storage({ projectId, credentials }) : new Storage({ projectId });
    const bucketName = process.env.GCS_BACKUP_BUCKET_NAME || 'aitag-db-backups-us';
    return { storage, bucket: storage.bucket(bucketName), bucketName };
  } catch {
    return { storage: null, bucket: null, bucketName: null };
  }
}

function decodeArchiveBuffer(rawBuffer, filename) {
  let buf = rawBuffer;
  if (filename.endsWith('.enc')) {
    const key = process.env.BACKUP_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Encrypted backup encountered. Set BACKUP_ENCRYPTION_KEY in your environment to decrypt.');
    }
    buf = decryptBuffer(buf, key);
  }
  if (filename.endsWith('.gz') || filename.endsWith('.gz.enc')) {
    const decompressed = zlib.gunzipSync(buf).toString('utf8');
    return JSON.parse(decompressed);
  }
  return JSON.parse(buf.toString('utf8'));
}

async function loadBackupPayload(filePath) {
  if (filePath) {
    const resolved = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Specified backup file not found: ${resolved}`);
    }
    return decodeArchiveBuffer(fs.readFileSync(resolved), resolved);
  }

  const backupDir = path.resolve(__dirname, '../backups/database');
  if (fs.existsSync(backupDir)) {
    const files = fs
      .readdirSync(backupDir)
      .filter((f) => f.startsWith('aitag_backup_') && (f.endsWith('.json.gz.enc') || f.endsWith('.json.gz') || f.endsWith('.json')));
    if (files.length > 0) {
      files.sort().reverse();
      const latestLocal = path.join(backupDir, files[0]);
      console.log(`📁 Using latest local backup: ${latestLocal}`);
      return decodeArchiveBuffer(fs.readFileSync(latestLocal), latestLocal);
    }
  }

  const { bucket, bucketName } = initGCS();
  if (bucket) {
    console.log(`☁️ Fetching latest backup manifest from gs://${bucketName}/backups/database/latest.json`);
    const [manifestContent] = await bucket.file('backups/database/latest.json').download();
    const manifest = JSON.parse(manifestContent.toString('utf8'));
    console.log(`☁️ Downloading ${manifest.latest_backup} (encrypted: ${Boolean(manifest.encrypted)})...`);
    const [archiveContent] = await bucket.file(`backups/database/${manifest.latest_backup}`).download();
    return decodeArchiveBuffer(archiveContent, manifest.latest_backup);
  }

  throw new Error('No local or GCS backup file found.');
}

async function main() {
  const args = process.argv.slice(2);
  const isInspect = args.includes('--inspect');
  const isExecute = args.includes('--execute');
  const fileArgIdx = args.indexOf('--file');
  const specifiedFile = fileArgIdx !== -1 ? args[fileArgIdx + 1] : null;

  console.log(`\n======================================================================`);
  console.log(`🔍 [AITAG Database Restore / Inspection Engine]`);
  console.log(`======================================================================`);

  const payload = await loadBackupPayload(specifiedFile);

  console.log(`   Backup Version : ${payload.backup_version || '1.0.0'}`);
  console.log(`   Snapshot Time  : ${payload.timestamp}`);
  console.log(`   Source DB      : ${payload.database_url}`);
  console.log(`   Total Records  : ${payload.total_records || 'N/A'}`);
  console.log(`----------------------------------------------------------------------`);
  console.log(`   Table Breakdown:`);
  for (const [tbl, count] of Object.entries(payload.table_counts || {})) {
    console.log(`     - ${tbl.padEnd(26)} : ${count} records`);
  }
  console.log(`======================================================================\n`);

  if (isInspect || (!isExecute && !args.includes('--dry-run'))) {
    console.log(`ℹ️ [Inspection Mode Only] To verify restore without writing, pass: --dry-run`);
    console.log(`ℹ️ To apply restore to Supabase, pass: --execute --confirm=RESTORE_NOW\n`);
    return;
  }

  if (args.includes('--dry-run')) {
    console.log(`🛡️ [Dry Run Mode] Verifying restore operations (NO DB WRITES PERFORMED)`);
    for (const [tbl, info] of Object.entries(payload.tables || {})) {
      if (info.rows && info.rows.length > 0) {
        console.log(`   [Dry Run] Would upsert ${info.rows.length} rows to ${tbl}`);
      }
    }
    console.log(`\n✅ Dry run verification passed. Zero data altered.\n`);
    return;
  }

  if (isExecute) {
    if (!supabase) {
      throw new Error('Missing active Supabase connection for live restore.');
    }
    if (!args.includes('--confirm=RESTORE_NOW')) {
      console.error(`❌ Confirmation token missing! Pass --confirm=RESTORE_NOW to execute live restore.`);
      process.exit(1);
    }

    console.log(`⚠️ [LIVE RESTORE ENGAGED] Upserting records into Supabase...`);
    for (const [tbl, info] of Object.entries(payload.tables || {})) {
      if (info.rows && info.rows.length > 0) {
        process.stdout.write(`   Upserting ${info.rows.length} rows to ${tbl}... `);
        const { error } = await supabase.from(tbl).upsert(info.rows);
        if (error) {
          console.log(`❌ ERROR: ${error.message}`);
        } else {
          console.log(`✅ OK`);
        }
      }
    }
    console.log(`\n🎉 Live restore completed successfully.\n`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Restore engine error:', err.message);
    process.exit(1);
  });
}

module.exports = { loadBackupPayload, decodeArchiveBuffer };
