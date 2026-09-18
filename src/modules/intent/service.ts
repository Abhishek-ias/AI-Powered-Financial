// ============================================================
// Intent Service — Natural language intent detection
// Uses mock LLM when Azure OpenAI is unavailable
// ============================================================
import { Domain, JourneyType } from '../../types';

export interface IntentResult {
  domain: Domain;
  journeyType: JourneyType;
  goal: string;
  entities: Record<string, string>;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  language: string;
  requiredInformation: string[];
  missingInformation: string[];
  confidence: number;
  allowedActions: string[];
}

// Keyword-based intent detection (mock LLM fallback)
export function detectIntent(message: string): IntentResult {
  const lower = message.toLowerCase();

  // Insurance patterns
  if (matchAny(lower, ['claim', 'hospital', 'medical', 'insurance', 'policy', 'health', 'rejected', 'queried', 'reimbursement', 'discharge', 'treatment'])) {
    return {
      domain: 'INSURANCE',
      journeyType: 'CLAIM_ASSISTANCE',
      goal: extractGoal(message, 'insurance claim assistance'),
      entities: extractEntities(lower, 'INSURANCE'),
      urgency: lower.includes('reject') || lower.includes('urgent') ? 'HIGH' : 'MEDIUM',
      language: 'en',
      requiredInformation: ['policy_number', 'claim_type', 'hospitalization_dates', 'hospital_name'],
      missingInformation: ['policy_number', 'claim_type', 'hospitalization_dates', 'hospital_name'],
      confidence: 0.85,
      allowedActions: ['CREATE_JOURNEY', 'ASK_QUESTIONS'],
    };
  }

  // Lending patterns
  if (matchAny(lower, ['loan', 'emi', 'home loan', 'personal loan', 'car loan', 'renovation', 'borrow', 'credit', 'financing'])) {
    return {
      domain: 'LENDING',
      journeyType: 'LOAN_APPLICATION',
      goal: extractGoal(message, 'loan application'),
      entities: extractEntities(lower, 'LENDING'),
      urgency: 'MEDIUM',
      language: 'en',
      requiredInformation: ['loan_type', 'amount', 'employment_type', 'monthly_income'],
      missingInformation: ['loan_type', 'amount', 'employment_type', 'monthly_income'],
      confidence: 0.82,
      allowedActions: ['CREATE_JOURNEY', 'ASK_QUESTIONS'],
    };
  }

  // Fintech patterns
  if (matchAny(lower, ['payment', 'upi', 'transaction', 'failed', 'debited', 'money', 'transfer', 'dispute', 'refund'])) {
    return {
      domain: 'FINTECH',
      journeyType: 'TRANSACTION_DISPUTE',
      goal: extractGoal(message, 'transaction dispute resolution'),
      entities: extractEntities(lower, 'FINTECH'),
      urgency: lower.includes('debited') || lower.includes('failed') ? 'HIGH' : 'MEDIUM',
      language: 'en',
      requiredInformation: ['transaction_ref', 'amount', 'payment_method'],
      missingInformation: ['transaction_ref', 'amount', 'payment_method'],
      confidence: 0.80,
      allowedActions: ['CREATE_JOURNEY', 'ASK_QUESTIONS'],
    };
  }

  // Unsupported
  return {
    domain: 'INSURANCE',
    journeyType: 'GENERAL',
    goal: message,
    entities: {},
    urgency: 'LOW',
    language: 'en',
    requiredInformation: [],
    missingInformation: [],
    confidence: 0.3,
    allowedActions: ['ASK_QUESTIONS', 'ESCALATE_TO_HUMAN'],
  };
}

function matchAny(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k));
}

function extractGoal(message: string, fallback: string): string {
  return message.length > 10 ? message : fallback;
}

function extractEntities(text: string, domain: string): Record<string, string> {
  const entities: Record<string, string> = {};

  // Amount extraction
  const amountMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i);
  if (amountMatch) entities.amount = amountMatch[1].replace(/,/g, '');

  // Policy number
  const policyMatch = text.match(/pol[-\s]?\w+[-\s]?\d+/i);
  if (policyMatch) entities.policyNumber = policyMatch[0];

  return entities;
}
