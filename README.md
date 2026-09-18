# AI Financial Journey Copilot

> **One conversation. Every financial goal.**

**Team NOVA** | ClaimSahay | Insurance · Lending · Fintech

[![Backend E2E](https://img.shields.io/badge/Backend%20E2E-18%2F18%20PASS-16A34A)](docs/hackathon/BUILD_STATUS.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-2563EB)](frontend/)
[![Frontend Build](https://img.shields.io/badge/Frontend%20Build-PASS-16A34A)](frontend/)
[![Sandbox Mode](https://img.shields.io/badge/Mode-Sandbox%20%2F%20Mock-D97706)](.env.example)

---

## 1. Overview

AI Financial Journey Copilot is a multi-domain AI-powered financial guidance platform. Users enter a natural-language goal in plain language — "my hospital claim was queried and I don't understand what is missing" — and the system conducts a complete, structured workflow: asking relevant questions, processing documents, validating evidence against policy rules, resolving insurer queries with cited references, and guiding the user to a confirmed, safe resolution.

The same conversational copilot interface extends across three financial domains:

| Domain | Product | Core Workflow |
|---|---|---|
| 🏥 Insurance | ClaimSahay | Claim filing → document OCR → policy check → reconciliation → submission |
| 💰 Lending | Lending Copilot | EMI calculation → DTI affordability → authoritative guidance |
| 📱 Fintech | Dispute Copilot | UPI failure detection → NPCI classification → bank dispute ticket |

---

## 2. Problem

Financial customers face three critical problems:

1. **Insurance complexity**: Claim rejections and queries arrive as dense insurer letters. Customers don't know which document is missing, which policy clause applies, or what to do next.
2. **Lending opacity**: EMI estimates vary across banks. Customers can't verify affordability independently or understand DTI (debt-to-income) calculations.
3. **Payment disputes**: Failed-but-debited UPI transactions leave customers stranded without knowing reversal timelines or how to raise a dispute.

In all three cases, customers either give up or make uninformed decisions.

---

## 3. Solution

> **AI Understands → Rules Validate → Human Approves → Audit Records**

An AI copilot that:

- **Understands intent** from natural language using structured LLM classification
- **Asks only relevant questions** dynamically generated per domain and goal
- **Processes documents** with AI-extracted structured evidence fields (26 fields per claim)
- **Validates evidence** against deterministic policy rules with explainable conflict flags
- **Reconciles disputes** with policy citations (exact clause, page number, version)
- **Guides next actions** with backend-authoritative next best actions
- **Safety gates** consequential decisions behind explicit confirmation and approval
- **Escalates to humans** with a 15-field structured context packet for specialist review

---

## 4. Insurance — ClaimSahay

The flagship deep journey covering the complete hospital claim lifecycle:

**Goal Entry → Intent Classification → Dynamic Questions → Consent → Document Upload → OCR Processing → Evidence Extraction → Validation → Policy Reconciliation → Conflict Resolution → Next Best Action → Confirmation → Approval → Submission → Timeline → Human Escalation**

Key capabilities:
- Room-rent sub-limit detection and patient-payable calculation
- Diagnosis contradiction flagging (cross-document OCR comparison)
- Policy clause citations with page numbers (RAG-based)
- Insurer query response generation
- 15-field escalation context packet for human specialists

---

## 5. Lending Copilot

Standard reducing-balance EMI computation with RBI FOIR-compliant affordability checking.

- Formula: `EMI = P × R × (1+R)^N / ((1+R)^N - 1)`
- DTI threshold: 50% (RBI-aligned FOIR)
- Result: "Affordability Criteria Met" or "Exceeds Recommended DTI" — never "Loan Approved"

---

## 6. Fintech Dispute Copilot

NPCI-aligned UPI transaction dispute triage:

- Classifies: FAILED_BUT_DEBITED, TIMEOUT, MERCHANT_CREDIT_FAILURE
- Auto-reversal timeline: T+1 or T+2 business days
- Generates bank dispute ticket with immutable reference
- Compliant with NPCI Circular dispute resolution directives

---

## 7. Architecture

```
Browser (React 18 + TypeScript + Vite)
    │
    │ HTTP REST
    ▼
Express.js API (Node.js + TypeScript)  →  SQLite / PostgreSQL (Prisma ORM)
    │
    ├── Journey State Machine (FSM)
    ├── Rules Engine (Policy / DTI / NPCI)
    └── Integrations (Azure OpenAI, Document AI, Azure Search — all Mock in sandbox)
```

See [Architecture Details →](docs/architecture/README.md)

---

## 8. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Lucide Icons |
| Styling | Vanilla CSS (custom design system — no Tailwind) |
| Backend | Node.js, Express.js, TypeScript |
| Database | SQLite (dev/sandbox) / PostgreSQL (production) |
| ORM | Prisma |
| AI (mock) | Azure OpenAI GPT-4o |
| Document AI (mock) | Azure Document Intelligence |
| Vector Search (mock) | Azure Cognitive Search |
| Memory (mock) | Cognee |
| Workflow (mock) | n8n |

---

## 9. Repository Structure

```
/
├── README.md                          # This file
├── docs/
│   ├── architecture/README.md         # Full system architecture
│   ├── api/openapi.yaml               # OpenAPI 3.0 contract
│   ├── demo/DEMO_FLOW.md              # Judge demonstration script
│   ├── hackathon/                     # Build status, audit reports
│   └── decisions/ARCHITECTURE_DECISIONS.md
│
├── frontend/                          # React 18 + TypeScript SPA
│   └── src/
│       ├── pages/                     # Composed top-level page views
│       ├── features/
│       │   ├── claimsahay/            # Insurance journey (15 components)
│       │   ├── lending/               # EMI + Affordability
│       │   ├── fintech/               # UPI Dispute Triage
│       │   ├── journeys/              # Audit log
│       │   └── support/               # Human Specialist Desk
│       ├── components/
│       │   ├── ui/                    # Shared primitive components
│       │   └── layout/                # Header, Footer
│       ├── api/                       # HTTP client layer
│       └── types/                     # Shared TypeScript models
│
├── src/                               # Backend Express.js source
│   ├── modules/                       # Domain business logic
│   ├── rules/                         # Policy + DTI + NPCI rules
│   ├── state-machine/                 # Journey FSM
│   └── integrations/                  # External provider wrappers
│
├── prisma/schema.prisma               # Database schema
├── scripts/                           # e2e-test.ts, seed.ts
└── tests/                             # Backend tests
```

---

## 10. Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Backend

```bash
# Install dependencies
npm install

# Setup database
npx prisma db push
npx tsx scripts/seed.ts

# Start backend
npm run dev
# → http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Environment

The root `.env` contains all configuration (copy from `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:3000
DATABASE_URL=file:./dev.db
MOCK_AI=true
MOCK_DOCUMENT_AI=true
# ... all providers default to MOCK in sandbox mode
```

### Verify Backend

```bash
npx tsx scripts/e2e-test.ts
# Expected: 18/18 ClaimSahay steps + Lending + Fintech → ALL TESTS PASSED
```

---

## 11. Demo Flow

See the complete step-by-step judge demonstration script: [docs/demo/DEMO_FLOW.md](docs/demo/DEMO_FLOW.md)

**Quick path:**
1. Open http://localhost:5173
2. Enter goal → ClaimSahay journey → Answer questions → Upload docs → View evidence → Policy check → Confirm → Approve → Timeline → Escalate
3. Switch to Lending → Calculate EMI → Check affordability
4. Switch to Fintech → Lookup UPI failure → Raise dispute

---

## 12. Security

- **No real PII**: All data is synthetic in sandbox mode
- **No credentials in frontend**: Only `VITE_API_BASE_URL` in frontend `.env`
- **Consequential gates**: Confirmation required before every financial action
- **Sandbox disclaimer**: "This is a MOCK submission. No real financial action has been taken." on every submission
- **Audit trail**: 37+ immutable timestamped events per journey
- **RBAC**: Customer / Claims Specialist / Admin persona switcher
- **No LLM decisions**: AI explains only; all financial outcomes from deterministic rules

---

## 13. Sandbox & Mock Integrations

All external provider integrations run in mock mode during this hackathon submission. Deterministic responses are configured in `/src/integrations/` and controlled via `.env` feature flags.

| Integration | Mock Behavior |
|---|---|
| Azure OpenAI | Returns structured intent classification and explanations |
| Azure Document Intelligence | Returns realistic OCR extraction with 26 fields per document |
| Azure Cognitive Search | Returns policy citations with clause + page number |
| Mock Insurer API | Accepts claim submissions, returns `SUBMITTED` status |
| Mock Lender API | Accepts loan applications, returns `SUBMITTED` status |
| Mock Fintech / NPCI | Returns transaction status, accepts dispute registration |

The production path replaces all mock flags with real API credentials in environment variables — zero code changes required.

---

## 14. Future Scope

- **Live Azure OpenAI integration**: Replace mock LLM with GPT-4o for adaptive question generation and richer explanations
- **Real Document Intelligence**: Connect Azure Document Intelligence for actual PDF/image OCR
- **Multi-language support**: Hindi, Tamil, Marathi (backend already accepts `language` field)
- **Real insurer API integration**: PolicyBazaar, Digit, Star Health API adapters
- **Mobile-first PWA**: Offline document capture and progressive form submission
- **WhatsApp / IVR interface**: Regional language financial guidance over messaging channels
- **Cross-domain journeys**: E.g., insurance claim denial → lending product recommendation
- **Regulatory reporting**: Pre-built export for IRDAI, RBI, NPCI compliance audit requirements

---

## E2E Test

```bash
npx tsx scripts/e2e-test.ts
```

Expected output: `🎉 ============= ClaimSahay E2E Test PASSED =============` + Lending + Fintech all pass.

---

**Team NOVA** — Built for the AI Financial Journey Copilot Hackathon
