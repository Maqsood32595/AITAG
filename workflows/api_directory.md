# 🌐 AITAG Platform API Directory & Route Reference

> **Target Platform:** AITAG SaaS AI Freelance Marketplace  
> **Location:** `workflows/api_directory.md`  
> **Status:** Active Reference for Fractal Kernel (15 Slices)  
> **Base URL:** `http://localhost:8000` (Dev) / `https://aitag-dev.onrender.com` (Prod)  
> **Auto-Discovery Endpoint:** `GET /api/features`

---

## ⚡ Golden Rules for API Development & Consumption

1. **Manifest-Driven Slices:** Every API slice lives in `server/features/<slice-name>/` with a `feature.manifest.json`.
2. **Never Invent Routes:** Client components must strictly call endpoints cataloged here.
3. **Authentication:** Protected endpoints require header: `Authorization: Bearer <jwt-token>`.
4. **Caching Invariant:** GET endpoints using `cacheGuard` return `X-Cache: HIT` or `X-Cache: MISS` and deterministic `ETag` headers. Matching `If-None-Match` returns `HTTP 304 Not Modified`.

---

## 1. Feature Slices Summary

| Slice ID | Mount Prefix | Purpose | Cache Policy |
| :--- | :--- | :--- | :--- |
| `aitag-auth` | `/api/auth` | JWT Registration, Login, User Details | None (Security sensitive) |
| `aitag-tasks` | `/api/tasks` | Browse, Filter, Post, and Manage AI Tasks | 60s Public (`tasks`), 30s User (`/my`) |
| `aitag-service-packages` | `/api/service-packages` | Curated AI Service Packages & 3 Tiers | 5 mins Public (`packages`) |
| `aitag-service-orders` | `/api/service-orders` | 8-Stage Escrow Order Lifecycle State Machine | None (State machine mutations) |
| `aitag-bids` | `/api/bids` | AI Specialist Proposal Bidding Engine | None (Live bid transactions) |
| `aitag-invitations` | `/api/invitations` | Direct Client-to-Specialist Task Invites | None (Direct notifications) |
| `aitag-profile` | `/api/profile` | Specialist Showcase, Bio, Tooling & Workflows | None |
| `aitag-analytics` | `/api/analytics` | Role-Aware Dossiers (Client, Freelancer, Admin) | 30s Scoped by User (`user:<email>`) |
| `aitag-cache` | `/api/cache` | In-RAM LRU Cache Stats, Health, Tag Invalidation | Live Telemetry |
| `aitag-security-guard` | `/api/security` | 20-Point Security Audit, SSRF & BOLA Guard | Live Security Telemetry |
| `aitag-marketplace` | `/api/marketplace` | Freelancer Search, Directory, & Filtering | None |
| `aitag-blog` | `/api/blog` | SEO Knowledge Base & Tutorials | 5 mins Public |
| `escrow-payment` | `/api/escrow` | RBI Compliance, 5% Platform Fee, UPI Settlement | None (Financial transactions) |
| `leakage-shield` | `/api/shield` | Real-time PII & External Contact Redaction | None (Real-time filter) |
| `sandwich-refactor-sandbox`| `/api/sandbox` | In-RAM AI Sandbox & AST Verification Engine | None (Ephemeral execution) |

---

## 2. Comprehensive Endpoint Catalog

### 1. `aitag-auth` (`/api/auth`)
- **`POST /api/auth/register`**
  - **Auth:** Public
  - **Body:** `{ "name": "...", "email": "...", "password": "...", "role": "client" | "freelancer" }`
  - **Security Rule:** Supplying `role: "admin"` is strictly rejected with `HTTP 400`. Passwords must be >= 6 characters and cannot be trivial words.
  - **Response 201:** `{ "token": "...", "user": { "id": "...", "name": "...", "email": "...", "role": "..." } }`
- **`POST /api/auth/login`**
  - **Auth:** Public
  - **Body:** `{ "email": "...", "password": "..." }`
  - **Response 200:** `{ "token": "...", "user": { ... } }`
- **`GET /api/auth/me`**
  - **Auth:** Required (`Bearer <token>`)
  - **Response 200:** User object without `password_hash`.

---

### 2. `aitag-tasks` (`/api/tasks`)
- **`GET /api/tasks`**
  - **Auth:** Public
  - **Query:** `?category=Product%20Visuals&search=saree&limit=10`
  - **Cache:** 60s (`tag: 'tasks'`), returns `ETag`, `X-Cache: HIT / MISS`
  - **Response 200:** Array of task objects. Categories must be one of: `'Product Visuals'`, `'E-Commerce & Copy'`, `'Social & Marketing'`, `'Web & Funnels'`.
- **`GET /api/tasks/featured`**
  - **Auth:** Public
  - **Cache:** 60s (`tag: 'tasks'`)
  - **Response 200:** Top 8 tasks by budget.
- **`GET /api/tasks/my`**
  - **Auth:** Required
  - **Cache:** 30s (`scope: 'user'`)
  - **Response 200:** Array of tasks posted by the authenticated user.
- **`GET /api/tasks/:id`**
  - **Auth:** Public
  - **Cache:** 60s (`tag: 'tasks'`)
  - **Response 200:** Single task object.
- **`POST /api/tasks`**
  - **Auth:** Required
  - **Body:** `{ "title": "...", "category": "...", "description": "...", "deadline": "YYYY-MM-DD", "budget": 1499, "image": "..." }`
  - **Cache Action:** Automatically invalidates `'tasks'` tag.
  - **Response 201:** Created task object.
- **`PUT /api/tasks/:id`**
  - **Auth:** Required (Task owner or Admin)
  - **Body:** Partial task fields to update.
  - **Cache Action:** Invalidates `'tasks'` tag.
  - **Response 200:** Updated task object.
