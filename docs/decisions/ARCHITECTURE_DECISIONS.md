# Architecture Decisions

## ADR-001: Light Professional Theme vs. Dark Dashboard
**Decision**: Light fintech SaaS color palette (#F7F9FC background, #0F172A text)  
**Reasoning**: Financial services products require trustworthiness, clarity, and enterprise credibility. Dark "AI demo" aesthetics reduce user confidence in claims decisions.  
**Alternatives rejected**: Neon glassmorphism, dark mode, cyberpunk-inspired dashboards.

## ADR-002: Backend-Authoritative State Machine
**Decision**: All journey state transitions happen exclusively in the backend (Journey FSM).  
**Reasoning**: Safety-critical financial decisions (confirmation, approval, submission) must be validated server-side. Frontend never invents approval outcomes.  
**Impact**: Frontend is display-only for status. Every state change requires a real API call.

## ADR-003: Feature-Driven Frontend Organization
**Decision**: `frontend/src/features/` with domain modules (claimsahay, lending, fintech, journeys, support).  
**Reasoning**: Avoids "flat components folder" anti-pattern. Each domain team can work independently. Business logic is co-located with its UI.

## ADR-004: Sandbox-First with Mock Providers
**Decision**: All external providers (Azure OpenAI, Document AI, Azure Search, Cognee, n8n) run in mock mode via `MOCK_*` environment flags.  
**Reasoning**: Hackathon demo environment cannot guarantee external service availability. Deterministic mock responses ensure reliable judges demos.

## ADR-005: No Misleading Approval Language
**Decision**: Never display "Loan Approved" or "Claim Approved" unless explicitly returned by backend in that state.  
**Reasoning**: Regulatory compliance for customer-facing financial products. Frontend displays: "Affordability Criteria Met", "Claim Submitted", "HUMAN_REVIEW".

## ADR-006: Human-in-the-Loop Escalation
**Decision**: Every journey has a visible "Escalate to Specialist" button surfacing a 15-field context packet.  
**Reasoning**: AI copilots must have clear human oversight paths for complex or disputed financial claims.

## ADR-007: SQLite for Hackathon Portability
**Decision**: SQLite (via Prisma) instead of PostgreSQL for local demo.  
**Reasoning**: Eliminates database server dependency for judges running locally. Production path switches to PostgreSQL via `DATABASE_URL` env variable without code changes.
