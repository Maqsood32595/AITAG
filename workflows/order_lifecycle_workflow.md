# 8-Stage Order Lifecycle & Marketplace State Machine

> **Source Diagrams:** `D:\Hayat\Hayat New Mail Requirements\unnamed.png` & `unnamed (1).png`  
> **Database Table:** `aitag_orders`  
> **Backend Engine:** `server/features/aitag-service-orders/`  
> **API Endpoints:** `/api/service-orders/*`

---

## 1. The 8-Stage State Flow Overview

```
[1. REQUESTED] ──> [2. QUALIFIED] ──> [3. MATCHED] ──> [4. SCOPE_CONFIRMED]
                                                                │
[8. COMPLETED] <── [7. REVISION / APPROVED] <── [6. DRAFT_SUBMITTED] <── [5. ACTIVE]
        │
    [DISPUTED] (Can occur during review)
```

---

## 2. Stage-by-Stage Operational Specifications

| Stage | Trigger / Actor | Actions Taken | Exit Condition | Next State |
| :--- | :--- | :--- | :--- | :--- |
| **1. REQUESTED** | Customer | Customer fills brief form on package page, selects tier, enters contact/business info, uploads photos/assets. | Order record created in Supabase with status `REQUESTED`. | `QUALIFIED` |
| **2. QUALIFIED** | Admin | Admin checks brief completeness, clarifies any missing assets with the customer. | Brief deemed complete and actionable. | `MATCHED` |
| **3. MATCHED** | Admin | Admin selects 1–3 pre-vetted AI specialists from the approved roster and assigns the project. | Expert assigned (`assigned_expert_email` set). | `SCOPE_CONFIRMED` |
| **4. SCOPE_CONFIRMED** | Customer + Expert | Deliverables, delivery date, number of revisions, and final price (₹) locked and agreed. | Scope locked; digital confirmation recorded. | `PAID` |
| **5. ACTIVE** | Customer + Admin | Customer pays via payment link / UPI gateway. Admin confirms payment receipt. | Project activated; turnaround clock starts. | `ACTIVE` |
| **6. DRAFT_SUBMITTED** | Expert | Expert works in workspace using AI tools, completes work, and submits draft files for review. | Draft files uploaded (`draft_deliverables` populated). | Quality Check / Review |
| **7. REVISION / REVIEW** | Admin + Customer | Admin performs quick completeness check. Customer reviews work and either requests included revision or approves. | Customer submits feedback or approves. | `REVISION` or `COMPLETED` |
| **8. COMPLETED** | Customer + Admin | Customer approves final deliverables. Admin releases payout to expert (95%) and records AITAG margin (5%). Customer rates service. | Rating/testimonial saved, files released, project closed. | `COMPLETED` |

---

## 3. Decision Loops & Exception Handling

### A. Expert Declines or Unresponsive
* **Decision:** If assigned expert cannot accept within 12 hours.
* **Resolution:** Admin reassigns request to the next pre-approved expert on the roster without interrupting the customer.

### B. Customer Requests Revision
* **Decision:** Customer requests modifications covered by package tier (1 or 2 included revisions).
* **Resolution:** State transitions to `REVISION`. Expert receives structured revision notes and submits revised draft.

### C. Scope Creep / Out-of-Scope Requests
* **Decision:** Customer requests additional sections, extra photos, or extra features outside the fixed tier.
* **Resolution:** Admin issues a revised add-on quote. Work on extras begins only after the add-on is paid.

### D. Quality Concern or Dispute
* **Decision:** Customer raises a dispute within 5 days of draft submission.
* **Resolution:** State transitions to `DISPUTED`. Admin pauses payout, reviews agreed scope and delivered assets, and decides rework, reassignment, or refund.

### E. Inactive Customer Auto-Release
* **Rule:** If the expert submits the draft and the customer does not respond or raise a dispute within **5 calendar days**, the order automatically marks as `COMPLETED` and payout is released to the expert.
