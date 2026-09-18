# Architecture Overview — AI Financial Journey Copilot

**Team NOVA** | ClaimSahay | Insurance + Lending + Fintech

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER / BROWSER                               │
│           React 18 + TypeScript + Vite (SPA)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express.js)                     │
│                    http://localhost:3000                        │
│                                                                 │
│  /health        /ready        /api/journeys                     │
│  /api/lending   /api/fintech  /api/support                      │
└──────┬───────────────────┬──────────────────┬───────────────────┘
       │                   │                  │
       ▼                   ▼                  ▼
┌──────────────┐  ┌────────────────┐  ┌──────────────────────────┐
│ State Machine│  │  Rules Engine  │  │  Integrations (MOCK)     │
│ (Journey FSM)│  │  (Policy/DTI/  │  │  Azure OpenAI (mock)     │
│              │  │   NPCI rules)  │  │  Document AI (mock)      │
│              │  │                │  │  Azure Search (mock)     │
└──────┬───────┘  └────────────────┘  │  Mock Insurer API        │
       │                               │  Mock Lender API         │
       ▼                               │  Mock Fintech API        │
┌──────────────┐                       └──────────────────────────┘
│ SQLite DB    │
│ (Prisma ORM) │
└──────────────┘
```

---

## Frontend Architecture

```
frontend/src/
├── App.tsx                    # Root orchestrator — tabs, routing, state
│
├── pages/                     # Top-level composed page views
│   ├── HomePage.tsx
│   ├── ClaimSahayPage.tsx
│   ├── LendingPage.tsx
│   ├── FintechPage.tsx
│   ├── JourneysPage.tsx
│   └── SupportPage.tsx
│
├── features/                  # Domain-driven feature modules
│   ├── claimsahay/            # Insurance ClaimSahay (15 components)
│   │   ├── ClaimSahayView.tsx
│   │   └── components/        # GoalEntry, Questions, Consent, Documents,
│   │                          # Evidence, Policy, Reconcile, Review, Timeline
│   ├── lending/               # EMI + Affordability Copilot
│   ├── fintech/               # UPI Dispute Triage
│   ├── journeys/              # Audit log & journey history
│   └── support/               # Human Specialist Desk
│
├── components/
│   ├── ui/                    # Primitive shared UI components
│   │   ├── Card, Badge, ConfidenceBadge
│   │   ├── ErrorBanner, LoadingState
│   └── layout/                # App shell
│       ├── Header.tsx
│       └── Footer.tsx
│
├── api/                       # Centralized HTTP clients
│   ├── client.ts              # Health, ready, auth
│   ├── journeys.ts            # Full ClaimSahay journey API
│   ├── lending.ts             # EMI + Affordability
│   └── fintech.ts             # UPI Dispute
│
├── types/
│   └── index.ts               # All shared TypeScript models
│
└── styles/
    └── variables.css          # Design tokens (colors, spacing, shadow)
```

---

## Backend Architecture

```
src/
├── server.ts                  # Express entry point
├── app.ts                     # App setup, middleware, routes
│
├── config/                    # Environment, feature flags, providers
├── routes/                    # Express route registrations
├── modules/                   # Business domain modules
│   ├── journey/               # Journey CRUD + state machine
│   ├── insurance/             # ClaimSahay insurance business logic
│   ├── lending/               # EMI calculation, affordability DTI
│   └── fintech/               # UPI dispute triage
│
├── rules/                     # Deterministic policy rules engine
├── state-machine/             # Journey FSM (CREATED → HUMAN_REVIEW)
├── integrations/              # External provider wrappers (all mock in sandbox)
├── middleware/                # Auth, logging, error handling
├── utils/                     # Shared utilities
└── types/                     # Backend TypeScript models

prisma/
└── schema.prisma              # SQLite database schema (frozen)
```

---

## Data Flow: ClaimSahay Journey

```
1. USER enters natural-language goal
   → POST /api/journeys/initialize
   → Backend creates Journey (CREATED)
   → AI classifies intent (INSURANCE / CLAIM_ASSISTANCE)

2. Dynamic Questions
   → POST /api/journeys/:id/questions (answer batch)
   → State transitions to CONSENT_PENDING

3. Consent
   → POST /api/journeys/:id/consent
   → State transitions to DOCUMENTS_PENDING

4. Document Upload + OCR
   → POST /api/journeys/:id/documents (multipart)
   → POST /api/journeys/:id/process-documents
   → Mock Document AI extracts structured fields

5. Evidence Validation
   → GET /api/journeys/:id/evidence
   → GET /api/journeys/:id/validation
   → Policy conditions checked (room rent, diagnosis contradiction)

6. Policy Reconciliation
   → POST /api/journeys/:id/reconcile
   → Insurer query resolved via RAG (mock Azure AI Search)
   → Citations: Policy clause + page number

7. Consequential Confirmation (Safety Gate)
   → POST /api/journeys/:id/confirm
   → State → USER_CONFIRMED

8. Approval
   → POST /api/journeys/:id/approve
   → State → COMPLETED | SUBMITTED

9. Timeline & Escalation
   → GET /api/journeys/:id/timeline
   → POST /api/journeys/:id/escalate → HUMAN_REVIEW
```

---

## Provider Modes

| Provider | Live Mode | Sandbox Mode |
|---|---|---|
| Database | PostgreSQL | SQLite (local file) |
| AI (LLM) | Azure OpenAI GPT-4o | Deterministic mock |
| Document OCR | Azure Document Intelligence | Mock extraction |
| Vector Search | Azure Cognitive Search | Mock RAG citations |
| Memory | Cognee | Mock |
| Workflow | n8n | Mock |
| Insurer API | Real | Mock endpoint |
| Lender API | Real | Mock endpoint |
| Fintech API | Real (NPCI) | Mock endpoint |

All sandbox responses are deterministic and fully controlled by backend rules.

---

## Security Posture

- No real PII stored or transmitted in sandbox mode
- All submissions are flagged: `"This is a MOCK submission. No real financial action has been taken."`
- No credentials or API keys in frontend source
- RBAC via `X-User-ID` and `X-User-Role` headers (CUSTOMER | AGENT | ADMIN)
- Immutable audit trail: All events recorded in `AuditEvent` table
