/**
 * AITAG Automated Supabase Database Backup Engine
 * 
 * Capabilities:
 * 1. Fetches complete table snapshots from unified Supabase instance (byekbjxiowkrtwpsxevz).
 * 2. Bundles local persistence files (expert_applications, contact_inquiries, etc.).
 * 3. Serializes to timestamped JSON & compresses with GZIP.
 * 4. Persists locally in server/backups/database/.
 * 5. Streams & stores permanently in Google Cloud Storage (gs://shortshub_video_storage/backups/database/).
 * 6. Updates latest.json manifest in GCS for zero-delay restore discovery.
 * 7. Supports CLI execution (`node server/scripts/backup_database.js`) and programmatic daily scheduling.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Storage } = require('@google-cloud/storage');

// Load environment configuration
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const devEnv = path.resolve(__dirname, '../../.env.development');
if (fs.existsSync(devEnv)) {
  require('dotenv').config({ path: devEnv, override: false });
}
require('dotenv').config();

const supabase = require('../supabase');

// Tables to extract from Supabase
const SUPABASE_TABLES = [
  'aitag_users',
  'aitag_profiles',
  'aitag_tasks',
  'aitag_bids',
  'aitag_orders',
  'aitag_packages',
  'aitag_package_tiers',
  'aitag_case_messages',
  'aitag_invitations'
];

// Local JSON files to include in snapshot
const LOCAL_STORES = [
  { key: 'contact_inquiries', path: path.resolve(__dirname, '../data/contact_inquiries.json') },
  { key: 'expert_applications', path: path.resolve(__dirname, '../data/expert_applications.json') },
  { key: 'case_discussions_store', path: path.resolve(__dirname, '../data/case_discussions_store.json') }
];

/**
 * Initialize Google Cloud Storage with resilient credential discovery
 */
function initGCS() {
  try {
    let credentials = null;

    if (process.env.GCS_KEY_BASE64) {
      try {
        const decoded = Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString('utf8');
        credentials = JSON.parse(decoded);
      } catch (e) {}
    }

    if (!credentials && (process.env.GCS_CREDENTIALS || process.env.GOOGLE_CREDENTIALS)) {
      try {
        const raw = process.env.GCS_CREDENTIALS || process.env.GOOGLE_CREDENTIALS;
        credentials = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {}
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
          } catch (e) {}
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
    const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || process.env.GCS_BUCKET_NAME || 'shortshub_video_storage';

    return { storage, bucket: storage.bucket(bucketName), bucketName };
  } catch (err) {
    console.warn('⚠️ [BackupEngine] GCS credentials not available:', err.message);
    return { storage: null, bucket: null, bucketName: null };
  }
}

/**
 * Fetch all rows from a Supabase table with pagination support
 */
async function fetchTableData(tableName) {
  const PAGE_SIZE = 1000;
  let allRows = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      // Table may not exist or query error
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

/**
 * Main Database Backup Execution Function
 */
async function runDatabaseBackup({ silent = false } = {}) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../backups/database');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  if (!silent) {
    console.log(`\n======================================================================`);
    console.log(`🚀 [AITAG Backup Engine] Initiating Full Unified DB Snapshot`);
    console.log(`   Database URL: https://byekbjxiowkrtwpsxevz.supabase.co`);
    console.log(`   Timestamp:    ${new Date().toISOString()}`);
    console.log(`======================================================================`);
  }

  const backupData = {
    backup_version: '1.0.0',
    timestamp: new Date().toISOString(),
    database_url: 'https://byekbjxiowkrtwpsxevz.supabase.co',
    table_counts: {},
    total_records: 0,
    tables: {},
    local_stores: {}
  };

  // 1. Fetch all Supabase tables
  for (const table of SUPABASE_TABLES) {
    try {
      const { rows, error } = await fetchTableData(table);
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

  // 2. Fetch local JSON store fallbacks
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

  // 3. Serialize and save locally
  const jsonStr = JSON.stringify(backupData, null, 2);
  const baseFilename = `aitag_backup_${timestamp}`;
  const localJsonPath = path.join(backupDir, `${baseFilename}.json`);
  const localGzPath = path.join(backupDir, `${baseFilename}.json.gz`);

  fs.writeFileSync(localJsonPath, jsonStr, 'utf8');
  const compressedBuffer = zlib.gzipSync(Buffer.from(jsonStr, 'utf8'), { level: 9 });
  fs.writeFileSync(localGzPath, compressedBuffer);

  const rawKb = (Buffer.byteLength(jsonStr) / 1024).toFixed(1);
  const gzKb = (compressedBuffer.length / 1024).toFixed(1);

  if (!silent) {
    console.log(`\n💾 [Local Storage] Snapshot saved:`);
    console.log(`   JSON: ${localJsonPath} (${rawKb} KB)`);
    console.log(`   GZIP: ${localGzPath} (${gzKb} KB)`);
  }

  // 4. Stream to Google Cloud Storage
  let gcsResult = null;
  const { bucket, bucketName } = initGCS();

  if (bucket) {
    try {
      const gcsDestination = `backups/database/${baseFilename}.json.gz`;
      const gcsFile = bucket.file(gcsDestination);

      await gcsFile.save(compressedBuffer, {
        contentType: 'application/gzip',
        metadata: {
          timestamp: backupData.timestamp,
          total_records: String(backupData.total_records),
          backup_version: backupData.backup_version,
          database_url: backupData.database_url
        },
        resumable: false
      });

      // Update latest pointer manifest
      const latestManifest = {
        latest_backup: `${baseFilename}.json.gz`,
        gcs_uri: `gs://${bucketName}/${gcsDestination}`,
        timestamp: backupData.timestamp,
        total_records: backupData.total_records,
        table_counts: backupData.table_counts,
        raw_size_bytes: Buffer.byteLength(jsonStr),
        gz_size_bytes: compressedBuffer.length
      };

      const latestFile = bucket.file('backups/database/latest.json');
      await latestFile.save(JSON.stringify(latestManifest, null, 2), {
        contentType: 'application/json',
        resumable: false
      });

      gcsResult = {
        success: true,
        gcsUri: `gs://${bucketName}/${gcsDestination}`,
        bucketName
      };

      if (!silent) {
        console.log(`☁️  [GCS Cloud Storage] Upload successful:`);
        console.log(`   URI:    gs://${bucketName}/${gcsDestination}`);
        console.log(`   Latest: gs://${bucketName}/backups/database/latest.json`);
      }
    } catch (gcsErr) {
      console.warn(`⚠️ [BackupEngine] GCS upload notice:`, gcsErr.message);
      gcsResult = { success: false, error: gcsErr.message };
    }
  } else {
    if (!silent) console.log(`ℹ️  [GCS Cloud Storage] Skipped (no active credentials configured)`);
    gcsResult = { success: false, skipped: true };
  }

  // Prune local backups older than 14 days to preserve disk
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
  } catch (pruneErr) {}

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  if (!silent) {
    console.log(`\n🎉 [AITAG Backup Engine] Completed successfully in ${durationSec}s`);
    console.log(`   Total Records: ${backupData.total_records}`);
    console.log(`======================================================================\n`);
  }

  return {
    success: true,
    timestamp: backupData.timestamp,
    totalRecords: backupData.total_records,
    tableCounts: backupData.table_counts,
    localJsonPath,
    localGzPath,
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

