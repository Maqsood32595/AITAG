# Phase 2 Implementation Plan: WhatsApp & Email Project Progress Notifications

> **Status:** Deferred for later implementation (`later implementation`)
> **Scope:** Automated & admin-triggered project progress updates via **WhatsApp** and **Transactional Email** across AITAG order milestones (excluding browser Web Push permission popups).
> **Target Architecture:** Self-contained Fractal Kernel slice (`server/features/aitag-notifications/`) + editable copy templates (`workflows/order_notification_templates.js`).

---

## 1. Current Codebase Audit & Data Gaps (Baseline)

Before implementing, note these exact findings verified in the current codebase:

### A. User Contact Data Available Today
1. **Registered Users (`aitag_users` table):**
   - [SignUp.tsx](file:///d:/Hayat/AITAG/client/src/pages/SignUp.tsx) and [auth/service.js](file:///d:/Hayat/AITAG/server/features/domain-identity/children/auth/service.js) only collect `name`, `email`, `password_hash`, `photo_url`, and `role`.
   - Google SSO ([oauth/service.js](file:///d:/Hayat/AITAG/server/features/domain-identity/children/oauth/service.js)) only creates users with `name`, `email`, `photo_url`, `role`.
   - **Gap:** Newly registered users do **not** have a phone/WhatsApp number saved on `aitag_users` unless added explicitly.
2. **Service Package Orders (`aitag_orders` table):**
   - [OrderBriefModal.tsx](file:///d:/Hayat/AITAG/client/src/components/OrderBriefModal.tsx) (`customerPhone`) saves `customer_phone` on `aitag_orders` in [orders/service.js](file:///d:/Hayat/AITAG/server/features/domain-services/children/orders/service.js).
   - **Gap:** `customer_phone` is currently optional (`customer_phone = ''`) and there is no WhatsApp opt-in flag.
3. **Custom Marketplace Tasks (`aitag_tasks`):**
   - [AddTask.tsx](file:///d:/Hayat/AITAG/client/src/pages/AddTask.tsx) has an optional `WhatsApp / Phone Number (Optional)` field (`clientPhone`).
4. **Profile Dossier Fallback Warning:**
   - [dossier-builder.js](file:///d:/Hayat/AITAG/server/features/domain-platform/grandchildren/dossier-builder.js#L10) currently falls back to `'+91 98860 31643'` when `user.phone` and `customer_phone` are missing. **Notification dispatchers must never fall back to demo/support numbers.**

### B. Existing Messaging Infrastructure
- **Transactional Email (`nodemailer`):** Already configured in [registration-notifier.js](file:///d:/Hayat/AITAG/server/features/domain-identity/children/auth/registration-notifier.js) (`SMTP_HOST` defaulting to `smtp.resend.com`, `SMTP_PORT` `465`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`) and [aitag-contact/service.js](file:///d:/Hayat/AITAG/server/features/aitag-contact/service.js).
- **Order State Transitions:** Handled cleanly in [orders/service.js](file:///d:/Hayat/AITAG/server/features/domain-services/children/orders/service.js) via `createOrder`, `assignExpert`, `activateProject`, `submitDraft`, `requestRevision`, `approveAndComplete`, and `updateOrderStatus` — currently firing **zero** notifications.

---

## 2. Architecture: Fractal Kernel Notification Slice

Keep notification logic decoupled so failures or unconfigured API keys never break order creation or state updates:

```text
server/features/aitag-notifications/
├── feature.manifest.json       # id: "aitag-notifications", basePath: "/api/notifications"
├── routes.js                   # Health check, admin dispatch test, notification logs, WhatsApp webhook
├── service.js                  # Milestone orchestrator (non-blocking dispatch + test guard + log persistence)
├── providers/
│   ├── email-provider.js       # Nodemailer / Resend dispatch using SMTP_* env vars
│   └── whatsapp-provider.js    # Meta WhatsApp Cloud API (or BSP) + wa.me deep-link builder
└── formatters/
    └── phone-normalizer.js     # Strict E.164 normalization (+91...) & demo-number exclusion guard

workflows/
└── order_notification_templates.js  # Editable Email HTML/Text + WhatsApp template variable mapping
```

### Non-Negotiable Reliability Rules
1. **Non-Blocking Dispatch:** Trigger notifications asynchronously (`notifyOrderMilestone(...).catch(...)`) after Supabase/in-memory write succeeds. External SMTP/WhatsApp API downtime must never fail an HTTP order transition.
2. **Test / PIET Guard:** Reuse the `isTestContext` guard from `registration-notifier.js` (`NODE_ENV === 'test'`, `PIET_RUN === 'true'`, `@aitag-test`, `@aitag-piet`, `.local`, `example.com`) so PIET runs never spam real phone numbers or inboxes.
3. **Graceful Degrade:** If `SMTP_*` or `WHATSAPP_*` env vars are absent, log cleanly and record status `skipped_unconfigured` without throwing.
4. **Channel Fallback Rule:**
   - Send **Email** whenever `customer_email` is valid (covers 100% of registered & Google SSO users).
   - Send **WhatsApp** whenever a verified non-demo `whatsapp_phone` exists (resolved from `order.customer_phone || user.phone`) AND user has not opted out.

---

## 3. Lifecycle Milestones & Notification Copy

| Trigger Method in `orders/service.js` | Status | Who Gets Notified | Notification Purpose |
| :--- | :--- | :--- | :--- |
| `createOrder()` | `REQUESTED` | Client (+ Admin alert optional) | Order `#AITAG-2026-XXX` received + payment checkout link (`/checkout?order=<id>`) |
| `assignExpert()` | `MATCHED` | Client + Assigned Expert | Matched with verified AI specialist; specialist receives brief link |
| `activateProject()` | `ACTIVE` | Client + Assigned Expert | Payment verified & held in 100% escrow protection; work started |
| `submitDraft()` | `DRAFT_SUBMITTED` | **Client (High Priority)** | Draft deliverable uploaded; CTA link to review & approve or request revision |
| `requestRevision()` | `REVISION` | Assigned Expert + Client confirmation | Client revision notes submitted; SLA reminder to expert |
| `approveAndComplete()` | `COMPLETED` | **Client + Assigned Expert** | Final deliverables ready to download + invoice/rating CTA; expert payout notice |

*(Future Parity Option: Hook `domain-marketplace/children/tasks/service.js` when a bid is accepted or task work is submitted/completed.)*

---

## 4. Channel 1: WhatsApp Integration Plan

### Step 4.1 — Capture & Normalize User WhatsApp Numbers
1. **Database (`aitag_users`):** Add optional columns:
   - `phone` (`TEXT`, E.164 e.g. `+9198XXXXXXXX`)
   - `whatsapp_opt_in` (`BOOLEAN DEFAULT true`)
2. **Frontend Capture Points:**
   - **Order Brief Modal ([OrderBriefModal.tsx](file:///d:/Hayat/AITAG/client/src/components/OrderBriefModal.tsx)):** Mark `"WhatsApp / Phone Number"` clearly with helper text (`"Used for instant project & draft alerts"`), pre-fill from `user.phone` if available, validate 10-digit Indian / international format, and optionally persist back to `aitag_users.phone` when missing.
   - **SignUp & Profile ([SignUp.tsx](file:///d:/Hayat/AITAG/client/src/pages/SignUp.tsx), [Profile.tsx](file:///d:/Hayat/AITAG/client/src/pages/Profile.tsx)):** Add an optional WhatsApp number field on registration + editable `"WhatsApp Notification Number"` toggle on Profile.
3. **Phone Normalization (`phone-normalizer.js`):**
   - Strip spaces/dashes; prepend `+91` for 10-digit numbers (`[6-9]\d{9}`); reject/ignore invalid lengths or hardcoded demo placeholders (`9886031643`).

### Step 4.2 — Two Delivery Modes (Choose / Layer)
#### Mode A: Smart 1-Click WhatsApp Button in Admin Dashboard (Zero Cost / Instant Launch)
- Inside [Dashboard.tsx](file:///d:/Hayat/AITAG/client/src/pages/Dashboard.tsx) order cards (admin view), display a **"Notify Client on WhatsApp"** button beside status actions.
- Builds a `https://wa.me/<digits>?text=<encodedMessage>` URL pre-filled with customer name, `order_number`, current milestone update, and direct URL (`https://aitag.in/dashboard#orders-section` or `/my_tasks`).
- Requires zero Meta template approval or per-message fee; useful immediately as fallback or manual follow-up.

#### Mode B: Automated WhatsApp Cloud API / Indian BSP (Full Phase 2 Automation)
- **Prerequisites Before Coding Mode B:**
  1. Verify business in **Meta Business Portfolio** (GST certificate / business registration docs).
  2. Dedicated WhatsApp Business phone number registered on **Meta WhatsApp Cloud API** (direct `graph.facebook.com/v21.0/<PHONE_NUMBER_ID>/messages` — **no monthly SaaS fee**, ~₹0.12–₹0.15 per Utility conversation in India) *or* via BSP (AiSensy / Interakt / Wati).
  3. Create & get **Utility Category** templates approved in Meta Business Manager (avoid *Marketing* category to keep cost low and deliverability high):
     - **`aitag_order_confirmed`:** `"Hi {{1}}, your AITAG order {{2}} ({{3}}) is confirmed. Track live progress anytime at {{4}}."`
     - **`aitag_draft_ready`:** `"Hi {{1}}, your AI specialist uploaded a draft for {{2}} (Order {{3}}). Review & approve or request changes here: {{4}}"`
     - **`aitag_order_completed`:** `"Hi {{1}}, great news! Your project {{2}} (Order {{3}}) is completed. Download your final deliverables here: {{4}}"`
- **Environment Variables:**
  ```env
  WHATSAPP_PROVIDER=meta_cloud   # none | meta_cloud | aisensy | interakt
  WHATSAPP_PHONE_NUMBER_ID=
  WHATSAPP_ACCESS_TOKEN=
  WHATSAPP_VERIFY_TOKEN=
  WHATSAPP_API_VERSION=v21.0
  ```
- **Webhook Endpoint (`GET/POST /api/notifications/whatsapp-webhook`):**
  - Handles Meta hub challenge verification (`GET`) and incoming delivery receipts (`sent` / `delivered` / `read` / `failed`) + user opt-out keywords (`STOP` → sets `whatsapp_opt_in = false`).

---

## 5. Channel 2: Transactional Email Plan (Reusing Existing SMTP / Resend)

Because 100% of registered users (including Google SSO accounts without a phone) have `user.email`, Email acts as the universal guarantee channel:

1. **Reuse `SMTP_*` Setup from [registration-notifier.js](file:///d:/Hayat/AITAG/server/features/domain-identity/children/auth/registration-notifier.js):**
   - Uses `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`.
2. **Create `workflows/order_notification_templates.js`:**
   - Branded responsive HTML + plain-text email templates matching [workflows/welcome_email_templates.js](file:///d:/Hayat/AITAG/workflows/welcome_email_templates.js).
   - Every email includes:
     - Current milestone badge (e.g., `Step 4 of 5: Draft Ready for Review`)
     - Order number (`AITAG-2026-XXXXXX`), Package Title, Agreed Price & Escrow Protection status
     - Primary CTA button linking directly to `https://aitag.in/my_tasks` / `https://aitag.in/dashboard#orders-section`
     - Support WhatsApp fallback (`+91 84316 34113`) & reply-to `contact@aitag.in`

---

## 6. Idempotency, Audit Logs & Security

1. **Notification Log Table (`aitag_notification_logs` in Supabase + JSON/RAM fallback):**
   - Columns: `id`, `order_id`, `recipient_email`, `recipient_phone`, `milestone`, `channel` (`email` | `whatsapp`), `status` (`sent` | `failed` | `skipped`), `provider_message_id`, `error_summary`, `created_at`.
   - Prevents duplicate notifications if an admin clicks an endpoint twice for the same `(order_id, milestone, channel)` within a short window.
2. **Security & Privacy Compliance:**
   - Mask phone numbers/emails in server console logs where required by `aitag-security-guard` (`log-scrubber`).
   - Validate webhook signatures (`X-Hub-Signature-256`) on WhatsApp Cloud API `POST` callbacks.
   - Protect `/api/notifications/logs` and manual resend routes behind Admin JWT verification (`req.user.role === 'admin'`).

---

## 7. Exact Implementation Checklist (When Ready to Build)

- [ ] **Prerequisite Check:** Confirm `SMTP_*` keys are active in production/staging `.env` and confirm Meta WhatsApp Cloud API / BSP credentials (`WHATSAPP_*`) or enable Mode A (`wa.me`) first.
- [ ] **Database Migration:** Add `phone` + `whatsapp_opt_in` columns on `aitag_users` and create `aitag_notification_logs` table in Supabase (plus fallback store).
- [ ] **Template Module:** Create `workflows/order_notification_templates.js` with copy for all 5 milestones.
- [ ] **Backend Fractal Slice:** Create `server/features/aitag-notifications/` (`feature.manifest.json`, `service.js`, `routes.js`, `providers/`, `formatters/`).
- [ ] **Hook State Transitions:** Call `notificationsService.notifyOrderMilestone(order, prevStatus)` inside `orders/service.js` (`createOrder`, `assignExpert`, `activateProject`, `submitDraft`, `requestRevision`, `approveAndComplete`).
- [ ] **Frontend Intake & Admin Tools:**
  - Capture optional WhatsApp number in [SignUp.tsx](file:///d:/Hayat/AITAG/client/src/pages/SignUp.tsx) & editable toggle in [Profile.tsx](file:///d:/Hayat/AITAG/client/src/pages/Profile.tsx).
  - Pre-fill/sync `customer_phone` in [OrderBriefModal.tsx](file:///d:/Hayat/AITAG/client/src/components/OrderBriefModal.tsx).
  - Add 1-click **"Notify on WhatsApp"** & delivery log indicator on order cards in [Dashboard.tsx](file:///d:/Hayat/AITAG/client/src/pages/Dashboard.tsx).
- [ ] **Verification:** Run `npx tsc --noEmit`, `npx oxlint`, `npm run build`, and add PIET invariants verifying:
  - Test/PIET runs safely suppress live external sends (`isTestContext`).
  - Missing `phone` falls back cleanly to email-only without using hardcoded demo numbers.
  - Admin-only access control on notification logs / manual resend endpoints.
