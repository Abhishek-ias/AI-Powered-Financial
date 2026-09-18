// ============================================================
// Escalation Service — Human escalation with structured context
// ============================================================
import prisma from '../../config/database';
import { createAuditEvent } from '../audit/service';
import { createTimelineEvent } from '../timeline/service';

export async function createEscalation(journeyId: string, userId: string, requestId?: string) {
  // Build structured support packet
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      questions: true,
      documents: { include: { fields: true } },
      evidenceItems: true,
      requirements: true,
      validationResults: true,
      reconciliations: true,
      consents: true,
      timelineEvents: { orderBy: { createdAt: 'asc' } },
      claims: { include: { insurerQueries: true } },
      approvalRequests: true,
    },
  });

  if (!journey) throw new Error('Journey not found');

  const contextPacket = {
    customerGoal: journey.goal,
    domain: journey.domain,
    journeyType: journey.journeyType,
    journeyStatus: journey.status,
    language: journey.language,
    consentScope: journey.consents.map(c => c.purpose),
    questions: journey.questions.map(q => ({
      question: q.text,
      answer: q.answer,
      status: q.status,
    })),
    documents: journey.documents.map(d => ({
      type: d.documentType,
      filename: d.originalName,
      status: d.status,
      fieldCount: d.fields.length,
    })),
    evidence: journey.evidenceItems.map(e => ({
      field: e.fieldName,
      value: e.value,
      confidence: e.confidence,
      status: e.status,
    })),
    requirements: journey.requirements.map(r => ({
      requirement: r.label,
      status: r.status,
      required: r.required,
    })),
    validationIssues: journey.validationResults.filter(v => v.severity === 'BLOCKING').map(v => ({
      field: v.fieldName,
      status: v.status,
      details: v.details,
    })),
    reconciliations: journey.reconciliations.map(r => ({
      type: r.type,
      conflict: r.conflict ? JSON.parse(r.conflict) : null,
      explanation: r.explanation,
      requiresHuman: r.requiresHuman,
    })),
    insurerQueries: journey.claims.flatMap(c => c.insurerQueries.map(q => ({
      queryType: q.queryType,
      query: q.query,
      status: q.status,
    }))),
    previousActions: journey.timelineEvents.map(t => ({
      event: t.title,
      timestamp: t.createdAt,
    })),
    unresolvedIssue: journey.validationResults
      .filter(v => v.severity === 'BLOCKING')
      .map(v => v.details)
      .join('; ') || 'Requires human review',
  };

  const supportCase = await prisma.supportCase.create({
    data: {
      journeyId,
      userId,
      issueType: journey.domain,
      summary: `Escalation for ${journey.domain} ${journey.journeyType}: ${journey.goal || 'Requires human review'}`,
      contextPacket: JSON.stringify(contextPacket),
      status: 'OPEN',
    },
  });

  await createAuditEvent({
    journeyId,
    eventType: 'human_escalated',
    actorType: 'SYSTEM',
    actorId: userId,
    requestId,
    metadata: { supportCaseId: supportCase.id },
  });

  await createTimelineEvent({
    journeyId,
    eventType: 'human_escalated',
    title: 'Escalated to human support',
    details: 'A structured support packet has been created with complete journey context.',
    actorType: 'SYSTEM',
    actorId: userId,
  });

  return { supportCase, contextPacket };
}
