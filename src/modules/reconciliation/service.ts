// ============================================================
// Reconciliation Service — Policy vs Evidence vs Insurer Query
// ============================================================
import prisma from '../../config/database';
import { createAuditEvent } from '../audit/service';
import { createTimelineEvent } from '../timeline/service';
import { MockKnowledgeProvider } from '../../integrations/mock/knowledge';
import { MockLLMProvider } from '../../integrations/mock/llm';

const knowledgeProvider = new MockKnowledgeProvider();
const llmProvider = new MockLLMProvider();

export interface ReconciliationInput {
  journeyId: string;
  claimId?: string;
  queryType: string;
  queryText: string;
  policyId: string;
  policyVersion: string;
}

export async function reconcile(input: ReconciliationInput, requestId?: string) {
  // 1. Retrieve pinned policy clause
  const policyClauses = await knowledgeProvider.searchPolicy(
    input.policyId,
    input.policyVersion,
    input.queryText
  );

  // 2. Retrieve evidence for this journey
  const evidence = await prisma.evidenceItem.findMany({
    where: { journeyId: input.journeyId },
  });

  // 3. Find matching clause
  const matchedClause = policyClauses.length > 0 ? policyClauses[0] : null;

  // 4. Determine conflict
  let conflict = null;
  let requiresHuman = false;

  if (!matchedClause) {
    conflict = {
      type: 'NO_MATCHING_CLAUSE',
      description: 'Could not find a matching policy clause for this query. Requires human review.',
    };
    requiresHuman = true;
  } else {
    // Check for specific conflicts (room rent example)
    const roomRentEvidence = evidence.find(e => e.fieldName === 'room_rent_per_day');
    if (roomRentEvidence && matchedClause.section === 'Room Rent') {
      const claimedAmount = parseFloat(roomRentEvidence.value);
      const policyLimit = extractAmount(matchedClause.content);
      if (policyLimit && claimedAmount > policyLimit) {
        conflict = {
          type: 'AMOUNT_EXCEEDS_LIMIT',
          field: 'room_rent_per_day',
          claimed: claimedAmount,
          policyLimit,
          excess: claimedAmount - policyLimit,
          excessTotal: (claimedAmount - policyLimit) * 5, // 5 days
          description: `Room rent ₹${claimedAmount}/day exceeds policy limit of ₹${policyLimit}/day`,
        };
      }
    }
  }

  // 5. Generate explanation
  const explanationPrompt = `Explain the reconciliation between insurer query "${input.queryText}" and policy clause "${matchedClause?.content || 'not found'}" with evidence.`;
  const explanation = await llmProvider.chat('You are a financial copilot.', explanationPrompt);

  // 6. Determine next action
  let nextAction = 'REVIEW_POLICY';
  if (conflict?.type === 'AMOUNT_EXCEEDS_LIMIT') {
    nextAction = 'RESPOND_TO_INSURER';
  } else if (requiresHuman) {
    nextAction = 'ESCALATE_TO_HUMAN';
  }

  // 7. Persist reconciliation
  const reconciliation = await prisma.reconciliation.create({
    data: {
      journeyId: input.journeyId,
      claimId: input.claimId,
      type: 'POLICY_VS_EVIDENCE',
      matchedClause: matchedClause ? JSON.stringify({
        content: matchedClause.content,
        source: matchedClause.source,
        section: matchedClause.section,
        clause: matchedClause.clause,
        page: matchedClause.page,
      }) : null,
      evidence: JSON.stringify(evidence.map(e => ({
        fieldName: e.fieldName,
        value: e.value,
        source: e.sourceDocumentId,
        confidence: e.confidence,
      }))),
      conflict: conflict ? JSON.stringify(conflict) : null,
      explanation: explanation.content,
      nextAction,
      confidence: matchedClause ? matchedClause.score : 0,
      requiresHuman,
      status: 'COMPLETED',
    },
  });

  await createAuditEvent({
    journeyId: input.journeyId,
    eventType: 'reconciliation_completed',
    actorType: 'SYSTEM',
    requestId,
    metadata: { hasConflict: !!conflict, requiresHuman, nextAction },
  });

  await createTimelineEvent({
    journeyId: input.journeyId,
    eventType: 'reconciliation_completed',
    title: 'Reconciliation completed',
    details: conflict ? `Issue found: ${conflict.description}` : 'No conflicts detected',
    actorType: 'SYSTEM',
  });

  return {
    reconciliation,
    matchedClause: matchedClause ? {
      content: matchedClause.content,
      source: matchedClause.source,
      section: matchedClause.section,
      page: matchedClause.page,
    } : null,
    evidence: evidence.map(e => ({
      fieldName: e.fieldName,
      value: e.value,
      unit: e.unit,
      source: e.sourceDocumentId,
      confidence: e.confidence,
    })),
    conflict,
    explanation: explanation.content,
    nextAction,
    requiresHumanReview: requiresHuman,
    citations: matchedClause ? [{
      policy: matchedClause.metadata?.policyNumber,
      version: matchedClause.metadata?.version,
      section: matchedClause.section,
      page: matchedClause.page,
    }] : [],
  };
}

export async function getReconciliations(journeyId: string) {
  const results = await prisma.reconciliation.findMany({
    where: { journeyId },
    orderBy: { createdAt: 'desc' },
  });
  return results.map(r => ({
    ...r,
    matchedClause: r.matchedClause ? JSON.parse(r.matchedClause) : null,
    evidence: r.evidence ? JSON.parse(r.evidence) : null,
    conflict: r.conflict ? JSON.parse(r.conflict) : null,
  }));
}

function extractAmount(text: string): number | null {
  const match = text.match(/₹\s*([\d,]+)/);
  if (match) return parseFloat(match[1].replace(/,/g, ''));
  return null;
}
