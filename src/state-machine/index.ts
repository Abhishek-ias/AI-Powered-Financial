// ============================================================
// State Machine — Journey State Transitions
// ============================================================
import { JourneyStatus, ActorType } from '../types';
import { AppError } from '../middleware/errors';
import { ErrorCodes } from '../utils/response';

// Explicit transition map
const TRANSITIONS: Record<JourneyStatus, JourneyStatus[]> = {
  CREATED:                ['GOAL_IDENTIFIED', 'FAILED'],
  GOAL_IDENTIFIED:        ['QUESTIONS_PENDING', 'CONSENT_PENDING', 'FAILED'],
  QUESTIONS_PENDING:      ['CONSENT_PENDING', 'QUESTIONS_PENDING', 'FAILED'],
  CONSENT_PENDING:        ['DOCUMENTS_PENDING', 'FAILED'],
  DOCUMENTS_PENDING:      ['DOCUMENT_PROCESSING', 'DOCUMENTS_PENDING', 'FAILED'],
  DOCUMENT_PROCESSING:    ['VALIDATING', 'DOCUMENTS_PENDING', 'FAILED'],
  VALIDATING:             ['NEEDS_ACTION', 'READY_FOR_REVIEW', 'HUMAN_REVIEW', 'FAILED'],
  NEEDS_ACTION:           ['VALIDATING', 'DOCUMENTS_PENDING', 'READY_FOR_REVIEW', 'USER_CONFIRMED', 'HUMAN_REVIEW', 'FAILED'],
  READY_FOR_REVIEW:       ['USER_CONFIRMED', 'NEEDS_ACTION', 'HUMAN_REVIEW', 'FAILED'],
  USER_CONFIRMED:         ['ACTION_PENDING', 'FAILED'],
  ACTION_PENDING:         ['SUBMITTED', 'FAILED'],
  SUBMITTED:              ['INSTITUTION_REVIEW', 'COMPLETED', 'FAILED'],
  INSTITUTION_REVIEW:     ['QUERY_RECEIVED', 'COMPLETED', 'HUMAN_REVIEW', 'FAILED'],
  QUERY_RECEIVED:         ['RECONCILIATION_PENDING', 'HUMAN_REVIEW', 'FAILED'],
  RECONCILIATION_PENDING: ['READY_FOR_REVIEW', 'HUMAN_REVIEW', 'NEEDS_ACTION', 'FAILED'],
  HUMAN_REVIEW:           ['COMPLETED', 'NEEDS_ACTION', 'FAILED'],
  COMPLETED:              [],
  FAILED:                 [],
};

export interface TransitionRequest {
  journeyId: string;
  fromStatus: JourneyStatus;
  toStatus: JourneyStatus;
  actorType: ActorType;
  actorId?: string;
  reason?: string;
}

export function validateTransition(from: JourneyStatus, to: JourneyStatus): boolean {
  const allowed = TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export function assertTransition(from: JourneyStatus, to: JourneyStatus): void {
  if (!validateTransition(from, to)) {
    throw new AppError(
      ErrorCodes.INVALID_STATE_TRANSITION,
      `Invalid state transition: ${from} → ${to}. Allowed transitions from ${from}: ${TRANSITIONS[from]?.join(', ') || 'none'}`,
      400,
      { from, to, allowed: TRANSITIONS[from] }
    );
  }
}

export function getAllowedTransitions(from: JourneyStatus): JourneyStatus[] {
  return TRANSITIONS[from] || [];
}

export function isTerminalState(status: JourneyStatus): boolean {
  return status === 'COMPLETED' || status === 'FAILED';
}

export { TRANSITIONS };
