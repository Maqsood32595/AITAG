# AITAG Admin Intelligence & Multi-Status Report Generation Engine
## Architectural Specification & Implementation Blueprint
### Dedicated 19th Fractal Kernel Slice: `aitag-admin-reports`

> **Document Status:** Architectural Specification & Implementation Blueprint  
> **Target Kernel Slice:** `server/features/aitag-admin-reports/`  
> **Route Base Path:** `/api/admin/reports`  
> **Authorization Level:** Strict Admin RBAC (`role === 'admin'`)  
> **Target Currency:** Indian Rupee (`₹` INR) & Section 194-O TDS Compliance  
> **Safety Invariants:** Zero-Mock Resilient In-RAM Twin, Zero Ghost Records, Strict Communication Integrity  

---

## 1. Executive Summary & Problem Formulation

As AITAG scales across fixed-price Pilot Packages and open Marketplace Tasks, administrators require unified, cross-status intelligence to govern operations, detect delivery bottlenecks, track financial escrow liabilities, and satisfy statutory tax obligations under Section 194-O of the Indian Income Tax Act.

Currently, operational analytics are distributed or view-only in `/api/analytics`. There is no dedicated multi-status report generation engine that allows administrators to:
1. Audit the complete state machine lifecycle across **all statuses** for both Orders and Tasks.
2. Detect SLA bottlenecks and aging delays (e.g. unassigned orders >24h, revisions >48h).
3. Compute exact Escrow Balances Held vs. Released.
4. Generate compliance-ready **Section 194-O TDS (1%) tax ledgers** for Indian tax filings (Form 26Q).
5. Stream RFC 4180-compliant CSV and JSON reports directly from the platform.

In accordance with AITAG's **Fractal Kernel Architecture** (DOI: 10.5281/zenodo.21622791), this feature is architected as an isolated, self-contained 19th kernel slice (`aitag-admin-reports`) with zero modifications to the root kernel loader (`server/kernel.js`).

---

## 2. Multi-Status Domain Inventory Across AITAG

