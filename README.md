# AI Financial Journey Copilot

> **One conversation. Every financial goal. A simpler, faster, more human financial journey.**

AI Financial Journey Copilot is an intelligent, explainable and auditable platform that simplifies customer-facing financial journeys across:

- 🛡️ **Insurance**
- 💰 **Lending**
- 💳 **Fintech**

Instead of forcing customers to understand complex forms, policies, documents, and workflows on their own, the platform guides them through the journey using AI, document intelligence, policy-aware reasoning, deterministic validation, next-best-action recommendations, explicit approval gates, and human escalation.

---

## 🚀 Overview

Financial journeys are often fragmented and difficult to navigate.

A customer may need to:

- understand a policy or financial product
- answer lengthy questions
- collect multiple documents
- understand complex terms
- resolve conflicting information
- determine what action to take next
- contact customer support
- repeatedly provide the same information

The **AI Financial Journey Copilot** turns these fragmented interactions into a guided end-to-end journey.

### Core principle

```text
AI Understands
      ↓
Rules Validate
      ↓
AI Explains
      ↓
Next Best Action
      ↓
Customer Confirms
      ↓
Human Approves
      ↓
Action Executes
      ↓
Audit Records

The system is designed so that AI assists the customer without becoming an uncontrolled decision maker.

🎯 Problem Statement

Financial-service journeys often suffer from:

complicated forms
fragmented information
document-heavy processes
difficult policy language
unclear rejection or query reasons
repeated customer interactions
lack of transparency
weak continuity across the journey
unnecessary human escalation
unclear next steps

Customers need more than a chatbot.

They need a system that can understand their goal, gather the right information, validate evidence, explain decisions, recommend actions, and maintain context throughout the journey.

💡 Our Solution

The AI Financial Journey Copilot provides a reusable journey layer for financial services.

A customer starts with a natural-language goal.

The system then:

Understands the customer's intent
Asks only relevant questions
Captures user consent
Accepts supporting documents
Extracts structured evidence
Validates evidence using deterministic rules
Retrieves and cites relevant policy information
Detects contradictions and conflicts
Explains complex financial conditions in simple language
Recommends the next best action
Requires customer confirmation for consequential actions
Applies explicit approval gates
Executes the available workflow
Tracks the entire journey
Maintains an auditable timeline
Escalates to a human specialist when needed
🧩 Three Financial Domains
1. 🛡️ Insurance — ClaimSahay

ClaimSahay is our deepest implementation of the Financial Journey Copilot.

It helps customers navigate an insurance-claim journey from initial intent through submission and tracking.

ClaimSahay Journey
Understand
    ↓
Check
    ↓
Explain
    ↓
Fix
    ↓
Submit
    ↓
Recover / Track
ClaimSahay capabilities
Natural-language claim initiation
Dynamic question generation
Granular customer consent
Document upload
Document intelligence / OCR
Evidence extraction
Policy-aware validation
Policy condition checking
Conflict detection
Reconciliation
Exact policy citation
Explainable AI guidance
Next Best Action
Customer confirmation
Explicit approval gate
Sandbox claim submission
Status tracking
Audit timeline
Human escalation
Example

A customer submits a hospitalization claim.

The uploaded documents indicate:

Room Rent: ₹7,500/day

while the applicable policy condition contains:

Room Rent Limit: ₹5,000/day

The system does not simply return:

"Claim Rejected"

Instead, it:

identifies the mismatch
surfaces the relevant evidence
cites the policy condition
explains the possible implication
recommends the next action
keeps the customer in control
records the decision path

This creates a much more transparent financial journey.

💰 2. Lending Copilot

The same journey architecture is extended to lending.

The Lending Copilot can help customers understand borrowing scenarios through deterministic financial calculations and affordability checks.

Current capabilities
Loan/financing input capture
EMI calculation
Affordability evaluation
DTI-based assessment
Clear result communication
Guided next steps
Important design principle

The frontend does not invent lending decisions.

For example, the interface avoids misleading statements such as:

Loan Approved

unless such a state is explicitly returned by the backend.

Instead, authoritative states can include:

Affordability Criteria Met
Exceeds Recommended DTI
Additional Information Required
Review in Progress

This keeps the customer-facing journey aligned with backend-authoritative results.

💳 3. Fintech Dispute Copilot

The Fintech journey focuses on payment and transaction-dispute workflows.

Current capabilities
Payment dispute initiation
Transaction context capture
Deterministic dispute triage
Reversal timeline calculation
Customer-friendly explanation
Dispute ticket generation
Journey/status tracking

The objective is to reduce the complexity customers experience when a payment fails, is reversed, or requires investigation.

🧠 Core Product Capabilities
1. Cross-Domain Financial Journeys

A common journey architecture can support:

Insurance
Lending
Fintech

without forcing every domain to implement a completely separate customer experience.

2. Goal-Based Interaction

Instead of presenting a long form immediately, the customer starts with a goal.

Example:

"I was hospitalized and want to know whether my expenses are covered."

The system determines what information is relevant to the journey.

3. Dynamic Questioning

The system collects information progressively.

Instead of asking every possible question:

Question
↓
Answer
↓
Determine next relevant question
↓
Continue

This reduces unnecessary friction.

4. Document Intelligence

Customer documents can contain unstructured information.

The platform uses document processing to extract useful evidence.

Example:

Document
    ↓
Extraction
    ↓
Structured Evidence
    ↓
Validation

This helps transform documents into actionable journey context.

5. Policy-Aware RAG

For insurance journeys, the system can retrieve relevant policy content and present grounded explanations.

Important information is surfaced together with source/citation context.

The system is designed to avoid presenting unsupported policy claims as facts.

6. Conflict Detection

The platform can identify conflicting information across sources.

Example:

Document A:
Acute Appendicitis

Document B:
Acute Gastritis

Instead of silently choosing one value, the system surfaces the contradiction for review.

7. Explainable AI

The user should be able to understand:

What was found?
Why does it matter?
What policy/rule applies?
What should I do next?

The goal is to make complex financial processes understandable rather than opaque.

8. Next Best Action Engine

At important points in the journey, the system identifies the next useful action.

Examples:

Upload missing document
Review a policy conflict
Confirm extracted information
Provide additional evidence
Request human assistance
Proceed with submission
9. Financial Journey Passport

The platform is designed around reusable journey context.

This creates a foundation for a customer to continue across financial journeys without repeatedly rebuilding their context from zero.

Conceptually:

Customer
   ↓
Journey Context
   ↓
Insurance
Lending
Fintech
10. Human-in-the-Loop

AI should not silently perform every consequential action.

The system supports:

AI Assistance
     ↓
Customer Confirmation
     ↓
Approval
     ↓
Action

When automated handling is insufficient, the journey can be escalated to a human specialist with structured context.

11. Auditability

Important journey events are recorded chronologically.

Example:

Goal Created
Questionnaire Completed
Consent Recorded
Document Uploaded
Evidence Extracted
Policy Conflict Detected
Reconciliation Performed
Next Action Generated
Customer Confirmed
Approval Recorded
Submission Initiated
Submission Completed
Status Updated
Human Escalation

This makes the journey easier to trace and review.

🏗️ System Architecture
                    ┌───────────────────────┐
                    │       Customer        │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ React + TypeScript    │
                    │     Frontend          │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │     REST API Layer    │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Node.js + Express     │
                    │       Backend         │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │ AI Reasoning │  │ Document     │  │ RAG / Search │
      │              │  │ Intelligence │  │              │
      └──────────────┘  └──────────────┘  └──────────────┘
              │                 │                 │
              └─────────────────┼─────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Rules + Workflows     │
                    │ + Orchestration       │
                    └───────────┬───────────┘
                                │
                  ┌─────────────┼──────────────┐
                  │             │              │
                  ▼             ▼              ▼
          ┌────────────┐ ┌────────────┐ ┌────────────┐
          │ Insurance  │ │  Lending   │ │  Fintech   │
          └────────────┘ └────────────┘ └────────────┘

                                │
                                ▼
                    ┌───────────────────────┐
                    │ Database / Storage    │
                    └───────────────────────┘
🛠️ Technology Stack
Frontend
React 18
TypeScript
Vite
HTML5
CSS
Responsive component-based UI
Backend
Node.js
Express.js
TypeScript
REST APIs
Prisma ORM
Database
PostgreSQL — intended production database
SQLite — current local/demo fallback
AI & Intelligence
Azure OpenAI
Azure AI Document Intelligence
Azure AI Search
Cognee
Workflow & Automation
n8n
Storage
Azure Blob Storage
Integrations

Sandbox/Mock integrations for:

Insurance workflows
Lending workflows
Fintech/payment workflows
🔐 Security & Safety

Security and controlled automation are core design principles.

Authentication & Authorization

The platform includes:

Authentication
Role-based access control
Customer/admin role separation
Prompt-Injection Protection

User-provided and document-derived content is handled with sanitization and validation barriers so that untrusted content cannot directly control critical business actions.

Deterministic Decisions

Critical workflow decisions are not delegated purely to generative AI.

The architecture separates:

AI Reasoning
      +
Deterministic Rules
      +
Explicit Approval
Approval Controls

Consequential actions require explicit customer confirmation and approval before execution.

Audit Trail

Important workflow transitions and actions are recorded.

Secrets

Frontend code should only expose non-sensitive configuration such as:

VITE_API_BASE_URL=http://localhost:3000

Sensitive credentials must remain server-side.

🌐 Frontend ↔ Backend

The frontend communicates with the backend through REST APIs.

Typical development setup:

Frontend
http://127.0.0.1:5173

Backend
http://localhost:3000

Example:

React UI
   ↓
REST API
   ↓
Express Backend
   ↓
Business Logic / Rules
   ↓
Database / Integrations
   ↓
Response
   ↓
React UI Update
📁 Repository Structure
AI-Powered-Financial/
│
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── src/
│   │   ├── app/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── layout/
│   │   ├── features/
│   │   │   ├── claimsahay/
│   │   │   ├── lending/
│   │   │   ├── fintech/
│   │   │   ├── journeys/
│   │   │   └── support/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants/
│   │
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── rules/
│   │   ├── workflows/
│   │   ├── integrations/
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── demo/
│   ├── hackathon/
│   └── decisions/
│
├── scripts/
│
├── .gitignore
└── README.md
▶️ Getting Started
Prerequisites

Install:

Node.js 18+
npm
Git

Depending on your environment, PostgreSQL/Docker may also be required for production-style infrastructure.

⚙️ Backend Setup
cd backend
npm install

Create a local environment file:

cp .env.example .env

Configure the required environment variables.

Start the backend:

npm run dev

Expected development endpoint:

http://localhost:3000
🎨 Frontend Setup

Open another terminal:

cd frontend
npm install

Create:

frontend/.env

with:

VITE_API_BASE_URL=http://localhost:3000

Start the frontend:

npm run dev

Open:

http://127.0.0.1:5173
🧪 Testing

The project includes unit/integration/E2E verification where applicable.

Frontend checks
npm run build
TypeScript

Run the project's configured TypeScript validation command.

Backend tests
npm test
End-to-End

The ClaimSahay journey has been verified across:

Goal
→ Questions
→ Consent
→ Documents
→ Evidence
→ Policy Validation
→ Reconciliation
→ Next Best Action
→ Confirmation
→ Approval
→ Submission
→ Timeline
→ Human Escalation

Current verified ClaimSahay E2E coverage:

18 / 18 checkpoints passed
🧭 Demo Flow
Insurance — ClaimSahay

Recommended demonstration:

Home
 ↓
Insurance
 ↓
Start a Claim
 ↓
Enter Customer Goal
 ↓
Dynamic Questions
 ↓
Consent
 ↓
Document Upload
 ↓
Evidence Extraction
 ↓
Policy Validation
 ↓
Conflict Detection
 ↓
Policy Citation
 ↓
Reconciliation
 ↓
Next Best Action
 ↓
Customer Confirmation
 ↓
Approval
 ↓
Sandbox Submission
 ↓
Status
 ↓
Audit Timeline
 ↓
Human Escalation
Lending
Lending
 ↓
Enter financial inputs
 ↓
Calculate EMI
 ↓
Evaluate affordability
 ↓
DTI assessment
 ↓
Explain result
 ↓
Next action
Fintech
Fintech
 ↓
Payment dispute
 ↓
Transaction verification
 ↓
Dispute triage
 ↓
Reversal timeline
 ↓
Ticket generation
 ↓
Status tracking
🧪 Example ClaimSahay Scenario

A synthetic customer submits a hospitalization claim.

Customer goal

"I was hospitalized and want to know whether my medical expenses are covered and file a claim."

Example evidence
Hospitalization:
10 Sep 2026 – 13 Sep 2026

Diagnosis:
Acute Appendicitis

Room Rent:
₹7,500/day

Total Bill:
₹96,500
Example policy condition
Room Rent Limit:
₹5,000/day

The system detects the policy conflict, explains the relevant condition, and recommends the appropriate next action rather than silently rejecting or approving the claim.

🧠 Why This Is More Than a Chatbot

A conventional chatbot may:

Question
 ↓
Answer

The Financial Journey Copilot provides:

Goal Understanding
       ↓
Context Collection
       ↓
Document Intelligence
       ↓
Evidence Validation
       ↓
Policy / Rule Evaluation
       ↓
Explanation
       ↓
Next Best Action
       ↓
Customer Confirmation
       ↓
Approval
       ↓
Action
       ↓
Tracking
       ↓
Human Escalation
       ↓
Audit

This transforms AI from a conversational interface into a journey orchestration layer.

🏦 Cross-Domain Design

The platform is intentionally designed as a reusable foundation.

                AI Financial Journey Copilot
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
        Insurance       Lending        Fintech
            │              │              │
        Claims            EMI          Disputes
        Policies          DTI          Payments
        Evidence          Affordability Reversals

Each domain can have:

different rules
different documents
different workflows
different institution integrations

while sharing:

journey context
user interaction
explanation
auditability
approval controls
human escalation
🔄 Current Integration Model

For the hackathon/demo environment, some external institutional systems are represented through Sandbox/Mock integrations.

This allows the product journey to be demonstrated end-to-end without claiming direct production connectivity to external insurers, lenders or financial institutions.

Where applicable, the UI explicitly identifies simulation/sandbox states.

📊 Current Validation

The project has been verified for:

Area	Status
Frontend Build	✅ PASS
TypeScript	✅ PASS
Frontend ↔ Backend	✅ PASS
ClaimSahay E2E	✅ 18/18
Lending	✅ PASS
Fintech	✅ PASS
Responsive UI	✅ PASS
Browser Console	✅ PASS
Security Check	✅ PASS
Backend Integrity	✅ Preserved
🌱 Future Scope

Potential extensions include:

production institutional API integrations
broader insurance products
additional lending journeys
more fintech workflows
richer financial Journey Passport capabilities
multilingual and voice-first journeys
proactive financial recommendations
additional document types
larger policy and financial knowledge bases
deeper workflow automation
enterprise-scale observability and monitoring
📌 Design Principles

The project follows these principles:

1. AI assists, not blindly decides

Generative AI is used where language understanding and explanation add value.

2. Rules remain authoritative

Critical financial validation is handled using deterministic logic where appropriate.

3. The customer remains in control

Consequential actions require explicit user confirmation and approval.

4. Every important action is traceable

The journey maintains an audit trail.

5. Human support remains available

Automation should escalate when confidence or evidence is insufficient.

6. Transparency over black-box decisions

Users should understand what was found, what rule/policy applies, and what they can do next.

👥 Team

Team: NOVA

Project: AI Financial Journey Copilot

Primary implementation areas:

AI-powered journey orchestration
Insurance claims assistance
Lending affordability guidance
Fintech dispute workflows
Explainable AI
Document intelligence
RAG / policy grounding
Approval and audit workflows
Human-in-the-loop support
🏁 Hackathon Positioning

The platform addresses the core objective of making financial journeys:

Simpler

Reduce forms, fragmentation and unnecessary complexity.

Faster

Automate document understanding, validation and workflow progression.

More Human

Explain financial decisions clearly, preserve customer control, and provide human escalation when needed.
