# 🤖 LLM Architectural Maintenance Laws & Operational Rules

> **Target Platform:** AITAG SaaS AI Freelance Marketplace  
> **Location:** `workflows/llm_maintenance_rules.md`  
> **Audience:** Autonomous AI Coding Assistants, LLMs, and Human Engineers  
> **Primary Mandate:** Eliminate regressions, preserve zero-mock integrity, and maintain architectural perfection.

---

## 🏛️ The 8 Golden Laws of AITAG

Any AI agent interacting with this repository MUST adhere to these 8 foundational laws:

### Law 1: Root Immunity (Do Not Touch `kernel.js` or `index.js`)
- `server/kernel.js` is the self-discovering slice bootstrap engine.
- `server/index.js` is the server entrypoint and middleware pipeline.
- **Rule:** Never modify `server/kernel.js` or `server/index.js` to add feature logic, endpoints, or database calls. All new features MUST be encapsulated inside their own slice under `server/features/<slice-name>/`.

### Law 2: Fractal Kernel Slice Encapsulation
Every feature slice must be completely self-contained with:
1. `feature.manifest.json`: Defines `id`, `name`, `version`, `basePath`, and `enabled: true`.
2. `routes.js`: Express router handling HTTP request validation and status codes.
3. `service.js`: Pure business logic, database queries, and cache hooks.
4. Optional sub-aggregators or helpers (e.g. `aggregators/` in `aitag-analytics`).

### Law 3: The Database Synchronization Contract
- **Rule:** Whenever you create a new table, alter a column, add a CHECK constraint, or create a migration file in `supabase/migrations/`:
  - You **MUST** update [`workflows/database.md`](file:///d:/Hayat/AITAG/workflows/database.md) in the exact same commit.
  - Never allow `workflows/database.md` to become stale or drift from the actual PostgreSQL schema.

### Law 4: Cache Integration on Mutations
- Whenever a slice performs a database write (insert, update, delete, status change):
  - Import the cache service: `const cacheService = require('../aitag-cache/service');`
  - Invalidate relevant tags: `cacheService.invalidateByTag('tasks');` or `cacheService.invalidateByTag('orders');`
  - For user-specific data: `cacheService.invalidateByTag('user:' + email.toLowerCase());`

### Law 5: Zero-Mock PIET Testing Invariant
- **Rule:** Never push to `develop` without running:
  ```powershell
  npm test
  ```
- All 8 Gates (51+ assertions) MUST pass with zero failures.
- PIET uses real HTTP over TCP and queries live Supabase tables (or in-memory twins).
- Never replace real database or HTTP checks with synthetic mocks.

### Law 6: Frontend Build Synchronization (`client/dist` -> `server/public`)
- The Node.js Express server serves static assets from `server/public/` (synced from `client/dist/`).
- Whenever you modify any frontend code in `client/src/`:
  - Run the build synchronization command:
    ```powershell
    npm run build
    ```
  - This compiles Vite, updates `client/dist/`, and copies it to `server/public/`.
  - Omitting this step causes the production server to serve stale frontend code.

### Law 7: Design & Aesthetic Standards
- **Theme:** Clean, modern light theme with high visual contrast.
- **Avatars:** Happy, warm, curated pastel backgrounds (`client/src/utils/avatar.ts`). Never display broken image icons or default gray silhouettes.
- **Framework:** Vanilla CSS and Material-UI components. **Do NOT introduce TailwindCSS** unless explicitly requested by the user.
- **Copy & Pricing:** Standardized around AI Service Packages (`beginner`, `medium`, `expert`). No legacy hourly rates or generic software engineering categories.

### Law 8: Git Branching & Commit Discipline
- **Active Working Branch:** `develop`
- **Protected Branch:** `main` (only merges from `develop` after full validation)
- **Commit Messages:** Follow Conventional Commits:
  - `feat(cache): add adaptive cache layer with LRU and ETag/304`
  - `fix(orders): ensure assigned expert receives payout email`
  - `docs(workflows): update database.md with new index`

---

## 📋 Pre-Flight Checklist for AI Coding Agents

Before telling the user a task is complete, run through this checklist:
- [ ] Are all new files inside a feature slice?
- [ ] Is `workflows/database.md` updated if schema was modified?
- [ ] Did `npm test` run and report 100% green?
- [ ] Did `npm run build` run if frontend files were touched?
- [ ] Are all git changes staged and committed with clean messages?
- [ ] Was the commit pushed to `origin/develop`?
