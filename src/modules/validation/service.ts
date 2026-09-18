// ============================================================
// Validation Service — Deterministic validation + conflict detection
// ============================================================
import prisma from '../../config/database';
import { createAuditEvent } from '../audit/service';
import { createTimelineEvent } from '../timeline/service';

export interface ValidationInput {
  journeyId: string;
  evidence: Array<{
    fieldName: string;
    value: string;
    normalizedValue?: string;
    unit?: string;
    source: string;
    confidence: number;
  }>;
  policyData?: {
    clauses: Array<{
      section: string;
      content: string;
      type: string;
    }>;
  };
}

export interface ConflictResult {
  fieldName: string;
  status: string;
  severity: string;
  expected?: string;
  actual?: string;
  source?: string;
  details?: string;
}

export async function validateEvidence(input: ValidationInput, requestId?: string) {
  const results: ConflictResult[] = [];

  // Group evidence by fieldName to detect contradictions
  const fieldGroups = new Map<string, typeof input.evidence>();
  for (const e of input.evidence) {
    const existing = fieldGroups.get(e.fieldName) || [];
    existing.push(e);
    fieldGroups.set(e.fieldName, existing);
  }

  for (const [fieldName, items] of fieldGroups) {
    // Low confidence check
    for (const item of items) {
      if (item.confidence < 0.7) {
        results.push({
          fieldName,
          status: 'LOW_CONFIDENCE',
          severity: 'WARNING',
          actual: item.value,
          source: item.source,
          details: `Confidence: ${(item.confidence * 100).toFixed(1)}%`,
        });
      }
    }

    // Contradiction check: same field from different sources with different values
    if (items.length > 1) {
      const values = items.map(i => i.normalizedValue || i.value);
      const uniqueValues = [...new Set(values)];
      if (uniqueValues.length > 1) {
        results.push({
          fieldName,
          status: 'CONTRADICTED',
          severity: 'BLOCKING',
          expected: values[0],
          actual: values.slice(1).join(', '),
          source: items.map(i => i.source).join(' vs '),
          details: `Contradicting values from different sources: ${items.map(i => `${i.source}=${i.value}`).join(', ')}`,
        });
      }
    }
  }

  // Policy condition checks
  if (input.policyData?.clauses) {
    // Room rent check
    const roomRentEvidence = input.evidence.find(e => e.fieldName === 'room_rent_per_day');
    if (roomRentEvidence) {
      const roomRentClause = input.policyData.clauses.find(c => c.section === 'Room Rent');
      if (roomRentClause) {
        const policyLimit = extractAmount(roomRentClause.content);
        const actualAmount = parseFloat(roomRentEvidence.value);
        if (policyLimit && actualAmount > policyLimit) {
          results.push({
            fieldName: 'room_rent_per_day',
            status: 'POLICY_CONDITION_FLAGGED',
            severity: 'BLOCKING',
            expected: `₹${policyLimit}/day (policy limit)`,
            actual: `₹${actualAmount}/day (hospital bill)`,
            source: 'policy_vs_hospital_bill',
            details: `Room rent ₹${actualAmount}/day exceeds policy limit of ₹${policyLimit}/day. Excess of ₹${actualAmount - policyLimit}/day will be borne by policyholder.`,
          });
        }
      }
    }
  }

  // Persist validation results
  for (const result of results) {
    await prisma.validationResult.create({
      data: {
        journeyId: input.journeyId,
        fieldName: result.fieldName,
        status: result.status,
        expected: result.expected,
        actual: result.actual,
        source: result.source,
        details: result.details,
        severity: result.severity,
      },
    });
  }

  if (results.some(r => r.status === 'CONTRADICTED' || r.status === 'POLICY_CONDITION_FLAGGED')) {
    await createAuditEvent({
      journeyId: input.journeyId,
      eventType: 'conflict_detected',
      actorType: 'SYSTEM',
      requestId,
      metadata: { conflicts: results.filter(r => r.severity === 'BLOCKING') },
    });

    await createTimelineEvent({
      journeyId: input.journeyId,
      eventType: 'conflict_detected',
      title: 'Issues detected during validation',
      details: results.filter(r => r.severity === 'BLOCKING').map(r => r.details).join('; '),
      actorType: 'SYSTEM',
    });
  }

  return {
    valid: results.every(r => r.severity !== 'BLOCKING'),
    results,
    blocking: results.filter(r => r.severity === 'BLOCKING'),
    warnings: results.filter(r => r.severity === 'WARNING'),
  };
}

export async function getValidationResults(journeyId: string) {
  return prisma.validationResult.findMany({
    where: { journeyId },
    orderBy: { createdAt: 'desc' },
  });
}

function extractAmount(text: string): number | null {
  const match = text.match(/₹\s*([\d,]+)/);
  if (match) return parseFloat(match[1].replace(/,/g, ''));
  return null;
}
