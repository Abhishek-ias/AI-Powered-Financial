// ============================================================
// Questions Service — Dynamic question engine
// ============================================================
import prisma from '../../config/database';
import { createAuditEvent } from '../audit/service';

interface QuestionDef {
  key: string;
  text: string;
  type: string;
  required: boolean;
  reason: string;
  options?: string[];
  order: number;
}

// Domain-specific question templates
const INSURANCE_CLAIM_QUESTIONS: QuestionDef[] = [
  { key: 'policy_number', text: 'What is your policy number?', type: 'TEXT', required: true, reason: 'Required to identify your insurance policy', order: 1 },
  { key: 'claim_type', text: 'What type of claim is this?', type: 'SELECT', required: true, reason: 'Required to determine the claim process', options: ['Hospitalization', 'Reimbursement', 'Daycare', 'Pre/Post Hospitalization'], order: 2 },
  { key: 'hospital_name', text: 'Which hospital were you admitted to?', type: 'TEXT', required: true, reason: 'Required for claim verification', order: 3 },
  { key: 'admission_date', text: 'What was the date of admission?', type: 'DATE', required: true, reason: 'Required for claim processing', order: 4 },
  { key: 'discharge_date', text: 'What was the date of discharge?', type: 'DATE', required: true, reason: 'Required for claim processing', order: 5 },
  { key: 'diagnosis', text: 'What was the primary diagnosis/treatment?', type: 'TEXT', required: true, reason: 'Required for claim assessment', order: 6 },
  { key: 'total_bill_amount', text: 'What is the total hospital bill amount (₹)?', type: 'NUMBER', required: true, reason: 'Required for claim amount calculation', order: 7 },
  { key: 'previous_claim', text: 'Have you filed any claims under this policy before?', type: 'BOOLEAN', required: false, reason: 'Helps assess remaining coverage', order: 8 },
];

const LENDING_QUESTIONS: QuestionDef[] = [
  { key: 'loan_type', text: 'What type of loan do you need?', type: 'SELECT', required: true, reason: 'Required to determine eligibility criteria', options: ['Home Loan', 'Personal Loan', 'Car Loan', 'Home Renovation', 'Education Loan'], order: 1 },
  { key: 'loan_amount', text: 'How much loan amount do you need (₹)?', type: 'NUMBER', required: true, reason: 'Required for EMI and affordability calculation', order: 2 },
  { key: 'employment_type', text: 'What is your employment type?', type: 'SELECT', required: true, reason: 'Required for income assessment', options: ['Salaried', 'Self-Employed', 'Business Owner', 'Freelancer'], order: 3 },
  { key: 'monthly_income', text: 'What is your monthly income (₹)?', type: 'NUMBER', required: true, reason: 'Required for affordability assessment', order: 4 },
  { key: 'existing_emi', text: 'Do you have any existing EMIs? If yes, total monthly EMI amount (₹)?', type: 'NUMBER', required: false, reason: 'Required to calculate debt-to-income ratio', order: 5 },
  { key: 'preferred_tenure', text: 'What tenure do you prefer (in years)?', type: 'NUMBER', required: false, reason: 'Required for EMI calculation', order: 6 },
];

const FINTECH_QUESTIONS: QuestionDef[] = [
  { key: 'transaction_ref', text: 'What is the transaction reference number or UPI reference ID?', type: 'TEXT', required: true, reason: 'Required to look up the transaction', order: 1 },
  { key: 'transaction_date', text: 'When did the transaction occur?', type: 'DATE', required: true, reason: 'Required to identify the transaction', order: 2 },
  { key: 'amount', text: 'What was the transaction amount (₹)?', type: 'NUMBER', required: true, reason: 'Required for verification', order: 3 },
  { key: 'payment_method', text: 'What payment method was used?', type: 'SELECT', required: true, reason: 'Required for dispute routing', options: ['UPI', 'NEFT', 'IMPS', 'Debit Card', 'Credit Card', 'Net Banking'], order: 4 },
  { key: 'issue_description', text: 'Please describe the issue with the transaction.', type: 'TEXT', required: true, reason: 'Required to understand the dispute', order: 5 },
];

export async function generateQuestions(journeyId: string, domain: string, journeyType: string) {
  // Check for already answered questions
  const existing = await prisma.question.findMany({ where: { journeyId } });
  const answeredKeys = new Set(existing.filter(q => q.status === 'ANSWERED').map(q => q.key));

  let templates: QuestionDef[];

  if (domain === 'INSURANCE') {
    templates = INSURANCE_CLAIM_QUESTIONS;
  } else if (domain === 'LENDING') {
    templates = LENDING_QUESTIONS;
  } else if (domain === 'FINTECH') {
    templates = FINTECH_QUESTIONS;
  } else {
    templates = [];
  }

  // Filter out already-answered questions (no repeated questions)
  const needed = templates.filter(t => !answeredKeys.has(t.key));

  // Create new questions (skip if already exist and pending)
  const existingKeys = new Set(existing.map(q => q.key));
  const toCreate = needed.filter(t => !existingKeys.has(t.key));

  if (toCreate.length > 0) {
    await prisma.question.createMany({
      data: toCreate.map(t => ({
        journeyId,
        key: t.key,
        text: t.text,
        type: t.type,
        required: t.required,
        reason: t.reason,
        source: 'SYSTEM',
        status: 'PENDING',
        options: t.options ? JSON.stringify(t.options) : null,
        order: t.order,
      })),
    });
  }

  return prisma.question.findMany({
    where: { journeyId },
    orderBy: { order: 'asc' },
  });
}

export async function answerQuestion(
  journeyId: string,
  questionId: string,
  answer: string,
  actorId?: string,
  requestId?: string
) {
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question || question.journeyId !== journeyId) {
    throw new Error('Question not found for this journey');
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { answer, status: 'ANSWERED' },
  });

  await createAuditEvent({
    journeyId,
    eventType: 'question_answered',
    actorType: 'USER',
    actorId,
    requestId,
    metadata: { questionKey: question.key, questionId },
  });

  return updated;
}

export async function getQuestions(journeyId: string) {
  return prisma.question.findMany({
    where: { journeyId },
    orderBy: { order: 'asc' },
  });
}

export async function allRequiredQuestionsAnswered(journeyId: string): Promise<boolean> {
  const pending = await prisma.question.findMany({
    where: { journeyId, required: true, status: 'PENDING' },
  });
  return pending.length === 0;
}
