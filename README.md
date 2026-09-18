# AI Financial Journey Copilot — Backend

**Team NOVA | ClaimSahay**

An AI-powered financial journey copilot that assists with insurance claims, lending applications, and fintech disputes. The system understands natural language goals, processes documents intelligently, validates evidence with deterministic rules, and guides users through complete financial workflows — while keeping consequential decisions under human control.

## Quick Start

```bash
npm install
npx prisma db push
npx tsx scripts/seed.ts
npm run dev
```

Server starts at `http://localhost:3000`

## Endpoints

| Endpoint | Description |
|---|---|
| `GET /health` | Health check |
| `GET /ready` | Provider readiness + feature flags |
| `POST /api/journeys` | Create journey (supports natural language) |
| `GET /api/journeys/:id` | Get journey with all related data |
| `POST /api/journeys/:id/intent` | Detect intent from message |
| `GET /api/journeys/:id/questions` | Get dynamic questions |
| `POST /api/journeys/:id/questions/:qid/answer` | Answer a question |
| `POST /api/journeys/:id/consent` | Grant consent |
| `POST /api/journeys/:id/documents` | Upload document |
| `POST /api/journeys/:id/process-documents` | Run Document AI pipeline |
| `GET /api/journeys/:id/evidence` | Get extracted evidence |
| `GET /api/journeys/:id/validation` | Get validation results |
| `POST /api/journeys/:id/reconcile` | Reconcile policy vs evidence |
| `GET /api/journeys/:id/next-actions` | Get next best actions |
| `POST /api/journeys/:id/confirm` | Confirm information |
| `POST /api/journeys/:id/approve` | Approve consequential action |
| `POST /api/journeys/:id/escalate` | Escalate to human |
| `GET /api/journeys/:id/timeline` | Journey timeline |
| `GET /api/journeys/:id/audit` | Audit events |
| `POST /api/insurance/claims` | Create insurance claim |
| `POST /api/lending/calculate-emi` | Calculate EMI |
| `POST /api/lending/affordability` | Check affordability |
| `GET /api/fintech/transactions/:ref` | Lookup transaction |
| `POST /api/fintech/disputes` | Create dispute |

## Domains

- **Insurance** (ClaimSahay) — Full claim lifecycle with policy reconciliation
- **Lending** — EMI calculations, affordability, loan applications
- **Fintech** — Transaction disputes, failed payment detection

## Safety

- All data is **SYNTHETIC** — no real financial data
- LLM explains, does NOT decide financial outcomes
- Consequential actions require user confirmation
- Mock providers clearly labeled as MOCK
- Human escalation with structured context packet

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Demo Playbook](docs/DEMO_PLAYBOOK.md)
- [Build Status](docs/BUILD_STATUS.md)

## E2E Test

```bash
npx tsx scripts/e2e-test.ts
```