The reporting engine unifies and normalizes statuses across every business domain:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               AITAG MULTI-STATUS MATRIX                                │
├─────────────────────────┬───────────────────────────────────┬──────────────────────────┤
│ DOMAIN ENTITY           │ FULL LIFECYCLE STATUSES           │ METRICS & SLA AGING      │
├─────────────────────────┼───────────────────────────────────┼──────────────────────────┤
│ Service Orders          │ • REQUESTED                       │ • Dwell time in stage    │
│ (aitag_orders)          │ • MATCHED                         │ • >24h unassigned alert  │
│                         │ • ACTIVE                          │ • >48h revision alert    │
│                         │ • DRAFT_SUBMITTED                 │ • 5% platform fee        │
│                         │ • REVISION                        │ • Customer satisfaction  │
│                         │ • COMPLETED                       │                          │
│                         │ • CANCELLED                       │                          │
├─────────────────────────┼───────────────────────────────────┼──────────────────────────┤
│ Marketplace Tasks       │ • open                            │ • Time-to-first-bid      │
│ (aitag_tasks)           │ • in-progress                     │ • Bid density (<2 = low) │
│                         │ • completed                       │ • Category distribution  │
│                         │ • cancelled                       │ • 10% platform fee       │
├─────────────────────────┼───────────────────────────────────┼──────────────────────────┤
│ Specialist Bids         │ • pending                         │ • Acceptance velocity    │
│ (aitag_bids)            │ • accepted                        │ • Win rate per expert    │
│                         │ • rejected                        │ • Price variance vs cap  │
├─────────────────────────┼───────────────────────────────────┼──────────────────────────┤
│ Digital Escrow & Tax    │ • HELD (In Escrow)                │ • Trustee escrow balance │
│ (escrow-payment)        │ • RELEASED (Disbursed)            │ • Sec 194-O 1% TDS       │
│                         │ • REFUNDED                        │ • Net expert payout      │
│                         │ • DISPUTED                        │ • PAN audit trail        │
├─────────────────────────┼───────────────────────────────────┼──────────────────────────┤
│ Vetted Specialists      │ • Active Workload                 │ • On-time delivery %     │
│ (aitag_profiles)        │ • Idle / Available                │ • Revision index         │
│                         │ • Suspended                       │ • 5-star rating avg      │
├─────────────────────────┼───────────────────────────────────┼──────────────────────────┤
│ Discussions & Comms     │ • Active Thread                   │ • Admin response latency │
│ (aitag_case_discussions)│ • Awaiting Admin Response         │ • Asset storage load     │
│                         │ • Resolved                        │ • PII Leakage violations │
└─────────────────────────┴───────────────────────────────────┴──────────────────────────┘
```

---

## 3. The 5 Core Admin Reports Specification

### Report 1: All-Statuses Order Lifecycle & Bottleneck Audit Report
* **Target Audience:** Operations Leads & Platform Admins.
* **Filter Dimensions:** Status (`REQUESTED`, `MATCHED`, `ACTIVE`, `DRAFT_SUBMITTED`, `REVISION`, `COMPLETED`, `CANCELLED`), Date Range, Package Slug, Aging Alert (`ALL` vs `BREACHED`).
* **Schema & Export Columns:**
  1. `Order Number` (e.g. `AITAG-2026-X7A1`)
  2. `Package & Tier` (e.g. "AI Product Photo Makeover - Medium")
  3. `Client Name & Email`
  4. `Assigned Specialist` (Name, Email, or "UNASSIGNED")
  5. `Current Status`
  6. `Stage Dwell Hours` (Exact hours in current status)
  7. `SLA Breach Flag` (`NORMAL`, `WARNING >24H`, `CRITICAL >48H`)
  8. `Contracted Price (₹)`
  9. `Platform Fee 5% (₹)`
  10. `Specialist Payout (₹)`
  11. `Deliverables Count` & `Revision Count`
  12. `Last Updated Timestamp`

### Report 2: Financial, Escrow & Section 194-O TDS Compliance Audit Report
* **Target Audience:** Finance Admins, Chartered Accountants & Tax Auditors.
* **Filter Dimensions:** Financial Quarter (Q1-Q4), Date Range, Settlement Status (`HELD`, `RELEASED`, `REFUNDED`).
* **Statutory Compliance Rules:**
  - **Section 194-O (Income Tax Act, 1961):** Every e-commerce operator facilitating sales/services must deduct 1% TDS on gross payouts to e-commerce participants.
  - **Formula:**
    $$\text{Gross Amount} = A$$
    $$\text{Platform Commission} = \text{round}(A \times 0.05 \text{ or } 0.10)$$
    $$\text{Section 194-O TDS (1\%)} = \text{round}(A \times 0.01)$$
    $$\text{Net Specialist Payout} = A - (\text{Commission} + \text{TDS})$$
* **Schema & Export Columns:**
  1. `Transaction Reference ID`
  2. `Related Entity ID` (Order Number or Task ID)
  3. `Specialist Legal Name & PAN / Tax ID`
  4. `Client Name & Location`
  5. `Gross Transaction Value (₹)`
  6. `Platform Revenue Retained (₹)`
  7. `Section 194-O TDS Withheld (1%) (₹)`
  8. `Net Payout Disbursed (₹)`
  9. `Escrow State` (`HELD_IN_TRUST`, `RELEASED_TO_BENEFICIARY`, `REFUNDED_TO_ORIGIN`)
  10. `Settlement Date & Bank Reference`

### Report 3: Marketplace Task & Bidding Pipeline Report
* **Target Audience:** Growth Admins & Category Managers.
* **Filter Dimensions:** Category (`Product Visuals`, `E-Commerce & Copy`, `Social & Marketing`, `Web & Funnels`), Task Status (`open`, `in-progress`, `completed`, `cancelled`), Liquidity Flag (`STARVED <2 Bids`, `HEALTHY >=2 Bids`).
* **Schema & Export Columns:**
  1. `Task ID` & `Title`
  2. `Category`
  3. `Client Name & Email`
  4. `Budget Cap (₹)`
  5. `Status`
  6. `Total Proposals Received`
  7. `Bid Price Range (Min ₹ — Max ₹)`
  8. `Winning Proposal Amount (₹)`
  9. `Winning Specialist Name`
  10. `Time from Post to Award (Hours)`
  11. `Time from Award to Completion (Hours)`

### Report 4: AI Specialist Performance, Quality & Rating Dossier
* **Target Audience:** Talent Operations & Quality Assurance.
* **Filter Dimensions:** Specialist Tier, Rating Threshold (e.g. `<4.0` or `>=4.8`), Active vs Inactive.
* **Schema & Export Columns:**
  1. `Specialist ID` & `Legal Name`
  2. `Email Address`
  3. `Vetted Specialist Status` (`VERIFIED`, `PROBATIONARY`)
  4. `Primary Skill Category`
  5. `Active Projects Underway`
  6. `Total Lifetime Projects Completed`
  7. `On-Time Delivery Rate (%)`
  8. `First-Pass Approval Rate (%)` (Approved without revision)
  9. `Average Client Star Rating` (1.00 - 5.00)
  10. `Total Revisions Incurred`
  11. `Cumulative Net Earnings (₹)`
  12. `Total Section 194-O TDS Remitted (₹)`

### Report 5: Communications, SLA & Security Shield Audit Report
* **Target Audience:** Trust & Safety Admins.
* **Filter Dimensions:** Entity Type (`order`, `task`), Active vs Closed, Leakage Flag (`CLEAN`, `INTERCEPTED`).
* **Schema & Export Columns:**
  1. `Discussion Thread ID`
  2. `Entity Reference` (Order Number / Task Title)
  3. `Client Email` & `Specialist Email`
  4. `Total Exchange Messages`
  5. `Admin Involvements Count`
  6. `Client Waiting Hours for Response`
  7. `Shared Asset Count` & `Total Storage Size (MB)`
  8. `Leakage Shield Interceptions Count` (Phone/Email off-platform bypass attempts blocked)

---

## 4. Fractal Kernel Slice Architecture: `aitag-admin-reports`

### Directory Layout
```
server/features/aitag-admin-reports/
├── feature.manifest.json       # Manifest declaring metadata and /api/admin/reports basePath
├── routes.js                    # Router + strict Admin RBAC guard + CSV streaming endpoints
├── service.js                   # Master reporting orchestrator with resilient In-RAM twin fallback
└── aggregators/                 # Grandchild computation modules
    ├── lifecycle-report.js      # All-statuses state machine aggregator + SLA aging engine
    ├── financial-report.js      # Escrow reconciliation + Section 194-O TDS ledger engine
    ├── marketplace-report.js    # Task pipeline, category liquidity, and bid velocity
    ├── specialist-report.js     # Quality metrics, revision ratios, and ratings dossier
    └── csv-stream-builder.js    # RFC 4180 CSV serializer with XSS/comma-escape protection