- **`DELETE /api/tasks/:id`**
  - **Auth:** Required (Task owner or Admin)
  - **Cache Action:** Invalidates `'tasks'` tag.
  - **Response 200:** `{ "success": true }`

---

### 3. `aitag-service-packages` (`/api/service-packages`)
- **`GET /api/service-packages`**
  - **Auth:** Public
  - **Cache:** 5 minutes (`tag: 'packages'`)
  - **Response 200:**
    ```json
    {
      "success": true,
      "count": 3,
      "packages": [
        {
          "id": "...",
          "slug": "ai-product-photo-makeover",
          "title": "AI Product Photo Makeover",
          "category": "Product Visuals",
          "tiers": [
            { "tier_name": "beginner", "price_min": 1499, "price_max": 2499, "delivery_days_min": 2, "delivery_days_max": 3 },
            { "tier_name": "medium", "price_min": 2999, "price_max": 4999, "delivery_days_min": 3, "delivery_days_max": 5 },
            { "tier_name": "expert", "price_min": 5999, "price_max": 9999, "delivery_days_min": 5, "delivery_days_max": 7 }
          ]
        }
      ]
    }
    ```
- **`GET /api/service-packages/:slug`**
  - **Auth:** Public
  - **Cache:** 5 minutes (`tag: 'packages'`)
  - **Response 200:** Single package with full tier breakdowns, inclusions, and exclusions.

---

### 4. `aitag-service-orders` (`/api/service-orders`)
- **`POST /api/service-orders`**
  - **Auth:** Public or Authenticated
  - **Body:**
    ```json
    {
      "packageSlug": "ai-product-photo-makeover",
      "tierName": "beginner",
      "customerName": "Ramesh Gupta",
      "customerEmail": "ramesh@example.com",
      "customerPhone": "9876543210",
      "businessName": "Gupta Sarees",
      "businessType": "Retail",
      "briefNotes": "Need studio cutout for 15 saree photos",
      "uploadedAssets": []
    }
    ```
  - **Response 201:** Created order object in `REQUESTED` status with unique `order_number` (e.g. `ORD-2026-X89K`).
  - **Cache Action:** Invalidates `'orders'`, `'analytics'`, and `user:<customerEmail>`.
- **`GET /api/service-orders`**
  - **Auth:** Required (Admin sees all; Customer sees own; Expert sees assigned).
  - **Query:** `?role=client&status=ACTIVE`
  - **Response 200:** Array of orders isolated to the user's role.
- **`GET /api/service-orders/:id`**
  - **Auth:** Required (BOLA verified).
  - **Response 200:** Full order details.
- **`PATCH /api/service-orders/:id/status`**
  - **Auth:** Required
  - **Body:** `{ "status": "ACTIVE", "assignedExpertEmail": "...", ... }`
  - **Cache Action:** Invalidates `'orders'`, `'analytics'`, and affected user tags.
  - **Response 200:** Updated order object.
- **`POST /api/service-orders/:id/draft`**
  - **Auth:** Required (Assigned Expert)
  - **Body:** `{ "draftDeliverables": [ { "url": "...", "notes": "..." } ] }`
  - **Response 200:** Transitions order to `DRAFT_SUBMITTED`.
- **`POST /api/service-orders/:id/revision`**
  - **Auth:** Required (Customer)
  - **Body:** `{ "revisionNotes": "Please increase contrast on white fabrics" }`
  - **Response 200:** Transitions order to `REVISION`.
- **`POST /api/service-orders/:id/approve`**
  - **Auth:** Required (Customer)
  - **Body:** `{ "rating": 5, "testimonial": "Exceptional delivery!" }`
  - **Response 200:** Transitions order to `COMPLETED`, calculates 5% platform commission and 95% expert payout.

---

### 5. `aitag-analytics` (`/api/analytics`)
- **`GET /api/analytics/me`**
  - **Auth:** Required
  - **Cache:** 30s (`scope: 'user'`, `tag: 'user:<email>'`)
  - **Role-Aware Engine:**
    - If `role === 'client'`: Returns active orders, revisions requested, spend metrics.
    - If `role === 'freelancer'`: Returns completed jobs, payout queue, average rating.
    - If `role === 'admin'`: Returns platform-wide volume, GMV, total commissions.
- **`GET /api/analytics/summary`**
  - **Auth:** Required
  - **Cache:** 30s (`scope: 'user'`)
  - **Response 200:** Quick metric counters for dashboard header badges.

---

### 6. `aitag-cache` (`/api/cache`)
- **`GET /api/cache/stats`**
  - **Auth:** Public / Monitoring
  - **Response 200:**
    ```json
    {
      "success": true,
      "service": "aitag-cache",
      "status": "active",
      "keysCount": 12,
      "maxCapacity": 5000,
      "metrics": {
        "hits": 482,
        "misses": 31,
        "hitRatio": 0.9396,
        "sets": 31,
        "evictions": 0,
        "purges": 3
      }
    }
    ```
- **`POST /api/cache/purge`**
  - **Auth:** Public / Internal (or Admin)
  - **Body:** `{ "tag": "packages" }` or `{ "pattern": "tasks:*" }` or `{}` (purge all)
  - **Response 200:** `{ "success": true, "purgedCount": 4 }`
- **`GET /api/cache/health`**
  - **Response 200:** `{ "status": "healthy", "service": "aitag-cache" }`

---

### 7. `aitag-security-guard` (`/api/security`)
- **`GET /api/security/audit`**
  - **Auth:** Public / Monitoring
  - **Response 200:** Returns the 20-point security matrix status (`ENFORCED`, `PATCHED`, `CONFIGURED`).
