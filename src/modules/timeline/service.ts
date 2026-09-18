// ============================================================
// Timeline Service — Chronological journey history
// ============================================================
import prisma from '../../config/database';
import { ActorType } from '../../types';

export interface CreateTimelineEvent {
  journeyId: string;
  eventType: string;
  title: string;
  details?: string;
  actorType: ActorType;
  actorId?: string;
  metadata?: Record<string, unknown>;
}

export async function createTimelineEvent(event: CreateTimelineEvent) {
  return prisma.timelineEvent.create({
    data: {
      journeyId: event.journeyId,
      eventType: event.eventType,
      title: event.title,
      details: event.details,
      actorType: event.actorType,
      actorId: event.actorId,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
    },
  });
}

export async function getTimeline(journeyId: string) {
  return prisma.timelineEvent.findMany({
    where: { journeyId },
    orderBy: { createdAt: 'asc' },
  });
}
