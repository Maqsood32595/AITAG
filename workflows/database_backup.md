# 🛡️ AITAG Database Architecture, Synchronization & Backup Guide

> **Scope:** Multi-Environment Supabase PostgreSQL, Google Cloud Storage & In-RAM Twin  
> **Target Environments:** Localhost (`port 8000`), Render (`aitag-dev`), Cloud Run (`aitag.in` / `shortshub.app`)  
> **Status:** Active & Production-Ready  
> **Last Updated:** November 2026

---

## 1. High-Level Architecture Overview

To eliminate data desynchronization while 100% protecting live customer data from test churn, AITAG implements a **Production + Warm Standby Replica + Off-Site GCS Cold Storage** strategy:

```mermaid
flowchart TD
    subgraph Live Production
        PROD["Production Supabase DB<br/>(byekbjxiowkrtwpsxevz)<br/>Powers: Render & Cloud Run"]
    end

    subgraph Cold Storage
        GCS["Google Cloud Storage<br/>(gs://shortshub_video_storage/backups/)<br/>Automated Daily .json.gz"]
    end

    subgraph Local Development & Hot Standby
        DEV["Dev / Standby Supabase DB<br/>(trdwewugrqdpopzqhkuk)<br/>Powers: localhost:8000 & Tests"]
    end

    PROD -->|Daily Background Scheduler| GCS
    PROD ==>|npm run db:sync:prod-to-dev<br/>(Run before local work or every 5 days)| DEV
    DEV -->|Safe Local Testing & Experiments| LOCAL["Local Workstation (Port 8000)"]
```

---

## 2. Environment Connection Registry

| Environment | Role | Supabase Project Ref | Direct URL | Configuration File |
| :--- | :--- | :--- | :--- | :--- |
| **Production** | Live Users & Traffic | `byekbjxiowkrtwpsxevz` | `https://byekbjxiowkrtwpsxevz.supabase.co` | `.env` (Render / Cloud Run) |
| **Development / Standby** | Localhost & Automated Tests | `trdwewugrqdpopzqhkuk` | `https://trdwewugrqdpopzqhkuk.supabase.co` | `.env.development` (Local Port 8000) |
| **Cold Storage** | Disaster Recovery | N/A | `gs://shortshub_video_storage/backups/database/` | `server/shortshub-service-account.json` |

---

## 3. Quick Reference: Core Commands

| Goal | Command | Description |
| :--- | :--- | :--- |
| **Sync Prod ➔ Dev** | `npm run db:sync:prod-to-dev` | Clones all Production tables into Dev in **~6 seconds**. Run before local coding or every 5 days. |
| **Take Full Backup** | `npm run db:backup` | Takes a full snapshot of all 9 tables + local stores, compresses to GZIP, and uploads to GCS bucket. |
| **Inspect Latest Backup** | `node server/scripts/restore_database.js --inspect` | Displays table counts, record totals, and timestamp of the latest local or cloud snapshot. |
| **Verify Restore (Dry Run)** | `npm run db:restore -- --dry-run` | Simulates a database restore without altering or modifying any live data. |
| **Execute Live Restore** | `npm run db:restore -- --execute --confirm=RESTORE_NOW` | Applies a full snapshot restore directly to Supabase tables. |
| **Run Safe Test Suite** | `npm test` | Runs the 78-assertion PIET test suite **strictly inside the isolated Dev database**. |

---

## 4. How the Production-to-Dev Synchronization Works

### Why Run It?
During local development and testing, test accounts are created, modified, or deleted (`DELETE /api/account`). Having Local connect to Dev keeps your real production customer orders and credentials **100% safe**. 

Running the sync command refreshes Dev with real data so you always develop against live-like content (including Expert 1's real video, real packages, and active workflows).

### How to Run:
```powershell
npm run db:sync:prod-to-dev
```

### What Happens Internally:
1. **Safety Wipe:** Dev database tables are cleared in reverse foreign-key order (`aitag_case_messages` ➔ `aitag_orders` ➔ `aitag_invitations` ➔ `aitag_bids` ➔ `aitag_tasks` ➔ `aitag_profiles` ➔ `aitag_package_tiers` ➔ `aitag_packages` ➔ `aitag_users`).
2. **Extraction:** All records from Production are read via paginated PostgREST queries.
3. **Insertion:** Records are inserted into Dev in forward foreign-key order.
4. **Execution Time:** ~6 seconds.

---

## 5. Automated Google Cloud Storage (GCS) Backups

### Automatic 24-Hour Schedule
Integrated directly into `server/index.js`:
- An unref'd non-blocking timer runs `runDatabaseBackup()` every 24 hours.
- On server startup, it checks if a snapshot exists from the last 12 hours. If not, it takes one automatically after 60 seconds.
- Local snapshots older than 14 days are automatically pruned to conserve disk space.

### Cloud Storage Location
Backups are archived permanently in your Google Cloud Storage bucket:
```
gs://shortshub_video_storage/backups/database/aitag_backup_<timestamp>.json.gz
gs://shortshub_video_storage/backups/database/latest.json
```

### Tables Included in Every Snapshot:
1. `aitag_users` (credentials, roles, avatars)
2. `aitag_profiles` (expert bios, skills, delivered workflows, video paths)
3. `aitag_tasks` (marketplace briefs, budgets, attachments)
4. `aitag_bids` (freelancer proposals, rates)
5. `aitag_orders` (8-stage customer service orders)
6. `aitag_packages` (pilot product packages)
7. `aitag_package_tiers` (pricing tiers in INR)
8. `aitag_case_messages` (order & task discussion messages with assets)
9. `aitag_invitations` (client-to-expert direct invitations)
10. Local Stores (`contact_inquiries`, `expert_applications`, `case_discussions_store`)

---

## 6. Disaster Recovery Scenarios

### Scenario A: Local Development Needs Fresh Data
* **Problem:** Local database has messy dummy tasks or deleted test accounts from running tests.
* **Solution:**
  ```powershell
  npm run db:sync:prod-to-dev
  ```
  Dev is restored to a clean mirror of Production in 6 seconds.

### Scenario B: Accidentally Dropped Table or Corrupted Data in Production
* **Step 1:** Inspect the latest known-good snapshot:
  ```powershell
  node server/scripts/restore_database.js --inspect
  ```
* **Step 2:** Test restore dry-run:
  ```powershell
  npm run db:restore -- --dry-run
  ```
* **Step 3:** Perform live restore:
  ```powershell
  npm run db:restore -- --execute --confirm=RESTORE_NOW
  ```
* **Instant Failover Option:** Because Dev (`trdwewugrqdpopzqhkuk`) is a live PostgreSQL clone of Prod, you can also instantly redirect Render/Cloud Run to Dev by changing `SUPABASE_URL` in the environment settings in under 30 seconds.
