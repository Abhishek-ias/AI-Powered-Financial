import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  LifeBuoy,
  Copy,
  Check,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ReconciliationResult, NextBestAction } from '../../../types';
import { PolicyCitation } from './PolicyCitation';

export interface PolicyExplanationCardProps {
  journeyId: string;
  reconciliation: ReconciliationResult | null;
  nextActions: NextBestAction[];
  onReconcile: (queryType: string, queryText: string) => Promise<void>;
  isReconciling: boolean;
  onEscalateToHuman?: () => void;
  onProceedToReview?: () => void;
}

const RECONCILIATION_SCENARIOS = [
  {
    title: 'Room Rent Capping Discrepancy',
    queryType: 'ROOM_RENT_CAPPING',
    queryText: 'Room rent sub-limit deduction: room tariff ₹7,500/day vs ₹5,000/day private room',
  },
  {
    title: 'Pre/Post Hospitalization Timeline',
    queryType: 'PRE_POST_HOSPITALIZATION',
    queryText: 'Pre-Hospitalization expenses incurred 30 days prior to hospital admission',
  },
  {
    title: 'Cosmetic / Uncovered Query',
    queryType: 'UNCOVERED_QUERY',
    queryText: 'Experimental cosmetic scar surgery rhinoplasty laser therapy',
  },
];

export const PolicyExplanationCard: React.FC<PolicyExplanationCardProps> = ({
  journeyId,
  reconciliation,
  nextActions,
  onReconcile,
  isReconciling,
  onEscalateToHuman,
  onProceedToReview,
}) => {
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [customQueryText, setCustomQueryText] = useState<string>(
    RECONCILIATION_SCENARIOS[0].queryText
  );
  const [copiedExplanation, setCopiedExplanation] = useState<boolean>(false);

  const handleScenarioChange = (idx: number) => {
    setSelectedScenarioIdx(idx);
    setCustomQueryText(RECONCILIATION_SCENARIOS[idx].queryText);
  };

  const handleTriggerReconcile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isReconciling || !customQueryText.trim()) return;
    const scenario = RECONCILIATION_SCENARIOS[selectedScenarioIdx];
    await onReconcile(scenario ? scenario.queryType : 'CUSTOM_QUERY', customQueryText.trim());
  };

  const copyExplanation = () => {
    if (!reconciliation?.explanation) return;
    navigator.clipboard.writeText(reconciliation.explanation);
    setCopiedExplanation(true);
    setTimeout(() => setCopiedExplanation(false), 2000);
  };

  const isNoSourceGuardrail =
    reconciliation?.conflict?.type === 'NO_MATCHING_CLAUSE' ||
    reconciliation?.requiresHumanReview === true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A' }}>
            Policy Clause Reconciliation & Explanation
          </h3>
          <p style={{ color: '#475569', fontSize: '0.875rem' }}>
            Cross-referencing hospital evidence items against SafeGuard Health Insurance Policy (POL-HEALTH-2024-001).
          </p>
        </div>

        <Badge variant="blue">Policy Pinned: 2024-v1</Badge>
      </div>

      {/* Interactive Scenario Selector & Query Input */}
      <Card style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.75rem' }}>
          Select or customize the insurer deduction query to reconcile:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '0.875rem' }}>
          {RECONCILIATION_SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleScenarioChange(idx)}
              disabled={isReconciling}
              style={{
                textAlign: 'left',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                background: selectedScenarioIdx === idx ? '#EFF6FF' : '#F8FAFC',
                border: selectedScenarioIdx === idx ? '1px solid #2563EB' : '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0F172A', marginBottom: '0.125rem' }}>
                {sc.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sc.queryText}
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={handleTriggerReconcile} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea
            value={customQueryText}
            onChange={(e) => setCustomQueryText(e.target.value)}
            disabled={isReconciling}
            rows={2}
            className="input-text"
            style={{ resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isReconciling || !customQueryText.trim()}
              className="btn btn-primary"
              style={{ minWidth: '200px', gap: '0.5rem' }}
            >
              {isReconciling ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                  <span>Reconciling...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Reconcile Against Policy</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* RAG No-Source Guardrail Display (Soft amber container #FFF7ED) */}
      {reconciliation && isNoSourceGuardrail && (
        <div
          style={{
            background: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <strong style={{ fontSize: '0.9375rem', color: '#9A3412' }}>
                  Safety Guardrail: No Grounded Policy Source Found (UNCERTAIN)
                </strong>
                <Badge variant="amber">Requires Human Review</Badge>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#7C2D12', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                No matching policy clause exists in <strong>SafeGuard Health Insurance (POL-HEALTH-2024-001)</strong> for this specific claim procedure. To uphold strict financial governance, the copilot will never hallucinate or assume unverified terms.
              </p>

              {onEscalateToHuman && (
                <button
                  onClick={onEscalateToHuman}
                  className="btn btn-primary"
                  style={{ gap: '0.375rem', fontSize: '0.8125rem' }}
                >
                  <LifeBuoy size={14} />
                  <span>Escalate to Human Insurance Specialist</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grounded Reconciliation Results */}
      {reconciliation && !isNoSourceGuardrail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Policy Source Card */}
          {reconciliation.matchedClause && (
            <PolicyCitation
              matchedClause={reconciliation.matchedClause}
              citation={reconciliation.citations && reconciliation.citations[0]}
              policyNumber="POL-HEALTH-2024-001"
              version="2024-v1"
            />
          )}

          {/* Structured 3-Part AI Explanation */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="#2563EB" />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A' }}>Plain-Language Policy Guidance</h4>
              </div>

              <button
                type="button"
                onClick={copyExplanation}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', gap: '0.25rem' }}
              >
                {copiedExplanation ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                <span>{copiedExplanation ? 'Copied' : 'Copy Explanation'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* WHAT THE POLICY SAYS */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '0.375rem' }}>
                  What the Policy Says
                </div>
                <div style={{ fontSize: '0.875rem', color: '#0F172A', lineHeight: 1.5 }}>
                  {reconciliation.matchedClause?.content || 'Clause 4.2: Room rent capped at 1% of Sum Insured (max ₹5,000/day for normal room).'}
                </div>
              </div>

              {/* WHAT THIS MEANS FOR YOU */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '0.375rem' }}>
                  What This Means For You
                </div>
                <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                  {reconciliation.explanation ||
                    'Your hospital billed ₹7,500/day which exceeds the ₹5,000/day policy limit. You have an excess tariff of ₹2,500/day across 5 days (₹12,500 total) which is subject to proportionate deduction.'}
                </div>
              </div>

              {/* WHAT YOU CAN DO NEXT */}
              <div style={{ background: '#EFF6FF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1E40AF', marginBottom: '0.375rem' }}>
                  What You Can Do Next
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1E3A8A', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {reconciliation.nextAction ||
                    'Review the room-rent evidence and submit a proportionate deduction waiver appeal, or request specialist escalation to verify ICU tariff exemptions.'}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {onProceedToReview && (
                    <button
                      onClick={onProceedToReview}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', gap: '0.375rem' }}
                    >
                      <span>Proceed to Review & Confirm</span>
                      <ArrowRight size={13} />
                    </button>
                  )}

                  {onEscalateToHuman && (
                    <button
                      onClick={onEscalateToHuman}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', gap: '0.375rem' }}
                    >
                      <LifeBuoy size={13} />
                      <span>Escalate to Human</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
