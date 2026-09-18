// ============================================================
// Frontend Type System — Mapped directly to Backend OpenAPI Contract
// ============================================================

export type Domain = 'INSURANCE' | 'LENDING' | 'FINTECH';

export type JourneyType =
  | 'CLAIM_ASSISTANCE'
  | 'POLICY_INQUIRY'
  | 'LOAN_APPLICATION'
  | 'LOAN_REFINANCE'
  | 'TRANSACTION_DISPUTE'
  | 'FRAUD_REPORT'
  | 'GENERAL';

export type JourneyStatus =
  | 'CREATED'
  | 'GOAL_IDENTIFIED'
  | 'QUESTIONS_PENDING'
  | 'CONSENT_PENDING'
  | 'DOCUMENTS_PENDING'
  | 'DOCUMENT_PROCESSING'
  | 'VALIDATING'
  | 'NEEDS_ACTION'
  | 'READY_FOR_REVIEW'
  | 'USER_CONFIRMED'
  | 'ACTION_PENDING'
  | 'SUBMITTED'
  | 'INSTITUTION_REVIEW'
  | 'QUERY_RECEIVED'
  | 'RECONCILIATION_PENDING'
  | 'HUMAN_REVIEW'
  | 'COMPLETED'
  | 'FAILED';

export type UserRole = 'CUSTOMER' | 'AGENT' | 'ADMIN';

export interface UserContext {
  userId: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export interface Journey {
  id: string;
  userId: string;
  domain: Domain;
  journeyType: JourneyType;
  goal?: string;
  status: JourneyStatus;
  language: string;
  consentState: string;
  metadata?: string | null;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
  documents?: DocumentItem[];
  evidenceItems?: EvidenceItem[];
  consents?: ConsentRecord[];
}

export interface Question {
  id: string;
  journeyId: string;
  key?: string;
  questionKey?: string;
  text?: string;
  questionText?: string;
  type?: 'TEXT' | 'SELECT' | 'DATE' | 'NUMBER' | 'BOOLEAN' | string;
  questionType?: 'TEXT' | 'SELECT' | 'DATE' | 'NUMBER' | 'BOOLEAN' | string;
  required?: boolean;
  isRequired?: boolean;
  options?: string | string[] | null;
  order?: number;
  orderIndex?: number;
  reason?: string | null;
  rationale?: string | null;
  status?: string;
  answer?: string | null;
  answeredAt?: string | null;
}

export interface ConsentRecord {
  id: string;
  journeyId: string;
  purpose: string;
  scope?: string | null;
  granted?: boolean;
  isGranted?: boolean;
  createdAt?: string;
  grantedAt?: string;
}

export interface JourneyRequirement {
  id: string;
  journeyId: string;
  key: string;
  label: string;
  domain: string;
  journeyType: string;
  required: boolean;
  reason?: string | null;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  status?: string;
}

export interface DocumentItem {
  id: string;
  journeyId: string;
  originalName: string;
  filename?: string;
  mimeType: string;
  size?: number;
  sizeBytes?: number;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | string;
  documentType: string;
  storageRef?: string;
  processingMs?: string | null;
  createdAt: string;
  fields?: DocumentField[];
}

export interface DocumentField {
  id: string;
  documentId: string;
  fieldName: string;
  value: string;
  normalizedValue?: string | null;
  unit?: string | null;
  page?: number | null;
  confidence: number;
  sourceText?: string | null;
  status: string;
}

export interface EvidenceItem {
  id: string;
  journeyId: string;
  factType: string;
  fieldName: string;
  value: string;
  normalizedValue?: string | null;
  unit?: string | null;
  sourceDocumentId?: string | null;
  sourcePage?: number | null;
  sourceText?: string | null;
  confidence: number;
  status: 'VALID' | 'LOW_CONFIDENCE' | 'CONTRADICTED' | 'POLICY_CONDITION_FLAGGED' | 'SECURITY_FLAGGED';
  metadata?: string | null;
}

export interface ValidationIssue {
  fieldName: string;
  status: string;
  expected?: string | null;
  actual?: string | null;
  source?: string | null;
  details: string;
  severity: 'BLOCKING' | 'WARNING' | 'INFO';
}

export interface ValidationSummary {
  valid: boolean;
  results: ValidationIssue[];
  blocking: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface PolicyCitation {
  policy: string;
  version: string;
  section: string;
  page?: number | null;
}

export interface ReconciliationResult {
  reconciliation: {
    id: string;
    type: string;
    status: string;
    conflictType?: string | null;
    explanation?: string | null;
  };
  matchedClause: {
    content: string;
    source: string;
    section: string;
    page: number;
  } | null;
  evidence: Array<{
    fieldName: string;
    value: string;
    unit?: string | null;
    source?: string | null;
    confidence: number;
  }>;
  conflict: {
    type: string;
    field?: string;
    claimed?: number;
    policyLimit?: number;
    excess?: number;
    excessTotal?: number;
    description: string;
  } | null;
  explanation: string;
  nextAction: string;
  requiresHumanReview: boolean;
  citations: PolicyCitation[];
}

export interface NextBestAction {
  action: string;
  reason?: string;
  why?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  blocking?: boolean;
  requiresConfirmation?: boolean;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ApprovalRequest {
  id: string;
  journeyId: string;
  userId: string;
  action: string;
  payload?: string | null;
  payloadHash?: string | null;
  requester: string;
  approvalState: 'PENDING' | 'APPROVED' | 'REJECTED';
  idempotencyKey?: string | null;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  journeyId: string;
  eventType: string;
  title: string;
  details?: string | null;
  actorType: 'USER' | 'SYSTEM' | 'AI' | 'AGENT' | 'WORKFLOW';
  actorId?: string | null;
  metadata?: string | null;
  createdAt: string;
}

export interface SupportCase {
  id: string;
  journeyId: string;
  status: 'OPEN' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reason: string;
  contextPacket?: string | null;
  createdAt: string;
}

export interface ReadyStatus {
  status: 'ready' | 'degraded';
  timestamp: string;
  providerSummary: {
    totalProviders: number;
    liveCount: number;
    mockCount: number;
    liveProviders: string[];
    mockProviders: string[];
  };
  providers: Record<string, { status: string; mode: string; isLive: boolean }>;
  featureFlags: Record<string, boolean>;
}

export interface LendingEMIResult {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  monthlyEMI: number;
  totalRepayment: number;
  totalInterest: number;
  providerMode: string;
  isEstimate: boolean;
}

export interface LendingAffordabilityResult {
  monthlyIncome: number;
  existingEMI: number;
  requestedEMI: number;
  totalMonthlyObligations: number;
  dtiPercent: number;
  isAffordable: boolean;
  maxRecommendedEMI: number;
  maxDtiPercent: number;
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH';
  providerMode: string;
}

export interface FintechTransaction {
  transactionId: string;
  amount: number;
  date: string;
  status: string;
  paymentMethod: string;
  recipient: string;
  issueClassification?: {
    issueType: string;
    description: string;
    autoRefundEligible: boolean;
  };
}
