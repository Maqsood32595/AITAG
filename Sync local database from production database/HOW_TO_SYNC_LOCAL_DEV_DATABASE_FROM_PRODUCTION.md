# AITAG — How to Synchronize Local Development Database from Production

This SOP (Standard Operating Procedure) documents the exact, automated steps to replicate the live **Production Supabase Database** into the **Local Development / Standby Supabase Database**.

When the user requests:
> *"Sync local database from production database"* or *"transfer production database data to dev database"*

Follow the instructions in this runbook to perform the replication safely with 100% data fidelity.

---

## 1. Database Architecture & Credentials

| Environment | Supabase Project ID | Dashboard / API URL | Env File |
| :--- | :--- | :--- | :--- |
| **Source (Production)** | `byekbjxiowkrtwpsxevz` | `https://byekbjxiowkrtwpsxevz.supabase.co` | `.env` |
| **Target (Local Dev / Standby)** | `trdwewugrqdpopzqhkuk` | `https://trdwewugrqdpopzqhkuk.supabase.co` | `.env.development` |

* **Zero Risk to Production:** Data flow is strictly **one-way: Production ➔ Development**. Production is read-only during the sync; only the Development replica database is wiped and refreshed.
* **Storage Fidelity:** Cloud media (GCS bucket: `shortshub_video_storage`) remains untouched, and stream URLs (`/api/profile/workflows/stream-video?path=...`) resolve identical media in both environments.

---

## 2. Fast One-Command Sync

To execute the entire synchronization end-to-end, run this command from the root `D:\Hayat\AITAG` directory:

```powershell
npm run db:sync:prod-to-dev
```

*Equivalent direct Node command:*
```powershell
node server/scripts/sync_prod_to_dev.js
```

---

## 3. What the Synchronization Engine Does

The underlying script (`server/scripts/sync_prod_to_dev.js`) executes these automated steps:

### Step 1: Pre-Flight Credential Resolution
- Loads `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` from `.env` (Source: Production).
- Loads `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` from `.env.development` (Target: Dev).
- Verifies both service-role keys are non-empty and authorized.

### Step 2: Safe Reverse-Foreign-Key Cleanup of Dev Database
Cleans stale records from the development database in reverse foreign key order to prevent relational constraint violations:
1. `aitag_case_messages`
2. `aitag_orders`
3. `aitag_invitations`
4. `aitag_bids`
5. `aitag_tasks`
6. `aitag_profiles`
7. `aitag_package_tiers`
8. `aitag_packages`
9. `aitag_users`

### Step 3: Forward-Dependency Table Extraction & Batch Cloning
Extracts all rows from Production in pages of 1,000 rows and inserts them into Development in batches of 100:
1. `aitag_users` (All user accounts, roles: client, freelancer, admin)
2. `aitag_packages` (Catalog package entities)
3. `aitag_package_tiers` (Pricing tiers: ₹499, ₹1,499, ₹1,999)
4. `aitag_profiles` (Delivered workflows, video reel paths, headlines, bios, UPI IDs)
5. `aitag_tasks` (Posted tasks, brief attachments, milestones)
6. `aitag_bids`
7. `aitag_invitations`
8. `aitag_orders` (Active service contracts, milestone states)
9. `aitag_case_messages` (Client-expert-admin chat messages & directives)

### Step 4: Local Disk Cache Invalidation
Purges stale JSON files from `server/data/profiles/*.json` so the local server immediately serves live Supabase data rather than offline disk snapshots.

---

## 4. Post-Sync Verification & Server Restart

After running the sync, restart the local server to clear any in-memory profile caches (`PROFILES_CACHE`):

### 1. Stop and Restart the Local Dev Server
```powershell
# Kill any existing node process on port 8000 if running
# Then launch fresh on port 8000:
$env:PORT="8000"; $env:NODE_ENV="development"; node server/index.js
```

### 2. Verify Expert 1 Profile & Work Reels
Run this command to verify that delivered workflows and video reels were synchronized properly:

```powershell
node -e "
const http = require('http');
http.get('http://localhost:8000/api/profile/0eaa9c88-d477-4308-bd37-f7ccf29c87f1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Specialist:', json.name);
    json.deliveredWorkflows.forEach((wf, i) => {
      console.log('Reel ' + (i+1) + ': [' + wf.category + '] ' + wf.title);
      console.log('   Video: ' + (wf.demoVideoUrl || wf.mediaUrl));
    });
  });
});
"
```

**Expected Video Mapping:**
- **Reel 1 (Branding & Print):** `1794608454365_Gift_Wrapping_Video.mp4`
- **Reel 2 (Social & Marketing):** `1795101059170_Shark.mp4`
- **Reel 3 (Web & Digital Presence):** `1795100852475_Website_Built_By_Gemma.mp4`
- **Reel 4 (Product Visuals):** `1795251034494_Mountview_Flowers_With_Voice_Loud.mp4` *(Mountview Flowers Reel)*

### 3. Run PIET Automated Test Suite
```powershell
npm test
```
*Expected Result:* **78 Passed, 0 Failed out of 78 Assertions**.

---

## 5. Summary Checklist for Future Executions

When instructed to sync the database, execute:

```powershell
# 1. Sync Prod to Dev
npm run db:sync:prod-to-dev

# 2. Re-verify tests
npm test

# 3. Ensure dev server is running on port 8000 with dev database
$env:PORT="8000"; $env:NODE_ENV="development"; node server/index.js
```
