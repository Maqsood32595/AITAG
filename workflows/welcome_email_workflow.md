# AITAG Automated New User Welcome Email Workflow

## 1. Overview
This workflow automatically sends a branded, role-aware welcome email to every new user immediately after they register on the AITAG platform:
1. **Manual Registration:** User signs up on `/signup` with Name, Email & Password.
2. **Google OAuth Registration:** First-time user logs in via Google Single Sign-On (`isNew === true`).

---

## 2. File Location & Quick Customization
Whenever you want to modify the welcome email copy, bullet points, call-to-action buttons, or links:

👉 **Edit File:** [`workflows/welcome_email_templates.js`](file:///d:/Hayat/AITAG/workflows/welcome_email_templates.js)

The file contains two clean configuration objects:
* `WELCOME_TEMPLATES.client`: Copy, subject line, 3 key value propositions, and CTA for **Clients / Small Businesses**.
* `WELCOME_TEMPLATES.freelancer`: Copy, subject line, earnings highlight (80% take-home), and profile setup CTA for **AI Specialists / Freelancers**.

---

## 3. Architecture & Delivery Pipeline

```mermaid
flowchart TD
    A[New User Signup] -->|Manual or Google OAuth| B[domain-identity / auth / oauth]
    B --> C[registration-notifier.js]
    C -->|Internal Alert| D[contact@aitag.in: Admin Alert]
    C -->|External Welcome Email| E[workflows/welcome_email_templates.js]
    E -->|Render HTML & Text| F[Resend SMTP: smtp.resend.com:465]
    F -->|DKIM Signed from notifications@aitag.in| G[User Personal Inbox: 100% Primary Tab]
```

### Technical Specs:
* **Sender:** `"AITAG Team" <notifications@aitag.in>`
* **Reply-To:** `contact@aitag.in`
* **Recipient:** User's registered personal email address
* **Transport:** Resend SMTP (`smtp.resend.com:465` with SSL)
* **Performance:** Non-blocking (`fire-and-forget`) — Registration API response remains under 25ms.
* **Safety:** Suppressed during automated tests (`process.env.NODE_ENV === 'test'`).

---

## 4. How to Update Messages in the Future
When the user asks to modify the welcome email:
1. Open [`workflows/welcome_email_templates.js`](file:///d:/Hayat/AITAG/workflows/welcome_email_templates.js).
2. Update the desired field (`subject`, `headline`, `keyPoints`, `ctaText`, `ctaUrl`, etc.).
3. Test locally using:
   ```bash
   node -e "require('./server/features/domain-identity/children/auth/registration-notifier').sendWelcomeEmail({ user: { name: 'Test User', email: 'test@example.com', role: 'client' } });"
   ```
4. Verify build and regression tests before pushing.