```

### 4.1 Feature Manifest (`feature.manifest.json`)
```json
{
  "id": "aitag-admin-reports",
  "name": "AITAG Admin Intelligence & Multi-Status Reports Engine",
  "version": "1.0.0",
  "enabled": true,
  "basePath": "/api/admin/reports",
  "description": "Dedicated Admin-only reporting engine providing multi-status lifecycle audits, Section 194-O TDS tax ledgers, escrow reconciliations, and instant RFC 4180 CSV report downloads.",
  "author": "AITAG Architectural Core",
  "dependencies": ["aitag-auth", "aitag-service-orders", "aitag-tasks", "escrow-payment", "aitag-case-discussions"]
}
```

### 4.2 Security Middleware: Strict Role-Based Access Control
```javascript
// server/features/aitag-admin-reports/routes.js
const { authMiddleware } = require('../aitag-auth/routes');

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied: Platform reporting is strictly restricted to administrator accounts' 
    });
  }
  next();
};

router.use(authMiddleware);
router.use(requireAdmin);
```

### 4.3 API Endpoint Contract

| Method | Route | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/reports/overview` | `from`, `to` | High-level status rollups, SLA breaches, active escrow balance, TDS pool |
| `GET` | `/api/admin/reports/lifecycle` | `status`, `package`, `breachOnly`, `from`, `to` | Detailed order & task items across all statuses with dwell hours |
| `GET` | `/api/admin/reports/financials`| `quarter`, `status`, `from`, `to` | Escrow ledger, platform revenue, Section 194-O TDS compliance table |
| `GET` | `/api/admin/reports/marketplace`| `category`, `status`, `from`, `to` | Custom task pipeline, bid density, and fulfillment turnaround |
| `GET` | `/api/admin/reports/specialists`| `minRating`, `tier`, `vetted` | Specialist scorecard, revision rates, capacity, and net payouts |
| `GET` | `/api/admin/reports/export/:type`| `format=csv`, `from`, `to`, `status` | Direct RFC 4180 CSV file download (`Content-Disposition: attachment`) |

### 4.4 Resilient Ephemeral In-RAM Twin Invariant
In accordance with PIET zero-mock testing principles:
- If Supabase is connected: Queries `aitag_orders`, `aitag_tasks`, `aitag_bids`, and `aitag_case_discussions` with optimized indexed queries.
- If Supabase is offline / unreachable: Queries the live In-RAM Map data stores from `aitag-service-orders/service.js` and `aitag-tasks/service.js`, ensuring zero downtime, 100% offline capability, and reliable test passes.

---

## 5. Frontend Admin Intelligence UI Blueprint

### Component Location: `client/src/components/AdminReportsPanel.tsx`
Integrated seamlessly into `client/src/pages/Dashboard.tsx` for `admin` accounts.

### UI Structure & Visual Hierarchy
1. **Header & Filter Toolbar:**
   - **Date Range Selector:** `All Time`, `This Month`, `Last 30 Days`, `Last 7 Days`.
   - **Status Quick-Filter Pills:** Dynamic badges displaying live counts for each stage:
     - `ALL (14)` • `REQUESTED (3)` • `MATCHED (2)` • `ACTIVE (4)` • `DRAFT_SUBMITTED (1)` • `REVISION (1)` • `COMPLETED (3)`
