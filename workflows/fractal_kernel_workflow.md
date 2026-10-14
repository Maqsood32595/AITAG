# Fractal Kernel Architecture & Workflow Guide

> **Repository Reference:** [Maqsood32595/fractal-kernel](https://github.com/Maqsood32595/fractal-kernel)  
> **Published Paper DOI:** [10.5281/zenodo.21622791](https://doi.org/10.5281/zenodo.21622791)  
> **Core Engine File:** `server/kernel.js` (Root Immune — Never Modify)  
> **Features Directory:** `server/features/`

---

## 1. Executive Summary & Design Rationale

**Fractal Kernel** is a manifest-driven feature slice architecture for Node.js + Express, specifically developed to optimize AI coding agent context windows and completely eliminate cross-feature regressions.

### The AI Code Degradation Problem
When developing applications with AI coding agents:
1. Around feature 8 to 15, monolithic codebases degrade rapidly.
2. The AI requires reading the entire codebase context, causing token dilution, hallucination, and accidental regressions in previously functioning code.
3. In standard monoliths, benchmark empirical testing shows a **38.4% cross-slice regression rate**.

### The Fractal Kernel Solution
Features are isolated into strictly self-contained directories inside `server/features/<feature-name>/`.
A central `kernel.js` automatically scans and mounts them upon server initialization.
- **85.9% Reduction** in average prompt token consumption per task (from ~32,150 to ~4,520 tokens).
- **0.0% Cross-Slice Regressions** (completely eliminated).
- **91.3% First-Pass Task Completion Rate**.

---

## 2. Core Architectural Laws

```
server/
├── kernel.js                 <-- IMMUNE: Auto-discovery engine (NEVER MODIFY)
├── index.js                  <-- IMMUNE: Server bootstrap & middleware
└── features/                 <-- All feature development happens here
    ├── aitag-auth/
    ├── aitag-service-packages/
    │   ├── feature.manifest.json  <-- Declares identity, basePath, version
    │   ├── routes.js              <-- HTTP routing transport only
    │   └── service.js             <-- Pure business logic & database access
    └── aitag-service-orders/
        ├── feature.manifest.json
        ├── routes.js
        └── service.js
```

### Law 1: Root Immunity
`server/kernel.js` and `server/index.js` must NEVER be modified when adding or altering features. All logic must live inside feature directories.

### Law 2: Self-Contained Slices
Each feature must contain:
1. `feature.manifest.json`: Metadata, route prefix, and enabled toggle.
2. `routes.js`: Express router handling HTTP request/response validation.
3. `service.js`: Stateless or encapsulated business logic and Supabase client calls.
4. `ui/` *(Optional)*: Static assets or micro-frontend views.

### Law 3: Dynamic Discovery
The Kernel (`kernel.init(app)`) automatically:
- Scans `server/features/` on boot.
- Reads and parses each `feature.manifest.json`.
- Mounts `routes.js` at `manifest.basePath` (e.g. `/api/service-packages`).
- Maps `ui/` static folder to `/features/<feature-id>` if present.
- Exposes registry endpoint at `GET /api/features`.

---

## 3. How to Add a New Feature in 3 Steps

### Step 1: Create the Feature Directory
Create `server/features/<your-feature-name>/`.

### Step 2: Define `feature.manifest.json`
```json
{
  "id": "my-new-feature",
  "name": "My New Feature Service",
  "version": "1.0.0",
  "basePath": "/api/my-feature",
  "enabled": true,
  "dependencies": []
}
```

### Step 3: Implement `service.js` and `routes.js`
* `service.js`:
  ```js
  class MyFeatureService {
    async doWork() { return { ok: true }; }
  }
  module.exports = new MyFeatureService();
  ```
* `routes.js`:
  ```js
  const express = require('express');
  const router = express.Router();
  const service = require('./service');

  router.get('/work', async (req, res) => {
    const result = await service.doWork();
    res.json(result);
  });

  module.exports = router;
  ```

Restart the server or run `npm run test:piet` — the Kernel will discover and mount your new endpoint automatically at `/api/my-feature/work`!
