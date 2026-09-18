// ============================================================
// Consent Service — Explicit consent management
// ============================================================
import prisma from '../../config/database';
import { createAuditEvent } from '../audit/service';
import { createTimelineEvent } from '../timeline/service';

export interface GrantConsentInput {
  userId: string;
  journeyId: string;
  purposes: string[]; // DATA_PROCESSING, DOCUMENT_ANALYSIS, etc.
  scope?: string;
}

export async function grantConsent(input: GrantConsentInput, requestId?: string) {
  const consents = [];

  for (const purpose of input.purposes) {
    const consent = await prisma.consent.create({
      data: {
        userId: input.userId,
        journeyId: input.journeyId,
        purpose,
        scope: input.scope,
        granted: true,
        source: 'USER',
      },
    });
    consents.push(consent);
  }

  // Update journey consent state
  await prisma.journey.update({
    where: { id: input.journeyId },
    data: { consentState: 'GRANTED' },
  });

  await createAuditEvent({
    journeyId: input.journeyId,
    eventType: 'consent_granted',
    actorType: 'USER',
    actorId: input.userId,
    requestId,
    metadata: { purposes: input.purposes },
  });

  await createTimelineEvent({
    journeyId: input.journeyId,
    eventType: 'consent_granted',
    title: 'Consent granted',
    details: `Consent granted for: ${input.purposes.join(', ')}`,
    actorType: 'USER',
    actorId: input.userId,
  });

  return consents;
}

export async function checkConsent(journeyId: string, purpose: string): Promise<boolean> {
  const consent = await prisma.consent.findFirst({
    where: {
      journeyId,
      purpose,
      granted: true,
    },
  });
  return !!consent;
}

export async function getConsents(journeyId: string) {
  return prisma.consent.findMany({
    where: { journeyId },
    orderBy: { createdAt: 'asc' },
  });
}
