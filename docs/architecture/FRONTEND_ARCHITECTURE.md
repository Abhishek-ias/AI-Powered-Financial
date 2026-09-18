# FRONTEND ARCHITECTURE — AI Financial Journey Copilot

**Project**: AI Financial Journey Copilot (Team NOVA)  
**Primary Deep Journey**: ClaimSahay (Evidence-Backed Insurance Claim Settlement)  
**Domains**: Insurance, Lending, Fintech  
**Backend Base URL**: `http://localhost:3000` (FROZEN)  
**Frontend Stack**: React 18 + TypeScript + Vite  

---

## 1. Architectural Principles

1. **Backend as Source of Truth**: The frontend never invents state, scores, or decisions. It strictly reflects backend state transitions, validations, conflicts, evidence, and calculations.
2. **Evidence-First & Explainable AI**: The UI visibly connects:
   `Goal → Questions → Consent → Documents → Extraction → Evidence → Rules/Validation → Policy Citation → Explanation → Next Action → Confirmation → Approval → Submission → Timeline → Escalation`.
3. **Honest Provider Visibility**: Discreetly displays `SANDBOX / DEMO` mode as reported by the backend without claiming live Azure/Cognee/n8n services.
4. **Safe Failure & Conflict Surfacing**: Contradictions (e.g. `Appendicitis` vs `Appendectomy`) and policy condition limits (e.g. ₹7,500 vs ₹5,000 limit) are highlighted as `BLOCKING` with human escalation options; they are never silently auto-resolved.
5. **Separation of Concerns**: Centralized API client, modular domain adapters, reusable design-system components, and typed contracts.

---

## 2. Directory Layout (`frontend/`)

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example              # VITE_API_BASE_URL=http://localhost:3000
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css             # Design tokens, typography, glassmorphism, responsive grid
│   ├── types/
│   │   ├── api.ts            # Typed backend request/response contracts
│   │   ├── journey.ts        # Journey domain, stages, and state-machine types
│   │   ├── evidence.ts       # Extracted fields, confidence scores, conflict types
│   │   └── policy.ts         # Policy clauses, citations, reconciliations
│   ├── api/
│   │   ├── client.ts         # Central fetch wrapper, headers (X-User-Id), error handling
│   │   ├── journeys.ts       # Journey CRUD, intent detection, state sync
│   │   ├── questions.ts      # Dynamic question retrieval & answers
│   │   ├── consent.ts        # Consent scopes & grants
│   │   ├── documents.ts      # Multi-part upload & AI processing
│   │   ├── evidence.ts       # Evidence retrieval & validation
│   │   ├── reconciliation.ts # Policy matching & LLM explanation
│   │   ├── approvals.ts      # Consequential action confirmation & submission
│   │   ├── escalation.ts     # Structured 15-field human support handoff
│   │   ├── timeline.ts       # Event log & audit trail
│   │   ├── lending.ts        # EMI & affordability calculations
│   │   └── fintech.ts        # Transaction dispute resolution
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx    # Logo, user switcher (Customer/Admin), sandbox indicator
│   │   │   ├── Badge.tsx     # Status and severity pills
│   │   │   ├── ConfidenceBadge.tsx # Multi-tier confidence pill (% + label + icon)
│   │   │   ├── ErrorBanner.tsx   # Dismissible error and exception alerts
│   │   │   ├── LoadingState.tsx  # Animated skeleton and spinner loaders
│   │   │   └── Card.tsx      # Glassmorphic container with hierarchy
│   │   ├── journey/
│   │   │   ├── GoalEntryCard.tsx          # Natural language goal entry, prompt chips, intent card
│   │   │   ├── JourneyStepper.tsx         # 9-stage visual milestone stepper
│   │   │   ├── DynamicQuestionnaire.tsx   # Dynamic questions, rationale badges, sequential inputs
│   │   │   ├── ConsentCard.tsx            # 3-pillar transparent data usage & multi-scope consent
│   │   │   ├── DocumentCard.tsx           # Document metadata, status, extraction timings
│   │   │   ├── DocumentUploadSection.tsx  # Drag & drop upload, requirements mapping, test batch generator
│   │   │   ├── EvidenceCard.tsx           # Field, value, page, confidence provenance card
│   │   │   ├── ValidationSummaryCard.tsx  # Metrics, calm contradiction alerts, policy cap warnings
│   │   │   ├── EvidenceSection.tsx        # Filterable & searchable evidence workspace
│   │   │   ├── PolicyCitation.tsx         # Pinned policy clause citation with explanation (Phase 5)
│   │   │   ├── NextBestAction.tsx         # Primary recommended next step with justification (Phase 5)
│   │   │   ├── ReviewApproval.tsx         # Consequential review & cryptographic confirmation (Phase 6)
│   │   │   ├── TimelineView.tsx           # Chronological audit & activity feed (Phase 6)
│   │   │   └── HumanEscalate.tsx          # Structured handoff modal with context packet preview (Phase 6)
│   │   ├── lending/
│   │   │   └── LendingCalculator.tsx  # Interactive EMI, DTI affordability, scenarios
│   │   └── fintech/
│   │       └── DisputeFlow.tsx        # FAILED_BUT_DEBITED resolution interface
│   └── views/
│       ├── ClaimSahayView.tsx         # Primary insurance journey workspace
│       ├── LendingView.tsx            # Lending workspace
│       ├── FintechView.tsx            # Fintech dispute workspace
│       └── AdminAuditView.tsx         # Compliance & audit trail inspector
```

---

## 3. Backend State Mapping

| Backend Status | Human-Friendly Label | Stage | UI Behavior |
|:---|:---|:---:|:---|
| `CREATED` / `GOAL_IDENTIFIED` | "Goal Identified" | Understand | Show detected domain, intent confidence, next prompt |
| `QUESTIONS_PENDING` | "Clarifying Details" | Collect | Present active questions with "Why we ask" |
| `CONSENT_PENDING` | "Consent Required" | Permission | Show specific data purposes; block upload until accepted |
| `DOCUMENTS_PENDING` | "Awaiting Documents" | Collect | Show checklist: Bill, Discharge Summary, Policy, ID |
| `DOCUMENT_PROCESSING` | "Analyzing Documents" | Verify | Show simulated OCR extraction progress per document |
| `VALIDATING` | "Verifying Information" | Verify | Check cross-document consistency & policy terms |
| `NEEDS_ACTION` | "Action Required" | Explain | Surface blocking conflicts & next best action |
| `READY_FOR_REVIEW` | "Ready for Review" | Review | Summary of reconciled claim and policy citations |
| `USER_CONFIRMED` | "Confirmed by You" | Approve | Prepare consequential approval request with payload hash |
| `ACTION_PENDING` | "Pending Approval" | Approve | Explicit "Confirm & Submit" action with warning |
| `SUBMITTED` / `INSTITUTION_REVIEW` | "Under Review" | Track | Mock workflow executed, submitted to insurer |
| `HUMAN_REVIEW` | "Escalated to Specialist" | Track | Support case generated with 15-field context packet |
| `COMPLETED` | "Journey Resolved" | Track | Full timeline, claim settled or dispute closed |

---

## 4. Security & Network Boundary

1. **Authentication**: All API requests inject `X-User-Id` (default: `user-customer-001`, switchable to `user-admin-001`) and `X-User-Role`.
2. **Untrusted Data Isolation**: Document content and raw extracted texts are rendered safely as passive data text nodes without `dangerouslySetInnerHTML`.
3. **No Frontend Secrets**: Environment variables only store `VITE_API_BASE_URL`. Zero credentials or private keys in bundle.
