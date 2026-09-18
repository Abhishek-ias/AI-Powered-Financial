# BUILD STATUS — AI Financial Journey Copilot (ClaimSahay)

## PROJECT
AI Financial Journey Copilot — Team NOVA

## CURRENT PHASE
Phase 0 → Phase 1 (transitioning)

## DEADLINE
02:00 AM IST, 19 September 2026

## DEADLINE MODE
**2–3 HOURS** — MVP first, only healthy integrations, avoid architecture changes

## TIME REMAINING
~3h 18m (as of 22:42 IST)

## COMPLETED PHASES
- [x] Phase 0 — Readiness / Inspection

## IN PROGRESS
- [ ] Phase 1 — Backend Foundation

## BLOCKERS
- Docker NOT available — will use local PostgreSQL or SQLite fallback
- No existing code — greenfield build
- Provider credentials need verification

## LIVE PROVIDERS
| Provider | Status | Mode |
|---|---|---|
| PostgreSQL | PENDING | LOCAL |
| Azure OpenAI | PENDING | UNKNOWN |
| Azure Document Intelligence | PENDING | UNKNOWN |
| Azure AI Search | PENDING | UNKNOWN |
| Cognee | PENDING | UNKNOWN |
| n8n | PENDING | UNKNOWN |

## MOCK PROVIDERS
- All providers will start with MOCK adapters, upgraded to LIVE as credentials are verified

## FEATURE FLAGS
```
ENABLE_AZURE_OPENAI=false
ENABLE_AZURE_DOCUMENT_INTELLIGENCE=false
ENABLE_AZURE_SEARCH=false
ENABLE_COGNEE=false
ENABLE_N8N=false
ENABLE_LENDING=false
ENABLE_FINTECH=false
USE_MOCK_DOCUMENT_AI=true
USE_MOCK_SEARCH=true
USE_MOCK_MEMORY=true
USE_MOCK_WORKFLOW=true
MOCK_INSURER=true
MOCK_LENDER=true
MOCK_FINTECH=true
```

## LAST VERIFIED BUILD
Not yet built

## LAST VERIFIED TESTS
Not yet tested

## KNOWN ISSUES
- Greenfield project — no existing code
- Docker unavailable — manual PostgreSQL or SQLite dev fallback required

## NEXT TASK
Phase 1: Initialize TypeScript/Express project, environment config, health/ready endpoints
