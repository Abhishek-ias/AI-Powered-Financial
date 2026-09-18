# Demo Flow — AI Financial Journey Copilot

**Team NOVA** | Judge Demonstration Script

---

## Starting the Application

```bash
# Terminal 1 — Backend
npm run dev           # runs on http://localhost:3000

# Terminal 2 — Frontend
cd frontend && npm run dev   # runs on http://localhost:5173
```

Open http://localhost:5173 in browser.

---

## Domain 1 — Insurance: ClaimSahay (Primary Deep Journey)

### Step 1 — Home Page
- Observe: 2-column hero "One conversation. Every financial goal."
- Trust strip: SafeGuard, Deterministic EMI, NPCI Dispute Engine, Audit Trail
- 3 domain cards: Insurance, Lending, Fintech
- Type a goal or click → **"My hospital claim was queried and I don't understand what is missing"**

### Step 2 — ClaimSahay Landing
- Hero: "Life happens. We're here to help."
- Click **"Start a Claim"** or navigate to Insurance tab
- Click **"ClaimSahay (Insurance)"** tab in navigation

### Step 3 — Goal Entry
- Type: `My hospital claim was queried/rejected and I don't understand what is missing.`
- Click **"Analyze Goal"**
- Backend: `POST /api/journeys/initialize`
- Display: Intent analysis — domain: INSURANCE, type: CLAIM_ASSISTANCE

### Step 4 — Dynamic Questions
- 8 questions load from backend
- Answer all required questions (hospital name, admission date, claim amount, insurer, policy, type, language, resolution speed)
- Click **"Submit Answers"**
- Backend: `POST /api/journeys/:id/questions`

### Step 5 — Consent
- 3 consent purposes shown
- Click **"Grant All Consents"**
- Required docs listed: Claim Form, Hospital Bill, Discharge Summary, ID Proof
- Backend: `POST /api/journeys/:id/consent`

### Step 6 — Document Upload
- Requirements checklist visible
- Click **"Upload Synthetic Claim Batch"** (demo auto-upload)
- OR drag & drop files
- 4 documents upload with progress indicators
- Backend: `POST /api/journeys/:id/documents` (multipart)

### Step 7 — Document Processing
- Click **"Process All Documents"**
- Cards show: UPLOADED → PROCESSING → PROCESSED
- Backend: `POST /api/journeys/:id/process-documents`

### Step 8 — Evidence Extraction
- 26 extracted fields shown as evidence cards
- Fields: patient name, diagnosis, room rent, claim amount, policy number, etc.
- Confidence badges: High / Good / Moderate
- Backend: `GET /api/journeys/:id/evidence`

### Step 9 — Validation & Conflicts
- Validation summary visible
- **2 blocking issues highlighted:**
  - ⚠️ Diagnosis: CONTRADICTED (Acute Appendicitis vs Appendectomy)
  - ⚠️ Room Rent: ₹7,500/day vs policy limit ₹5,000/day
- Backend: `GET /api/journeys/:id/validation`

### Step 10 — Policy Check (Reconciliation)
- Click **"Check Against Policy"** or **"Next: Review Policy"**
- Insurer query resolves: AMOUNT_DISPUTE — room rent sub-limit
- AI explanation (315 characters)
- Policy citation: POL-HEALTH-2024-001 v2024-v1, Section: Pre-Hospitalization, Page 14
- Backend: `POST /api/journeys/:id/reconcile`

### Step 11 — Next Best Action
- Right sidebar shows authoritative next actions from backend
- E.g.: "REVIEW_POLICY" — "Verify room-rent sub-limit clause with insurer"

### Step 12 — Consequential Confirmation (Safety Gate)
- Navigate to Review tab
- Click **"Confirm Understanding"**
- Backend: `POST /api/journeys/:id/confirm` — creates approval request
- Status: USER_CONFIRMED

### Step 13 — Approval
- Click **"Approve & Submit to Insurer"**
- Backend: `POST /api/journeys/:id/approve`
- Status: COMPLETED | Workflow: SUBMITTED
- Safety message: "MOCK submission. No real financial action has been taken."

### Step 14 — Status & Timeline
- Click **"View Timeline"**
- 21 chronological events visible (AI | CUSTOMER | SYSTEM actors)
- Backend: `GET /api/journeys/:id/timeline`

### Step 15 — Human Escalation
- Click **"Escalate to Specialist"**
- Human Escalation Modal appears
- 15-field context packet shown (goal, domain, journey status, evidence, issues, etc.)
- Click **"Escalate"**
- Backend: `POST /api/journeys/:id/escalate`
- Status: HUMAN_REVIEW | Support case created

---

## Domain 2 — Lending Copilot

Click **"Lending Copilot"** tab.

### Step 1 — Lending Hero
- "Understand your borrowing journey" hero with imagery
- Trust strip: Reducing EMI, RBI FOIR 50%, Zero Hidden Fees

### Step 2 — EMI Calculator
- Pre-filled: ₹10,00,000 principal | 9.5% rate | 60 months
- Click **"Calculate via Backend API"**
- Backend: `POST /api/lending/calculate-emi`
- Result: EMI ₹21,001.86/month

### Step 3 — Affordability Check
- Monthly income: ₹70,500 | Existing EMI: ₹5,000
- Backend: `POST /api/lending/check-affordability`
- Result: **"Affordability Criteria Met"** — DTI 36.9% < 50% FOIR threshold

> **Note:** Never displays "Loan Approved" — only authoritative "Affordability Criteria Met"

---

## Domain 3 — Fintech Dispute Copilot

Click **"Fintech Disputes"** tab.

### Step 1 — Fintech Hero
- "Manage your financial journey with confidence" with imagery
- Trust strip: NPCI T+1/T+2, Gateway Verification, Zero Loss, Specialist Escort

### Step 2 — Transaction Lookup
- Use pre-loaded ID: `TXN-UPI-2024-FAIL-001`
- Click **"Query"**
- Backend: `GET /api/fintech/transactions/TXN-UPI-2024-FAIL-001`
- Result: ₹4,999 | Status: FAILED_BUT_DEBITED

### Step 3 — Dispute Resolution
- Dispute classification: FAILED_BUT_DEBITED
- Auto-reversal timeline: 2 business days via NPCI dispute resolution
- Click **"Raise Instant Bank Dispute"**
- Result: "Dispute Ticket #DISP-8921 recorded with banking gateway"

---

## Audit & History

Click **"Journeys & Audit"** tab.

- All previous journeys listed with domain, status, timestamp
- Filter, inspect, re-enter journeys

---

## Support Specialist Desk

Click **"Support Specialist"** tab.

- Admin view shows audit event log (37+ events for a full journey)
- Real-time monitoring of all system actions

---

## Key Proof Points for Judges

| Capability | Evidence |
|---|---|
| Goal Understanding | Backend AI classifies intent correctly |
| Dynamic Questions | 8 relevant questions generated per domain |
| Document Intelligence | 26 evidence fields extracted via OCR |
| Policy Rules | Room-rent sub-limit enforced deterministically |
| Conflict Detection | Diagnosis contradiction flagged automatically |
| Safety Gates | Confirmation required before approval |
| Human Escalation | 15-field context packet sent to specialist desk |
| Audit Trail | 37+ timestamped immutable events per journey |
| Multi-Domain | Insurance + Lending + Fintech on same platform |
| Sandbox Transparency | Mock disclaimer on every submission |
