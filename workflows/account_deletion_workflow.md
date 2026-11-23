# AITAG Account Deletion & Exit Feedback Workflow

## 1. Overview
When a user decides to delete their account via the platform's GDPR / Right-to-be-Forgotten deletion feature (`DELETE /api/account`):
1. Their account and marketplace associations are permanently purged from database, caches, and filesystem.
2. An automated, polite deletion confirmation and exit feedback email is dispatched to their personal email address.
3. Users can reply directly to the email to share feedback with `contact@aitag.in`.

---

## 2. File Location & Quick Customization
Whenever you want to modify the account deletion feedback email copy, wording, or questions:

👉 **Edit File:** [`workflows/account_deletion_feedback_templates.js`](file:///d:/Hayat/AITAG/workflows/account_deletion_feedback_templates.js)

The file contains `ACCOUNT_DELETION_TEMPLATE`:
* `subject`: Email subject line.
* `headline` & `subheadline`: Banner header text.
* `confirmationText`: GDPR / privacy data deletion confirmation statement.
* `feedbackIntro` & `feedbackOptions`: The feedback questions and bullet points.
* `replyCallout`: Clear instruction that replying directly reaches the founding team at `contact@aitag.in`.

---

## 3. Architecture & Delivery Pipeline

```mermaid
flowchart TD
    A[User clicks 'Delete Account'] -->|DELETE /api/account| B[account/service.js: purgeAccount]
    B -->|Purge Supabase, Caches, Seeds| C[Account Purged]
    B --> D[account-deletion-notifier.js]
    D -->|Internal Notice| E[contact@aitag.in: Admin Notice]
    D -->|Customer Confirmation & Feedback| F[workflows/account_deletion_feedback_templates.js]
    F -->|Render HTML & Text| G[Resend SMTP: smtp.resend.com:465]
    G -->|DKIM Signed from notifications@aitag.in| H[User Inbox]
```

### Technical Specs:
* **Sender:** `"AITAG Team" <notifications@aitag.in>`
* **Reply-To:** `contact@aitag.in` (User replies route directly to your Gmail inbox via Cloudflare)
* **Transport:** Resend SMTP (`smtp.resend.com:465` with SSL)
* **Performance:** Non-blocking (`fire-and-forget`)
* **Safety:** Suppressed during automated tests (`process.env.NODE_ENV === 'test'`).
