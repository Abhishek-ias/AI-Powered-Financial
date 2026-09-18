# Architecture — AI Financial Journey Copilot

## Team NOVA — ClaimSahay

## Architecture Overview

```
FRONTEND (teammate-owned)
   ↓ HTTP/JSON
EXPRESS API (PORT 3000)
   ↓
AUTHENTICATION (X-User-Id / X-User-Role headers)
   ↓
AUTHORIZATION (role-based: CUSTOMER, AGENT, ADMIN)
   ↓
JOURNEY ORCHESTRATOR
   ↓
INTENT DETECTION → STATE MACHINE → QUESTION ENGINE
   ↓
CONSENT MANAGER
   ↓
DOCUMENT PIPELINE
   ↓
DOCUMENT AI (Mock / Azure Document Intelligence)
   ↓
EVIDENCE ENGINE (provenance, confidence, source tracking)
   ↓
VALIDATION / RECONCILIATION (deterministic conflict detection)
   ↓
KNOWLEDGE / RAG (Mock / Azure AI Search — policy version pinning)
   ↓
LLM EXPLANATION (Mock / Azure OpenAI — explains, does NOT decide)
   ↓
NEXT BEST ACTION (deterministic rules engine)
   ↓
APPROVAL BOUNDARY (idempotent, payload-integrity verified)
   ↓
WORKFLOW (Mock / n8n)
   ↓
MOCK FINANCIAL INSTITUTIONS (insurer, lender, fintech)
   ↓
TIMELINE + AUDIT
```

## Technology Stack

| Component | Technology |
|---|---|
| Runtime | Node.js v22, TypeScript |
| Framework | Express |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma |
| Validation | Zod |
| Document AI | Mock adapter (Azure DI ready) |
| Knowledge/RAG | Mock adapter (Azure AI Search ready) |
| LLM | Mock adapter (Azure OpenAI ready) |
| Workflow | Mock adapter (n8n ready) |
| Memory | Mock adapter (Cognee ready) |

## Module Structure

```
src/
  app.ts                          — Express app setup
  server.ts                       — Entry point
  config/
    env.ts                        — Zod-validated environment
    database.ts                   — Prisma singleton
  middleware/
    auth.ts                       — Authentication + authorization
    errors.ts                     — Centralized error handling
    requestId.ts                  — Request tracing
  routes/
    api.ts                        — All API endpoints
  modules/
    journeys/service.ts           — Journey CRUD + state transitions
    intent/service.ts             — Natural language intent detection
    questions/service.ts          — Dynamic question engine
    consent/service.ts            — Explicit consent management
    documents/service.ts          — Upload, validation, processing
    evidence/service.ts           — Evidence with provenance
    requirements/service.ts       — Dynamic requirements
    validation/service.ts         — Deterministic validation
    reconciliation/service.ts     — Policy vs evidence vs query
    next-best-action/service.ts   — Deterministic action engine
    approvals/service.ts          — Idempotent approval flow
    escalation/service.ts         — Structured human escalation
    calculations/service.ts       — EMI, affordability (deterministic)
    audit/service.ts              — Audit event logging
    timeline/service.ts           — Chronological journey events
  integrations/mock/
    document-ai.ts                — Mock Document Intelligence
    knowledge.ts                  — Mock RAG/Knowledge provider
    llm.ts                        — Mock LLM provider
    workflow.ts                   — Mock workflow (n8n)
    financial-systems.ts          — Mock insurer/lender/fintech
  state-machine/
    index.ts                      — Explicit state transition map
  types/
    index.ts                      — All type definitions
  utils/
    response.ts                   — Standardized API responses
```

## Database Entities (27 tables)

User, Journey, Consent, Question, Document, DocumentField,
EvidenceItem, Requirement, ValidationResult, Policy, PolicyVersion,
Claim, InsurerQuery, Reconciliation, Calculation, Offer, Application,
ApplicationEvent, Transaction, Dispute, ApprovalRequest, SupportCase,
TimelineEvent, AuditEvent, WorkflowRun

## State Machine

```
CREATED → GOAL_IDENTIFIED → QUESTIONS_PENDING → CONSENT_PENDING
→ DOCUMENTS_PENDING → DOCUMENT_PROCESSING → VALIDATING
→ NEEDS_ACTION / READY_FOR_REVIEW → USER_CONFIRMED
→ ACTION_PENDING → SUBMITTED → INSTITUTION_REVIEW
→ QUERY_RECEIVED → RECONCILIATION_PENDING → HUMAN_REVIEW
→ COMPLETED / FAILED
```

## Provider Adapter Pattern

All external integrations use interfaces:
- `DocumentAIProvider` — Mock + Azure Document Intelligence
- `KnowledgeProvider` — Mock + Azure AI Search
- `LLMProvider` — Mock + Azure OpenAI
- `WorkflowProvider` — Mock + n8n
- `MemoryProvider` — Mock + Cognee

Feature flags control mock vs live mode.

## Safety Boundaries

1. LLM explains, does NOT decide or approve
2. Deterministic rules handle calculations and validation
3. Consequential actions require user confirmation
4. Approval requests use idempotency + payload integrity
5. All state transitions validated by state machine
6. Document content treated as untrusted data
7. Mock mode explicitly labeled — never pretended to be live
8. Evidence tracks provenance (document, page, confidence)
9. No real financial data — all synthetic
10. Human escalation with structured context packet
