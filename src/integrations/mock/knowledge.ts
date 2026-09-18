// ============================================================
// Mock Knowledge/RAG Provider — Policy retrieval
// ============================================================
import { KnowledgeProvider, KnowledgeResult } from '../../types';
import prisma from '../../config/database';

export class MockKnowledgeProvider implements KnowledgeProvider {
  async search(query: string, filters?: Record<string, unknown>): Promise<KnowledgeResult[]> {
    // Search policy clauses from database
    const policies = await prisma.policyVersion.findMany({
      include: { policy: true },
    });

    const results: KnowledgeResult[] = [];
    const lower = query.toLowerCase();

    for (const pv of policies) {
      if (!pv.clauses) continue;
      const clauses = JSON.parse(pv.clauses) as Array<{
        id: string; section: string; title: string; content: string; page: number; type: string;
      }>;

      for (const clause of clauses) {
        const content = `${clause.section} ${clause.title} ${clause.content}`.toLowerCase();
        if (content.includes(lower) || lower.split(' ').some(w => w.length > 3 && content.includes(w))) {
          results.push({
            content: clause.content,
            source: `Policy ${pv.policy.policyNumber}, Version ${pv.version}`,
            section: clause.section,
            clause: clause.title,
            page: clause.page,
            score: 0.85 + Math.random() * 0.1,
            metadata: {
              policyId: pv.policyId,
              policyNumber: pv.policy.policyNumber,
              version: pv.version,
              clauseId: clause.id,
              type: clause.type,
              effectiveFrom: pv.effectiveFrom,
              effectiveTo: pv.effectiveTo,
            },
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  async searchPolicy(policyId: string, version: string, query: string): Promise<KnowledgeResult[]> {
    // PIN policy version — never blindly retrieve newest
    const pv = await prisma.policyVersion.findFirst({
      where: { policyId, version },
      include: { policy: true },
    });

    if (!pv || !pv.clauses) return [];

    const clauses = JSON.parse(pv.clauses) as Array<{
      id: string; section: string; title: string; content: string; page: number; type: string;
    }>;

    const lower = query.toLowerCase();
    const results: KnowledgeResult[] = [];

    for (const clause of clauses) {
      const content = `${clause.section} ${clause.title} ${clause.content}`.toLowerCase();
      if (content.includes(lower) || lower.split(' ').some(w => w.length > 3 && content.includes(w))) {
        results.push({
          content: clause.content,
          source: `Policy ${pv.policy.policyNumber}, Version ${pv.version}`,
          section: clause.section,
          clause: clause.title,
          page: clause.page,
          score: 0.90 + Math.random() * 0.08,
          metadata: {
            policyId: pv.policyId,
            policyNumber: pv.policy.policyNumber,
            version: pv.version,
            clauseId: clause.id,
            type: clause.type,
          },
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }
}
