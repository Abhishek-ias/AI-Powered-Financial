# Demo Playbook — AI Financial Journey Copilot

## Startup

### 1. Backend Service (Frozen)
```bash
# 1. Install dependencies
npm install

# 2. Push database schema (creates SQLite dev.db)
npx prisma db push

# 3. Seed synthetic data
npx tsx scripts/seed.ts

# 4. Start backend
npm run dev
# Running on http://localhost:3000
```

### 2. Frontend Application (ClaimSahay UI)
```bash
# In /frontend directory:
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
# Running on http://127.0.0.1:5173
```

## Verify

```bash
# Health check
curl http://localhost:3000/health

# Readiness (shows all provider statuses)
curl http://localhost:3000/ready

# Frontend dev server check
curl http://127.0.0.1:5173
```

## ClaimSahay Demo Journey

### Step 1: Create Journey
```bash
curl -X POST http://localhost:3000/api/journeys \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001" \
  -d '{"message": "My hospital claim was rejected and I don'\''t understand what is missing."}'
```
→ Returns journey ID, detected INSURANCE domain, 8 questions

### Step 2: Answer Questions
```bash
curl -X POST http://localhost:3000/api/journeys/{id}/questions/{qid}/answer \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001" \
  -d '{"answer": "POL-HEALTH-2024-001"}'
```

### Step 3: Grant Consent
```bash
curl -X POST http://localhost:3000/api/journeys/{id}/consent \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001" \
  -d '{"purposes": ["DATA_PROCESSING", "DOCUMENT_ANALYSIS", "EXTERNAL_SUBMISSION"]}'
```

### Step 4: Upload Documents
```bash
curl -X POST http://localhost:3000/api/journeys/{id}/documents \
  -H "X-User-Id: user-customer-001" \
  -F "file=@hospital_bill.pdf" \
  -F "documentType=HOSPITAL_BILL"
```

### Step 5: Process Documents
```bash
curl -X POST http://localhost:3000/api/journeys/{id}/process-documents \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001"
```
→ Returns extracted evidence, validation results, conflicts (room rent exceeds policy limit)

### Step 6: Create Claim + Reconcile
```bash
# Create claim
curl -X POST http://localhost:3000/api/insurance/claims \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001" \
  -d '{"journeyId": "{id}", "policyNumber": "POL-HEALTH-2024-001", "claimType": "HOSPITALIZATION", "amount": 165000}'

# Reconcile insurer query
curl -X POST http://localhost:3000/api/journeys/{id}/reconcile \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001" \
  -d '{"queryType": "AMOUNT_DISPUTE", "queryText": "Room rent exceeds permissible limit", "policyId": "policy-001", "policyVersion": "2024-v1"}'
```

### Step 7: Confirm + Approve + Submit
```bash
# Confirm
curl -X POST http://localhost:3000/api/journeys/{id}/confirm \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001"

# Approve (triggers mock workflow + mock insurer)
curl -X POST http://localhost:3000/api/journeys/{id}/approve \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001" \
  -d '{"approvalId": "{approval_id}", "approved": true}'
```

### Step 8: View Timeline + Escalate
```bash
# Timeline
curl http://localhost:3000/api/journeys/{id}/timeline -H "X-User-Id: user-customer-001"

# Escalate
curl -X POST http://localhost:3000/api/journeys/{id}/escalate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001"
```

---

## ClaimSahay Interactive Browser Demo Walkthrough

Navigate to **`http://127.0.0.1:5173`** in your browser.

1. **Goal Entry & Intent Understanding**:
   - Click the prompt chip `"Query / Rejection"` or type your query.
   - Click **Start ClaimSahay Journey**. The copilot displays detected domain `INSURANCE`, journey type `CLAIM_ASSISTANCE`, and urgency metrics.
2. **Clarification Questions**:
   - Click **Fill Demo Answers** to automatically populate required fields (Hospital, Policy Number, Dates, etc.).
   - Click **Submit All Answers**.
3. **Informed Consent**:
   - Transparent 3-pillar disclosure with granular checkboxes (`DATA_PROCESSING`, `DOCUMENT_ANALYSIS`, `POLICY_VERIFICATION`, `EXTERNAL_SUBMISSION`).
   - Click **Grant Informed Consent & Proceed**.
