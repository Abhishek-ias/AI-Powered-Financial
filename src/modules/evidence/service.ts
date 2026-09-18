// ============================================================
// Evidence Service — Track extracted facts with provenance
// ============================================================
import prisma from '../../config/database';
import { createAuditEvent } from '../audit/service';

export async function createEvidence(
  journeyId: string,
  items: Array<{
    factType: string;
    fieldName: string;
    value: string;
    normalizedValue?: string;
    unit?: string;
    sourceDocumentId?: string;
    sourcePage?: number;
    sourceText?: string;
    confidence: number;
    status?: string;
  }>,
  requestId?: string
) {
  const created = [];
  for (const item of items) {
    const evidence = await prisma.evidenceItem.create({
      data: {
        journeyId,
        factType: item.factType,
        fieldName: item.fieldName,
        value: item.value,
        normalizedValue: item.normalizedValue,
        unit: item.unit,
        sourceDocumentId: item.sourceDocumentId,
        sourcePage: item.sourcePage,
        sourceText: item.sourceText,
        confidence: item.confidence,
        status: item.status || 'VALID',
      },
    });
    created.push(evidence);
  }

  if (created.length > 0) {
    await createAuditEvent({
      journeyId,
      eventType: 'evidence_created',
      actorType: 'SYSTEM',
      requestId,
      metadata: { count: created.length, fields: items.map(i => i.fieldName) },
    });
  }

  return created;
}

export async function getEvidence(journeyId: string) {
  return prisma.evidenceItem.findMany({
    where: { journeyId },
    orderBy: { confidence: 'desc' },
  });
}

export async function updateEvidenceStatus(evidenceId: string, status: string) {
  return prisma.evidenceItem.update({
    where: { id: evidenceId },
    data: { status },
  });
}
