// ============================================================
// Next Best Action Service — Deterministic-first action engine
// ============================================================
import prisma from '../../config/database';
import { NextBestAction, ActionType, JourneyStatus } from '../../types';

export async function determineNextActions(journeyId: string): Promise<NextBestAction[]> {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      requirements: true,
      evidenceItems: true,
      validationResults: true,
      questions: true,
      documents: true,
      consents: true,
      approvalRequests: true,
    },
  });

  if (!journey) return [];

  const actions: NextBestAction[] = [];
  const status = journey.status as JourneyStatus;

  // Check for unanswered required questions
  const pendingQuestions = journey.questions.filter(q => q.required && q.status === 'PENDING');
  if (pendingQuestions.length > 0) {
    actions.push({
      action: 'PROVIDE_INFORMATION',
      reason: `${pendingQuestions.length} required question(s) still need answers`,
      priority: 'HIGH',
      blocking: true,
      requiresConfirmation: false,
      metadata: { questionIds: pendingQuestions.map(q => q.id), questionKeys: pendingQuestions.map(q => q.key) },
    });
  }

  // Check consent
  if (journey.consentState !== 'GRANTED') {
    actions.push({
      action: 'GRANT_CONSENT',
      reason: 'Consent is required before proceeding with document processing and data analysis',
      priority: 'HIGH',
      blocking: true,
      requiresConfirmation: true,
    });
  }

  // Check missing requirements/documents
  const missingReqs = journey.requirements.filter(r => r.required && r.status === 'PENDING');
  if (missingReqs.length > 0 && status !== 'CREATED' && status !== 'GOAL_IDENTIFIED' && status !== 'QUESTIONS_PENDING' && status !== 'CONSENT_PENDING') {
    actions.push({
      action: 'UPLOAD_DOCUMENT',
      reason: `${missingReqs.length} required document(s) still needed: ${missingReqs.map(r => r.label).join(', ')}`,
      priority: 'HIGH',
      blocking: true,
      requiresConfirmation: false,
      metadata: { missing: missingReqs.map(r => ({ key: r.key, label: r.label })) },
    });
  }

  // Check for validation issues
  const blockingIssues = journey.validationResults.filter(v => v.severity === 'BLOCKING');
  for (const issue of blockingIssues) {
    if (issue.status === 'CONTRADICTED') {
      actions.push({
        action: 'CORRECT_FIELD',
        reason: `Contradicting evidence detected for ${issue.fieldName}: ${issue.details}`,
        priority: 'HIGH',
        blocking: true,
        requiresConfirmation: false,
        metadata: { fieldName: issue.fieldName, expected: issue.expected, actual: issue.actual },
      });
    } else if (issue.status === 'POLICY_CONDITION_FLAGGED') {
      actions.push({
        action: 'REVIEW_POLICY',
        reason: `Policy condition flagged: ${issue.details}`,
        priority: 'HIGH',
        blocking: false,
        requiresConfirmation: false,
        metadata: { fieldName: issue.fieldName, details: issue.details },
      });
    }
  }

  // Low confidence items
  const lowConfidence = journey.evidenceItems.filter(e => e.confidence < 0.7);
  if (lowConfidence.length > 0) {
    actions.push({
      action: 'CONFIRM_INFORMATION',
      reason: `${lowConfidence.length} item(s) have low confidence and need review`,
      priority: 'MEDIUM',
      blocking: false,
      requiresConfirmation: true,
      metadata: { fields: lowConfidence.map(e => ({ fieldName: e.fieldName, value: e.value, confidence: e.confidence })) },
    });
  }

  // Domain-specific actions
  if (journey.domain === 'INSURANCE' && status === 'READY_FOR_REVIEW') {
    actions.push({
      action: 'SUBMIT_CLAIM',
      reason: 'All validation checks passed. Ready to submit claim for review.',
      priority: 'HIGH',
      blocking: false,
      requiresConfirmation: true,
    });
  }

  if (journey.domain === 'LENDING' && status === 'READY_FOR_REVIEW') {
    actions.push({
      action: 'SUBMIT_LOAN_APPLICATION',
      reason: 'Loan application ready for submission.',
      priority: 'HIGH',
      blocking: false,
      requiresConfirmation: true,
    });
  }

  if (journey.domain === 'FINTECH' && status === 'READY_FOR_REVIEW') {
    actions.push({
      action: 'START_DISPUTE',
      reason: 'Dispute evidence gathered. Ready to file dispute.',
      priority: 'HIGH',
      blocking: false,
      requiresConfirmation: true,
    });
  }

  // If no specific actions, check if escalation is appropriate
  if (actions.length === 0 && (status === 'HUMAN_REVIEW' || status === 'QUERY_RECEIVED')) {
    actions.push({
      action: 'ESCALATE_TO_HUMAN',
      reason: 'This case requires human review for resolution.',
      priority: 'HIGH',
      blocking: false,
      requiresConfirmation: true,
    });
  }

  // Sort by priority
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return actions;
}