4. **Document Upload & AI Extraction**:
   - Click **Load Full Synthetic Claim Packet (4 Documents)**.
   - 4 documents appear with checksums and size: Hospital Bill, Discharge Summary, Claim Form, ID Proof.
   - Click **Execute Document AI Pipeline**.
   - OCR runs with extraction timings and prompt-injection sanitization.
5. **Evidence Provenance & Conflict Surfacing**:
   - Inspect 23-26 structured evidence cards with field values, page provenance, and confidence badges.
   - Calm, non-accusatory contradiction warning: Diagnosis mismatch between Discharge Summary (`Acute Appendicitis`) and Hospital Bill (`Appendectomy`).
   - Policy condition alert: Room rent (`₹7,500/day`) exceeding policy cap (`₹5,000/day`).
6. **Policy Citation & Grounded Explanation**:
   - Click **Examine Policy Citations & Grounded Reasoning**.
   - Pinned policy schedule: `POL-HEALTH-2024-001`, `Pinned: 2024-v1`, `Section: Room Rent`, `Page 12`, verbatim quote.
   - Sub-limit calculation table: ₹7,500 vs ₹5,000 = ₹2,500/day excess × 5 days = **₹12,500** out-of-pocket.
   - Grounded AI explanation with 1-click clipboard copy.
   - Test **Cosmetic / Uncovered Procedure** to observe the **RAG No-Source Guardrail** (`UNCERTAIN / HUMAN REVIEW REQUIRED`).
7. **Consequential Review & Approval Gate**:
   - Click **7. Review & Submit**.
   - Review side-by-side **FACT / EVIDENCE** (deterministic facts) vs **AI POLICY EXPLANATION**.
   - Review Action Summary (Action, Why, Evidence, Source).
   - Click **Review & Confirm**. State transitions to `USER_CONFIRMED` and generates approval with payload hash.
   - Click **Confirm and Continue** (with prominent Sandbox / Demo notice). State transitions through workflow to `INSTITUTION_REVIEW`.
   - Message: *"Your case has been submitted for review."*
8. **Audit Timeline & Human Escalation**:
   - Click **8. Audit Timeline** to view 20+ immutable chronological events with timestamps and actor badges.
   - Click **Talk to Specialist** in header or timeline to open **Human Escalation Modal**.
   - Shows *Why escalation is needed*, *What information will be shared* (15-field context packet), and *Current unresolved issue*.
   - Click **Escalate to Human Specialist** → Support Case ID generated, status `OPEN`, journey state transitions to `HUMAN_REVIEW`.

---

## Automated Test Suites

```bash
# 1. ClaimSahay + Lending + Fintech End-to-End Test (18 steps)
npx tsx scripts/e2e-test.ts

# 2. Final Hardening Suite (Auth, Conflicts, RAG, Idempotency, Prompt Injection - 29 assertions)
npx tsx scripts/final-hardening-test.ts

# 3. Jest Unit Test Suite (State Machine, Calculations, Rules, Sanitizer - 44 tests)
npm test
# OR: npx jest
```

## Lending Demo

```bash
# EMI Calculation
curl -X POST http://localhost:3000/api/lending/calculate-emi \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001" \
  -d '{"principal": 1000000, "annualRate": 9.5, "tenureMonths": 60}'

# Affordability
curl -X POST http://localhost:3000/api/lending/affordability \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-customer-001" \
  -d '{"monthlyIncome": 70500, "existingEMI": 5000, "requestedEMI": 21000}'
```

## Fintech Demo

```bash
# Lookup failed transaction
curl http://localhost:3000/api/fintech/transactions/TXN-UPI-2024-FAIL-001 \
  -H "X-User-Id: user-customer-001"
```

## Safe Failure Demo

The system automatically detects:
- **Room rent conflict**: ₹7,500/day vs policy limit ₹5,000/day → POLICY_CONDITION_FLAGGED
- **Income contradiction**: Salary slip ₹70,500 vs Bank statement ₹52,000 → CONTRADICTED

It never silently selects a value — flags issues and recommends actions.

## Troubleshooting

| Issue | Solution |
|---|---|
| Server won't start | Check `.env` exists (copy from `.env.example`) |
| DB errors | Run `npx prisma db push` then `npx tsx scripts/seed.ts` |
| Port in use | Change PORT in `.env` |
| Test fails | Reset DB: delete `prisma/dev.db`, re-push, re-seed |
