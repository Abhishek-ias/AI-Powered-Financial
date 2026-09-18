// ============================================================
// Journey Service — Core journey CRUD + state management
// ============================================================
import prisma from '../../config/database';
import { Domain, JourneyType, JourneyStatus } from '../../types';
import { assertTransition, getAllowedTransitions, isTerminalState } from '../../state-machine';
import { createAuditEvent } from '../audit/service';
import { createTimelineEvent } from '../timeline/service';
import { AppError } from '../../middleware/errors';
import { ErrorCodes } from '../../utils/response';

export interface CreateJourneyInput {
  userId: string;
  domain: Domain;
  journeyType: JourneyType;
  goal?: string;
  language?: string;
  parentJourneyId?: string;
  metadata?: Record<string, unknown>;
}

export async function createJourney(input: CreateJourneyInput, requestId?: string) {
  const journey = await prisma.journey.create({
    data: {
      userId: input.userId,
      domain: input.domain,
      journeyType: input.journeyType,
      goal: input.goal,
      language: input.language || 'en',
      parentJourneyId: input.parentJourneyId,
      status: 'CREATED',
      consentState: 'PENDING',
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });

  await createAuditEvent({
    journeyId: journey.id,
    eventType: 'journey_created',
    actorType: 'USER',
    actorId: input.userId,
    requestId,
    metadata: { domain: input.domain, journeyType: input.journeyType },
  });

  await createTimelineEvent({
    journeyId: journey.id,
    eventType: 'journey_created',
    title: 'Journey started',
    details: `${input.domain} - ${input.journeyType}${input.goal ? `: ${input.goal}` : ''}`,
    actorType: 'USER',
    actorId: input.userId,
  });

  return journey;
}

export async function getJourney(journeyId: string, userId?: string) {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      questions: { orderBy: { order: 'asc' } },
      documents: true,
      evidenceItems: true,
      requirements: true,
      validationResults: true,
      claims: true,
      reconciliations: true,
      timelineEvents: { orderBy: { createdAt: 'asc' } },
      approvalRequests: true,
      workflowRuns: true,
    },
  });

  if (!journey) {
    throw new AppError(ErrorCodes.JOURNEY_NOT_FOUND, 'Journey not found.', 404);
  }

  // Authorization: user can only access their own journeys
  if (userId && journey.userId !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'You do not have access to this journey.', 403);
  }

  return journey;
}

export async function transitionJourney(
  journeyId: string,
  toStatus: JourneyStatus,
  actorType: 'USER' | 'SYSTEM' | 'AI' | 'AGENT' | 'WORKFLOW',
  actorId?: string,
  reason?: string,
  requestId?: string
) {
  const journey = await prisma.journey.findUnique({ where: { id: journeyId } });
  if (!journey) {
    throw new AppError(ErrorCodes.JOURNEY_NOT_FOUND, 'Journey not found.', 404);
  }

  const fromStatus = journey.status as JourneyStatus;

  if (isTerminalState(fromStatus)) {
    throw new AppError(ErrorCodes.INVALID_STATE_TRANSITION, `Journey is in terminal state: ${fromStatus}`, 400);
  }

  assertTransition(fromStatus, toStatus);

  const updated = await prisma.journey.update({
    where: { id: journeyId },
    data: {
      status: toStatus,
      currentStage: toStatus,
    },
  });

  await createAuditEvent({
    journeyId,
    eventType: 'state_transition',
    actorType,
    actorId,
    requestId,
    metadata: { from: fromStatus, to: toStatus, reason },
  });

  await createTimelineEvent({
    journeyId,
    eventType: 'state_transition',
    title: `Status changed to ${toStatus}`,
    details: reason || `Transitioned from ${fromStatus}`,
    actorType,
    actorId,
  });

  return updated;
}

export async function listJourneys(userId: string) {
  return prisma.journey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      claims: { select: { id: true, claimNumber: true, status: true } },
      applications: { select: { id: true, status: true } },
      disputes: { select: { id: true, status: true } },
    },
  });
}
