// ============================================================
// Core Type Definitions — AI Financial Journey Copilot
// ============================================================

// ---- Domains ----
export type Domain = 'INSURANCE' | 'LENDING' | 'FINTECH';

export type JourneyType =
  | 'CLAIM_ASSISTANCE'
  | 'POLICY_UNDERSTANDING'
  | 'LOAN_APPLICATION'
  | 'LOAN_ELIGIBILITY'
  | 'TRANSACTION_DISPUTE'
  | 'PAYMENT_ISSUE'
  | 'GENERAL';

// ---- Journey States ----
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

// ---- Consent ----
export type ConsentPurpose =
  | 'DATA_PROCESSING'
  | 'DOCUMENT_ANALYSIS'
  | 'PRIOR_CONTEXT'
  | 'EXTERNAL_SUBMISSION'
  | 'HUMAN_ESCALATION';

// ---- Documents ----
export type DocumentType =
  | 'AADHAAR'
  | 'PAN'
  | 'SALARY_SLIP'
  | 'BANK_STATEMENT'
  | 'HOSPITAL_BILL'
  | 'DISCHARGE_SUMMARY'
  | 'PRESCRIPTION'
  | 'POLICY_DOCUMENT'
  | 'CLAIM_FORM'
  | 'REJECTION_LETTER'
  | 'ITR'
  | 'ADDRESS_PROOF'
  | 'LOAN_STATEMENT'
  | 'TRANSACTION_RECEIPT'
  | 'OTHER';

export type DocumentStatus =
  | 'UPLOADED'
  | 'VALIDATING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED'
  | 'INVALID';

export type FieldStatus =
  | 'EXTRACTED'
  | 'NORMALIZED'
  | 'CONFIRMED'
  | 'LOW_CONFIDENCE'
  | 'REJECTED';

// ---- Evidence ----
export type EvidenceStatus =
  | 'VALID'
  | 'MISSING'
  | 'LOW_CONFIDENCE'
  | 'CONTRADICTED'
  | 'OUT_OF_SCOPE'
  | 'REQUIRES_REVIEW';

// ---- Validation ----
export type ValidationStatus =
  | 'VALID'
  | 'MISSING'
  | 'LOW_CONFIDENCE'
  | 'CONTRADICTED'
  | 'OUT_OF_SCOPE'
  | 'REQUIRES_REVIEW'
  | 'POLICY_CONDITION_FLAGGED';

// ---- Approval ----
export type ApprovalState =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

// ---- Next Best Action ----
export type ActionType =
  | 'UPLOAD_DOCUMENT'
  | 'CORRECT_FIELD'
  | 'CONFIRM_INFORMATION'
  | 'REVIEW_POLICY'
  | 'RESPOND_TO_INSURER'
  | 'SUBMIT_CLAIM'
  | 'REVIEW_INCOME'
  | 'CALCULATE_AFFORDABILITY'
  | 'PREPARE_LOAN_APPLICATION'
  | 'SUBMIT_LOAN_APPLICATION'
  | 'START_DISPUTE'
  | 'WAIT_FOR_INSTITUTION'
  | 'ESCALATE_TO_HUMAN'
  | 'PROVIDE_INFORMATION'
  | 'GRANT_CONSENT';

// ---- Roles ----
export type UserRole = 'CUSTOMER' | 'AGENT' | 'ADMIN';

// ---- Actor Types ----
export type ActorType = 'USER' | 'SYSTEM' | 'AI' | 'AGENT' | 'WORKFLOW';

// ---- Mock Statuses ----
export type InstitutionStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'QUERY'
  | 'COMPLETED'
  | 'FAILED'
  | 'TIMEOUT';

// ---- API Response ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ---- Provider Interfaces ----
export interface LLMProvider {
  chat(systemPrompt: string, userMessage: string, options?: Record<string, unknown>): Promise<LLMResponse>;
  structuredOutput<T>(systemPrompt: string, userMessage: string, schema: string): Promise<T>;
}

export interface LLMResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  model?: string;
}

export interface DocumentAIProvider {
  analyzeDocument(buffer: Buffer, mimeType: string, documentType?: string): Promise<DocumentExtractionResult>;
  analyzeIdentityDocument(buffer: Buffer, mimeType: string): Promise<DocumentExtractionResult>;
}

export interface DocumentExtractionResult {
  documentType: string;
  fields: ExtractedField[];
  rawText?: string;
  pages?: number;
  classificationMs: number;
  extractionMs: number;
  totalProcessingMs: number;
}

export interface ExtractedField {
  fieldName: string;
  value: string;
  normalizedValue?: string;
  unit?: string;
  page?: number;
  confidence: number;
  sourceText?: string;
}

export interface KnowledgeProvider {
  search(query: string, filters?: Record<string, unknown>): Promise<KnowledgeResult[]>;
  searchPolicy(policyId: string, version: string, query: string): Promise<KnowledgeResult[]>;
}

export interface KnowledgeResult {
  content: string;
  source: string;
  section?: string;
  clause?: string;
  page?: number;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryProvider {
  store(journeyId: string, data: Record<string, unknown>): Promise<void>;
  recall(userId: string, query: string): Promise<MemoryResult[]>;
}

export interface MemoryResult {
  content: string;
  journeyId: string;
  relevance: number;
  timestamp: Date;
}

export interface WorkflowProvider {
  trigger(workflowId: string, payload: Record<string, unknown>): Promise<WorkflowTriggerResult>;
  getStatus(executionId: string): Promise<WorkflowStatus>;
}

export interface WorkflowTriggerResult {
  executionId: string;
  status: string;
}

export interface WorkflowStatus {
  executionId: string;
  status: string;
  result?: Record<string, unknown>;
  error?: string;
}

// ---- Request Extension ----
export interface AuthenticatedRequest {
  userId: string;
  userRole: UserRole;
  requestId: string;
}

// ---- Next Best Action ----
export interface NextBestAction {
  action: ActionType;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  blocking: boolean;
  requiresConfirmation: boolean;
  metadata?: Record<string, unknown>;
}