2. **Executive Metric Cards:**
   - **Active Escrow Balance Held:** `₹18,495` *(Protected in RBI trustee escrow)*
   - **Platform Commission Retained:** `₹2,997` *(Net retained revenue)*
   - **Section 194-O TDS Withheld:** `₹410` *(Automated 1% tax pool for Form 26Q)*
   - **Critical SLA Bottlenecks:** `1 Order >24h Unassigned` *(Red pulse warning)*
3. **1-Click Export Action Bar:**
   - 📥 `Export Orders Lifecycle (CSV)`
   - 📥 `Export Section 194-O TDS Ledger (CSV)`
   - 📥 `Export Marketplace Pipeline (CSV)`
   - 📥 `Export Specialist Quality Dossier (CSV)`
4. **Live Interactive Data Table:**
   - Columns: Reference ID | Customer | Assigned Specialist | Stage Status Badge | Dwell Time (Hours) | Amount (₹) | TDS (₹) | Actions.
   - Status Badges styled with curated semantic color palette.
   - Aging indicator: Yellow chip if `>24h`, Red pulsing chip if `>48h`.
   - Action buttons: "Open Discussion", "Reassign Expert", "Audit Tax Record".

---

## 6. PIET Zero-Mock Automated Test Specification

The test harness in `tests/piet/piet.mjs` will be expanded with targeted assertions:

```javascript
// Gate 1: Falsification & Security Boundaries
await t('Rejects unauthenticated report overview with HTTP 401', async () => {
  const res = await requestJson('/api/admin/reports/overview');
  eq(res.status, 401, 'Unauthenticated report request must return 401');
});

await t('Rejects client role accessing admin reports with HTTP 403 Forbidden', async () => {
  const clientToken = generateToken({ email: 'client@aitag.com', role: 'client' });
  const res = await requestJson('/api/admin/reports/overview', {
    headers: { Authorization: `Bearer ${clientToken}` }
  });
  eq(res.status, 403, 'Client token must be blocked with 403 Forbidden');
});

await t('Rejects specialist role accessing admin reports with HTTP 403 Forbidden', async () => {
  const expertToken = generateToken({ email: 'expert@aitag.com', role: 'freelancer' });
  const res = await requestJson('/api/admin/reports/overview', {
    headers: { Authorization: `Bearer ${expertToken}` }
  });
  eq(res.status, 403, 'Specialist token must be blocked with 403 Forbidden');
});

// Gate 2: AST & Manifest Discovery
await t('Verifies aitag-admin-reports manifest exists and mounts as 19th slice', async () => {
  const res = await requestJson('/api/features');
  const ids = res.data.map(f => f.id);
  assert(ids.includes('aitag-admin-reports'), 'Kernel missing aitag-admin-reports slice');
});

// Gate 6: Deep Domain Math & CSV Export
await t('Validates Section 194-O TDS (1%) and Escrow reconciliation math', async () => {
  const adminToken = generateToken({ email: 'admin@aitag.com', role: 'admin' });
  const res = await requestJson('/api/admin/reports/financials', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  eq(res.status, 200, 'Admin reports financials must return 200');
  assert(res.data.tdsSummary.totalTdsDeducted >= 0, 'TDS total must be positive number');
});

await t('Validates CSV streaming export produces valid RFC 4180 text/csv', async () => {
  const adminToken = generateToken({ email: 'admin@aitag.com', role: 'admin' });
  const res = await fetch(`${BASE}/api/admin/reports/export/orders`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  eq(res.status, 200, 'CSV export must return 200 OK');
  assert(res.headers.get('content-type').includes('text/csv'), 'Header must be text/csv');
  const csvBody = await res.text();
  assert(csvBody.includes('Order Number,Package,Status'), 'CSV must contain required headers');
});
```

---

## 7. Step-by-Step Implementation Roadmap

When the user initiates implementation:
1. **Phase 1 — Slice Scaffold:** Create `server/features/aitag-admin-reports/feature.manifest.json` and `routes.js`.
2. **Phase 2 — Grandchild Aggregators:** Implement `lifecycle-report.js`, `financial-report.js`, `specialist-report.js`, and `csv-stream-builder.js`.
3. **Phase 3 — Master Service:** Wire `service.js` with live Supabase aggregation and fallback In-RAM twin stores.
4. **Phase 4 — Frontend UI:** Build `AdminReportsPanel.tsx` and integrate it into `client/src/pages/Dashboard.tsx` with role guard `user?.role === 'admin'`.
5. **Phase 5 — PIET Falsification Tests:** Update `tests/piet/piet.mjs` to test 19 slices, 401/403 security, status aggregations, and CSV download.
6. **Phase 6 — Build & Verification:** Run `npm test` and `npm run build` to verify 100% test pass rate and pristine production bundle.
