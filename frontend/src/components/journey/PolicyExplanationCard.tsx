import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LifeBuoy,
  FileText,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ReconciliationResult, NextBestAction } from '../../types';
import { PolicyCitation } from './PolicyCitation';
import { NextBestActionCard } from './NextBestActionCard';

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
    title: 'Room Rent Sub-Limit Query',
    queryType: 'ROOM_RENT_CAPPING',
    queryText: 'Room rent sub-limit deduction: room tariff ₹7,500/day vs ₹5,000/day private room',
    badge: 'Standard Scenario',
  },
  {
    title: 'Pre/Post Hospitalization Timeline',
    queryType: 'PRE_POST_HOSPITALIZATION',
    queryText: 'Pre-Hospitalization expenses incurred 30 days prior to hospital admission',
    badge: 'Coverage Check',
  },
  {
    title: 'Cosmetic / Uncovered Procedure',
    queryType: 'UNCOVERED_QUERY',
    queryText: 'Experimental cosmetic scar surgery rhinoplasty laser therapy',
    badge: 'No-Source Guardrail Test',
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

  const hasConflict = !!reconciliation?.conflict;
  const isNoSourceGuardrail =
    reconciliation?.conflict?.type === 'NO_MATCHING_CLAUSE' ||
    reconciliation?.requiresHumanReview === true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Scale size={16} color="#60a5fa" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-light)' }}>
              Stage 5 • Policy Citation & Grounded Explanation
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Automated Policy Clause Reconciliation & RAG Grounding
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Cross-referencing hospital evidence items against pinned terms from SafeGuard Health Insurance Policy (POL-HEALTH-2024-001).
          </p>
        </div>

        <Badge variant="blue">Policy Pinned: 2024-v1</Badge>
      </div>

      {/* Interactive Scenario Selector & Query Trigger */}
      <Card
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid var(--border-subtle)',
          padding: '1.5rem',
        }}
      >
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Select or input an insurer query to reconcile against policy terms:
        </div>

        {/* Quick Scenarios */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.625rem', marginBottom: '1rem' }}>
          {RECONCILIATION_SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleScenarioChange(idx)}
              disabled={isReconciling}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: selectedScenarioIdx === idx ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                border: selectedScenarioIdx === idx ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.8125rem', color: '#ffffff' }}>{sc.title}</strong>
                <Badge variant={idx === 2 ? 'amber' : 'blue'}>{sc.badge}</Badge>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sc.queryText}
              </div>
            </button>
          ))}
        </div>

        {/* Query Input Area */}
        <form onSubmit={handleTriggerReconcile} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea
            value={customQueryText}
            onChange={(e) => setCustomQueryText(e.target.value)}
            disabled={isReconciling}
            rows={2}
            style={{
              width: '100%',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              outline: 'none',
              resize: 'vertical',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isReconciling || !customQueryText.trim()}
              className="btn btn-primary"
              style={{ minWidth: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isReconciling ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                  <span>Reconciling with Policy Clauses...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Execute Grounded Reconciliation</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* RAG No-Source Guardrail Display */}
      {reconciliation && isNoSourceGuardrail && (
        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
            <AlertTriangle size={24} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1.0625rem', color: '#ffffff' }}>
                  Safety Guardrail: No Grounded Policy Source Found (UNCERTAIN)
                </strong>
                <Badge variant="amber">Requires Human Review</Badge>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                The automated retrieval system could not locate a matching policy clause in <strong>SafeGuard Health Insurance Policy (POL-HEALTH-2024-001)</strong> for
                this specific query. Under Team NOVA's explainability guardrails, the copilot will not invent or extrapolate policy terms.
              </p>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.875rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.8125rem',
                  color: '#fde047',
                }}
              >
                <strong>System Guidance: </strong>
                {reconciliation.conflict?.description || 'Could not find a matching policy clause for this query. Requires human review.'}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {onEscalateToHuman && (
                  <button
                    onClick={onEscalateToHuman}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <LifeBuoy size={16} />
                    <span>Escalate to Human Insurance Specialist</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Grounded Reconciliation Results */}
      {reconciliation && !isNoSourceGuardrail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Pinned Policy Citation */}
          {reconciliation.matchedClause && (
            <PolicyCitation
              matchedClause={reconciliation.matchedClause}
              citation={reconciliation.citations && reconciliation.citations[0]}
              policyNumber="POL-HEALTH-2024-001"
              version="2024-v1"
            />
          )}

          {/* Conflict Analysis Table (Room Rent Sub-limit Capping Calculation) */}
          {((reconciliation.conflict && reconciliation.conflict.type === 'AMOUNT_EXCEEDS_LIMIT') ||
            reconciliation.matchedClause?.section === 'Room Rent') && (
            <Card
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <Scale size={18} color="#fbbf24" />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Room Rent Sub-Limit Capping Calculation
                </h4>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '0.875rem',
                }}
              >
                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Billed Hospital Rate:</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fca5a5', marginTop: '0.25rem' }}>
                    ₹{(reconciliation.conflict?.claimed ?? 7500).toLocaleString('en-IN')} / day
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Policy Cap Limit:</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#34d399', marginTop: '0.25rem' }}>
                    ₹{(reconciliation.conflict?.policyLimit ?? 5000).toLocaleString('en-IN')} / day
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Daily Excess Amount:</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fde047', marginTop: '0.25rem' }}>
                    ₹{(reconciliation.conflict?.excess ?? 2500).toLocaleString('en-IN')} / day
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Estimated Out-of-Pocket:</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>
                    ₹{(reconciliation.conflict?.excessTotal ?? 12500).toLocaleString('en-IN')} (5 days)
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>Impact Analysis: </strong>
                Because room rent is capped at ₹5,000/day, proportionate deductions may also apply to associated hospital services.
              </div>
            </Card>
          )}

          {/* Grounded Explanation Narrative */}
          {reconciliation.explanation && (
            <Card
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid var(--border-subtle)',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="#60a5fa" />
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Grounded AI Policy Explanation
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge variant="green">Grounded Reasoning</Badge>
                  <button
                    onClick={copyExplanation}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    {copiedExplanation ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    <span>{copiedExplanation ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {reconciliation.explanation}
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  Evidence Sources: <strong>Hospital Bill (Page 3)</strong>, <strong>Discharge Summary (Page 1)</strong>
                </div>
                <div>
                  Prompt Injection Barrier: <strong style={{ color: '#34d399' }}>Enforced</strong>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Authoritative Next Best Actions */}
      {nextActions && nextActions.length > 0 && (
        <NextBestActionCard
          actions={nextActions}
          onSelectAction={(action) => {
            if (action.action === 'ESCALATE_TO_HUMAN' && onEscalateToHuman) {
              onEscalateToHuman();
            } else if ((action.action === 'CONFIRM_CLAIM' || action.action === 'CONFIRM_AND_SUBMIT') && onProceedToReview) {
              onProceedToReview();
            } else if (action.action === 'REVIEW_POLICY') {
              handleScenarioChange(0);
            }
          }}
        />
      )}
    </div>
  );
};
