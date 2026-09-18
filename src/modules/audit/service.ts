// ============================================================
// Audit Service — Records important events for traceability
// ============================================================
import prisma from '../../config/database';
import { ActorType } from '../../types';

export interface CreateAuditEvent {
  journeyId?: string;
  eventType: string;
  actorType: ActorType;
  actorId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditEvent(event: CreateAuditEvent) {
  return prisma.auditEvent.create({
    data: {
      journeyId: event.journeyId,
      eventType: event.eventType,
      actorType: event.actorType,
      actorId: event.actorId,
      requestId: event.requestId,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
    },
  });
}

export async function getAuditEvents(journeyId: string) {
  return prisma.auditEvent.findMany({
    where: { journeyId },
    orderBy: { createdAt: 'asc' },
  });
}
