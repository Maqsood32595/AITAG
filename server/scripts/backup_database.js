/**
 * AITAG Automated & Encrypted Supabase Database Backup Engine
 *
 * Capabilities:
 * 1. Explicitly binds to Production Supabase credentials (`PROD_SUPABASE_*` or `.env`),
 *    preventing accidental `.env.development` overrides on local machines.
 * 2. Captures all 11 core Supabase tables + local persistence fallback stores.
 * 3. Serializes & compresses snapshots with GZIP.
 * 4. Encrypts archives with AES-256-GCM when `BACKUP_ENCRYPTION_KEY` is configured (recommended!).
 * 5. Streams encrypted snapshots to Google Cloud Storage (`backups/database/`).
 * 6. Updates `latest.json` manifest in GCS with SHA-256 checksum & encryption metadata.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { Storage } = require('@google-cloud/storage');
const { createClient } = require('@supabase/supabase-js');
const { encryptBuffer } = require('../features/domain-security/grandchildren/crypto-guard');

// Load .env cleanly without allowing .env.development to hijack Production backup runs
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const SUPABASE_TABLES = [
  'aitag_users',
  'aitag_profiles',
  'aitag_tasks',
  'aitag_bids',
  'aitag_orders',
  'aitag_packages',
  'aitag_package_tiers',
  'aitag_case_messages',
  'aitag_invitations',
  'aitag_payments',
  'aitag_expert_applications'
];

const LOCAL_STORES = [
  { key: 'contact_inquiries', path: path.resolve(__dirname, '../data/contact_inquiries.json') },
  { key: 'expert_applications', path: path.resolve(__dirname, '../data/expert_applications.json') },
  { key: 'case_discussions_store', path: path.resolve(__dirname, '../data/case_discussions_store.json') }
];

function createProdClient() {
  const url = process.env.PROD_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing PROD_SUPABASE_URL / PROD_SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  }
  return { client: createClient(url, key), url };
}

function initGCS() {
  try {
    let credentials = null;

    if (process.env.GCS_KEY_BASE64) {
      try {
        const decoded = Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString('utf8');
        credentials = JSON.parse(decoded);
      } catch {}
    }

    if (!credentials && (process.env.GCS_CREDENTIALS || process.env.GOOGLE_CREDENTIALS)) {
      try {
        const raw = process.env.GCS_CREDENTIALS || process.env.GOOGLE_CREDENTIALS;
        credentials = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {}
    }

    if (!credentials) {
      const candidates = [
        path.join(__dirname, '../shortshub-service-account.json'),
        path.join(__dirname, '../../shortshub-service-account.json'),
        process.env.GOOGLE_CLOUD_KEY_FILE
      ].filter(Boolean);

      for (const kf of candidates) {
        if (fs.existsSync(kf)) {
          try {
            credentials = JSON.parse(fs.readFileSync(kf, 'utf8'));
            break;
          } catch {}
        }
      }
    }

    if (!credentials) {
      const rawKey = process.env.GCS_PRIVATE_KEY || process.env.SHORTSHUB_GCS_PRIVATE_KEY || '';
      const cleanKey = rawKey.replace(/\\n/g, '\n').replace(/"/g, '').trim();
      const clientEmail = process.env.GCS_CLIENT_EMAIL || process.env.SHORTSHUB_GCS_CLIENT_EMAIL;
      if (cleanKey && clientEmail) {
        credentials = { client_email: clientEmail, private_key: cleanKey };
      }
    }

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GCS_PROJECT_ID || credentials?.project_id || 'corded-cable-460921-u1';
    const storage = credentials ? new Storage({ projectId, credentials }) : new Storage({ projectId });
    const bucketName = process.env.GCS_BACKUP_BUCKET_NAME || 'aitag-db-backups-us';

    return { storage, bucket: storage.bucket(bucketName), bucketName };
  } catch (err) {
    console.warn('⚠️ [BackupEngine] GCS credentials not available:', err.message);
    return { storage: null, bucket: null, bucketName: null };
  }
}

async function fetchTableData(client, tableName) {
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
      return { error: error.message, rows: [] };
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

  return { error: null, rows: allRows };
}

async function runDatabaseBackup({ silent = false } = {}) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../backups/database');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const { client: prodClient, url: prodUrl } = createProdClient();
  const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || '';
  const shouldEncrypt = encryptionKey.length >= 16;

  if (!silent) {
    console.log(`\n======================================================================`);
    console.log(`🚀 [AITAG Backup Engine] Initiating Full Database Snapshot`);
    console.log(`   Target DB    : ${prodUrl}`);
    console.log(`   Encryption   : ${shouldEncrypt ? 'AES-256-GCM Enabled' : 'Unencrypted (Set BACKUP_ENCRYPTION_KEY!)'}`);
    console.log(`   Timestamp    : ${new Date().toISOString()}`);
    console.log(`======================================================================`);
  }

  const backupData = {
    backup_version: '2.0.0',
    timestamp: new Date().toISOString(),
    database_url: prodUrl,
    table_counts: {},
    total_records: 0,
    tables: {},
    local_stores: {}
  };

  for (const table of SUPABASE_TABLES) {
    try {
      const { rows, error } = await fetchTableData(prodClient, table);
      if (error) {
        if (!silent) console.log(`   ⚠️ Table ${table.padEnd(26)}: ${error}`);
        backupData.tables[table] = { status: 'error', error, count: 0, rows: [] };
        backupData.table_counts[table] = 0;
      } else {
        backupData.tables[table] = { status: 'ok', count: rows.length, rows };
        backupData.table_counts[table] = rows.length;
        backupData.total_records += rows.length;
        if (!silent) console.log(`   ✅ Table ${table.padEnd(26)}: ${rows.length} rows`);
      }
    } catch (tblErr) {
      backupData.tables[table] = { status: 'exception', error: tblErr.message, count: 0, rows: [] };
      backupData.table_counts[table] = 0;
    }
  }

  for (const store of LOCAL_STORES) {
    if (fs.existsSync(store.path)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(store.path, 'utf8'));
        const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
        backupData.local_stores[store.key] = parsed;
        if (!silent) console.log(`   📁 Local Store ${store.key.padEnd(20)}: ${count} items`);
      } catch (e) {
        backupData.local_stores[store.key] = { error: e.message };
      }
    }
  }

  const jsonStr = JSON.stringify(backupData, null, 2);
  const compressedBuffer = zlib.gzipSync(Buffer.from(jsonStr, 'utf8'), { level: 9 });
  const finalBuffer = shouldEncrypt ? encryptBuffer(compressedBuffer, encryptionKey) : compressedBuffer;
  const sha256Checksum = crypto.createHash('sha256').update(finalBuffer).digest('hex');

  const baseFilename = `aitag_backup_${timestamp}`;
  const archiveExtension = shouldEncrypt ? 'json.gz.enc' : 'json.gz';
  const archiveFilename = `${baseFilename}.${archiveExtension}`;
  const localArchivePath = path.join(backupDir, archiveFilename);

  // Only keep uncompressed JSON locally if encryption is disabled; otherwise write encrypted archive only
  if (!shouldEncrypt) {
    fs.writeFileSync(path.join(backupDir, `${baseFilename}.json`), jsonStr, 'utf8');
  }
  fs.writeFileSync(localArchivePath, finalBuffer);

  if (!silent) {
    console.log(`\n💾 [Local Storage] Archive saved (${(finalBuffer.length / 1024).toFixed(1)} KB): ${localArchivePath}`);
  }

  let gcsResult = null;
  const { bucket, bucketName } = initGCS();

  if (bucket) {
    try {
      const gcsDestination = `backups/database/${archiveFilename}`;
      const gcsFile = bucket.file(gcsDestination);

      await gcsFile.save(finalBuffer, {
        contentType: shouldEncrypt ? 'application/octet-stream' : 'application/gzip',
        metadata: {
          timestamp: backupData.timestamp,
          total_records: String(backupData.total_records),
          backup_version: backupData.backup_version,
          database_url: backupData.database_url,
          encrypted: String(shouldEncrypt),
          sha256: sha256Checksum
        },
        resumable: false
      });

      const latestManifest = {
        latest_backup: archiveFilename,
        gcs_uri: `gs://${bucketName}/${gcsDestination}`,
        timestamp: backupData.timestamp,
        total_records: backupData.total_records,
        table_counts: backupData.table_counts,
        encrypted: shouldEncrypt,
        sha256: sha256Checksum,
        raw_size_bytes: Buffer.byteLength(jsonStr),
        archive_size_bytes: finalBuffer.length
      };

      const latestFile = bucket.file('backups/database/latest.json');
      await latestFile.save(JSON.stringify(latestManifest, null, 2), {
        contentType: 'application/json',
        resumable: false
      });

      gcsResult = {
        success: true,
        gcsUri: `gs://${bucketName}/${gcsDestination}`,
        bucketName,
        encrypted: shouldEncrypt,
        sha256: sha256Checksum
      };

      if (!silent) {
        console.log(`☁️  [GCS Cloud Storage] Upload successful:`);
        console.log(`   URI:    gs://${bucketName}/${gcsDestination}`);
        console.log(`   SHA256: ${sha256Checksum}`);
      }
    } catch (gcsErr) {
      console.warn(`⚠️ [BackupEngine] GCS upload notice:`, gcsErr.message);
      gcsResult = { success: false, error: gcsErr.message };
    }
  } else {
    if (!silent) console.log(`ℹ️  [GCS Cloud Storage] Skipped (no active credentials configured)`);
    gcsResult = { success: false, skipped: true };
  }

  // Prune local backups older than 14 days
  try {
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
    for (const f of files) {
      const full = path.join(backupDir, f);
      const stat = fs.statSync(full);
      if (now - stat.mtimeMs > FOURTEEN_DAYS) {
        fs.unlinkSync(full);
      }
    }
  } catch {}

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  if (!silent) {
    console.log(`\n🎉 [AITAG Backup Engine] Completed in ${durationSec}s (Records: ${backupData.total_records})\n`);
  }

  return {
    success: true,
    timestamp: backupData.timestamp,
    totalRecords: backupData.total_records,
    tableCounts: backupData.table_counts,
    localArchivePath,
    encrypted: shouldEncrypt,
    sha256: sha256Checksum,
    gcsResult,
    durationSec
  };
}

if (require.main === module) {
  runDatabaseBackup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ [BackupEngine] Fatal error:', err);
      process.exit(1);
    });
}

module.exports = {
  runDatabaseBackup,
  SUPABASE_TABLES,
  LOCAL_STORES
};
