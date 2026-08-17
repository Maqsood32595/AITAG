# 🌳 AITAG Git & Fractal Kernel Branching Strategy

> **Dual-Layer Architecture Governance**: Combining the **Fractal Micro-Kernel Architecture** (code-level slice isolation) with a **Structured Git Branching Model** (environment-level preview and deployment gates) and the **RAM VFS Sandbox** (zero-risk in-memory verification).

---

## 🏗️ The 3-Tier Layered Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: In-Memory RAM Sandbox (Zero-Risk Stage)             │
│   - Code mutations & virtual AST checks occur purely in RAM │
│   - Live Unified Diff generated for Human-in-the-Loop review│
│   - 0 disk writes | 0 branch clutter until approved         │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Approved on Chat)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 2: Git Feature Branches (Preview Stage)                │
│   - Branch: feature/<slice-name> (e.g. feature/invitations) │
│   - Cloudflare Pages generates instant Preview Deployment   │
│   - Isolated testing environment without risking production │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Integration Verified)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 3: Staging & Production (Live Deployment Stage)        │
│   - staging: Integration testing across all slices          │
│   - main: Production ground truth (https://aitag.pages.dev) │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌿 Branching Hierarchy & Rules

### 1. `main` (Production)
* **Live URL:** `https://aitag.pages.dev` & `https://aitag.onrender.com/api`
* **Rule:** Protected. Never push unverified code directly to `main`.
* **Deployment:** Automatic production CI/CD trigger on push/merge.

### 2. `staging` (Integration & Pre-Release)
* **Purpose:** Merges multiple feature slices together for end-to-end integration testing before release.
* **Rule:** Synchronized with `main` after every production release.

### 3. `feature/<slice-name>` (Micro-Slice Feature Branches)
* **Naming Standard:** Must match or reference the Fractal feature slice:
  * `feature/aitag-invitations` ──▶ Maps to `server/features/aitag-invitations`
  * `feature/escrow-payouts` ──▶ Maps to `server/features/escrow-payment`
  * `feature/chat-leakage-shield` ──▶ Maps to `server/features/leakage-shield`
* **Rule:** Branch from `staging` (or `main`), complete work, verify in RAM, commit, and open PR.

### 4. `fix/<issue-name>` (Hotfixes)
* **Naming Standard:** `fix/auth-token-expiration`, `fix/tax-calculation-roundoff`
* **Rule:** For immediate bug fixes that need fast staging/testing.

---

## 🚀 Standard Workflow Commands

### 1. Start a New Feature Slice
```bash
git checkout staging
git pull origin staging
git checkout -b feature/<slice-name>
```

### 2. Verify in RAM & Build Locally
```bash
# Verify client build
npm run build --prefix client

# Verify Fractal Kernel bootstrap
node -e "const k = require('./server/kernel'); const express = require('express'); k.init(express());"
```

### 3. Commit & Push for Preview Deployment
```bash
git add .
git commit -m "feat(<slice-name>): implement new capability"
git push -u origin feature/<slice-name>
```

### 4. Merge to Staging & Production
```bash
# Merge into staging
git checkout staging
git merge feature/<slice-name>
git push origin staging

# Once verified on staging, release to main
git checkout main
git merge staging
git push origin main
```

---

## 🛡️ Dual-Layer Architecture Matrix

| Capability | Fractal Kernel Layer (`server/features/*`) | Git Branching Layer |
| :--- | :--- | :--- |
| **Isolation** | Code-level slice isolation (manifest, routes, service) | Repository-level branch isolation (`feature/*`) |
| **Blast Radius** | Broken slice only crashes its own `/api/<slice>` endpoint | Broken branch only affects preview URL, not `main` |
| **Context Bounding** | ~15 tokens per AST feature slice (Sandwich AST) | Clean, small PR diffs scoped to 1 feature |
| **Verification** | In-Memory AST & syntax assertions in RAM | Cloudflare Pages Preview Deployments |
