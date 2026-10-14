# 🛠️ AITAG Platform Troubleshooting & Debugging Runbook

> **Target Platform:** AITAG SaaS AI Freelance Marketplace  
> **Location:** `workflows/troubleshooting_and_debugging.md`  
> **Audience:** AI Coding Assistants, LLMs, and System Administrators  
> **Purpose:** Rapid triage and resolution scripts for common development, testing, and deployment issues.

---

## 🔍 Diagnostic Matrix at a Glance

| Symptom / Error | Root Cause | Resolution Command / Action |
| :--- | :--- | :--- |
| `EADDRINUSE: address already in use :::8000` | Previous server daemon process still active on port 8000 | Find PID with `Get-NetTCPConnection` and kill process |
| PIET test fails on Gate 1 | Ephemeral Twin port 5005 occupied or network failure | Ensure port 5005 is free; PIET auto-boots twin |
| Frontend changes not showing on `http://localhost:8000` | `server/public/` has not been recompiled from `client/` | Run `npm run build` |
| `Cannot find module './features/...'` | Missing slice dependency or wrong relative path in kernel | Check `feature.manifest.json` and slice directory |
| Supabase connection timeout / IPv6 drop | Direct connection string blocked on IPv4 network | Use HTTPS PostgREST or Supavisor pooler (port 6543) |
| Stale data returned on repeat API call | Cache entry still active before TTL expires | Send `POST /api/cache/purge` with `{ "tag": "<tag>" }` |
| Registration fails with `HTTP 400` | Submitted `role: 'admin'` or trivial password | Admin accounts must be seeded or assigned via database |

---

## 1. Port 8000 Conflict Resolution

If the server crashes on boot with `EADDRINUSE`:

```powershell
# 1. Find process ID holding port 8000
$pid_to_kill = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

# 2. Terminate the process cleanly
if ($pid_to_kill) {
    Stop-Process -Id $pid_to_kill -Force
    Write-Host "Killed process $pid_to_kill on port 8000"
}

# 3. Restart server
npm run dev
```

---

## 2. Frontend Build Synchronization

The Node.js server does NOT serve `client/src` directly in production mode; it serves static pre-compiled bundles from `server/public/`.

Whenever you modify any file inside `client/src/`:
```powershell
npm run build
```
This script:
1. Installs client dependencies (if needed).
2. Executes `vite build` to output optimized assets into `client/dist/`.
3. Copies `client/dist/` into `server/public/`.

---

## 3. PIET Test Suite Triage

When `npm test` fails, identify the gate:
- **Gate 1 Fail:** Network or port 5005 issue. Check `Get-NetTCPConnection -LocalPort 5005`.
- **Gate 2 Fail:** A slice manifest or route file is missing or invalid JSON. Check `server/features/<slice>/feature.manifest.json`.
- **Gate 3 Fail:** Supabase table or query failure. Check if Supabase keys in `.env` / `.env.development` are active.
- **Gate 4 Fail:** Business rule regression (e.g. task budget < ₹499 or package price_min > price_max).
- **Gate 5 Fail:** Order state machine issue (e.g. expert assignment missing email).
- **Gate 6 Fail:** Commission calculation mismatch (platform fee must equal 5% of agreed price).
- **Gate 7 Fail:** Security invariant regression (e.g. missing security headers or unredacted password hashes).
- **Gate 8 Fail:** Cache layer issue (e.g. missing ETag, failed 304 response, or stale tag index).

---

## 4. Cache Purging & Reset

If you suspect stale data in local development or after a manual database edit:

```powershell
# Purge all cached entries instantly
Invoke-RestMethod -Uri http://localhost:8000/api/cache/purge -Method POST -Body "{}" -ContentType "application/json"

# Check cache health and active keys
Invoke-RestMethod -Uri http://localhost:8000/api/cache/stats
```

---

## 5. Ephemeral Test Order Cleanup (Ghost Record Prevention)

If a test fails mid-run before its teardown block finishes:
```javascript
// Clean up any lingering PIET test orders manually:
const supabase = require('./server/supabase');
await supabase.from('aitag_orders').delete().ilike('customer_email', '%@aitag-test.local');
```
This guarantees that automated test runs never pollute real customer orders.
