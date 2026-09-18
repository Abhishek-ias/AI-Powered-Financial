import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Scale,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { ValidationSummary, ValidationIssue } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export interface ValidationSummaryCardProps {
  validation: ValidationSummary;
  totalDocuments: number;
  processedDocuments: number;
  totalEvidenceCount: number;
  onNavigateToUpload?: () => void;
  onEscalate?: () => void;
}

export const ValidationSummaryCard: React.FC<ValidationSummaryCardProps> = ({
  validation,
  totalDocuments,
  processedDocuments,
  totalEvidenceCount,
  onNavigateToUpload,
  onEscalate,
}) => {
  const blockingIssues = validation.blocking || [];
  const warningIssues = validation.warnings || [];
  const totalIssues = blockingIssues.length + warningIssues.length;
  const hasBlocking = blockingIssues.length > 0;

  // Separate contradictions and policy limit flags
  const contradictions = blockingIssues.filter((i) => i.status === 'CONTRADICTED');
  const policyFlags = blockingIssues.filter((i) => i.status === 'POLICY_CONDITION_FLAGGED');
  const otherBlocking = blockingIssues.filter(
    (i) => i.status !== 'CONTRADICTED' && i.status !== 'POLICY_CONDITION_FLAGGED'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Documents
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>
            {processedDocuments} / {totalDocuments}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Processed with AI OCR
          </div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Evidence Extracted
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.25rem' }}>
            {totalEvidenceCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Structured claim fields
          </div>
        </div>

        <div
          style={{
            background: hasBlocking ? 'rgba(239, 68, 68, 0.1)' : 'rgba(30, 41, 59, 0.6)',
            border: hasBlocking ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Review Required
          </div>
          <div
            style={{
              fontSize: '1.375rem',
              fontWeight: 700,
              color: hasBlocking ? '#fca5a5' : '#34d399',
              marginTop: '0.25rem',
            }}
          >
            {blockingIssues.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {hasBlocking ? 'Action items to resolve' : 'Zero blocking conflicts'}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Validation State
          </div>
          <div style={{ marginTop: '0.375rem' }}>
            <Badge variant={hasBlocking ? 'red' : 'green'}>
              {hasBlocking ? 'Action Required' : 'All Rules Passed'}
            </Badge>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
            Deterministic rule check
          </div>
        </div>
      </div>

      {/* Prominent Calm Contradiction Notice */}
      {contradictions.length > 0 && (
        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.75) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={22} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
                  Information Needs Review: Cross-Document Contradiction
                </strong>
                <Badge variant="red">Blocking Conflict</Badge>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.875rem' }}>
                The uploaded documents contain conflicting statements. To maintain absolute evidence integrity, the system
                will not arbitrarily guess or choose between values.
              </p>

              {contradictions.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.875rem 1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fca5a5', textTransform: 'uppercase' }}>
                    Conflicting Field: {item.fieldName.replace(/_/g, ' ')}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>First Recorded Value:</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#ffffff' }}>{item.expected}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Second Recorded Value:</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#ffffff' }}>{item.actual}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.375rem' }}>
                    <strong>Why this matters: </strong>
                    {item.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Prominent Policy Condition Flag Notice */}
      {policyFlags.length > 0 && (
        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.75) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Scale size={22} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
                  Policy Condition Flag: Sub-Limit Exceeded
                </strong>
                <Badge variant="amber">Review Recommended</Badge>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.875rem' }}>
                Line items in your hospital invoice exceed the standard capping specified in your policy schedule.
              </p>

              {policyFlags.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.875rem 1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Hospital Bill Billed Rate:</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fde047' }}>
                        {item.actual}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Policy Cap Limit:</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>
                        {item.expected}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.375rem' }}>
                    <strong>Why this matters: </strong>
                    {item.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Other Warnings / Low Confidence */}
      {warningIssues.length > 0 && (
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Info size={16} color="#60a5fa" />
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              Information May Need Confirmation ({warningIssues.length} items)
            </strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {warningIssues.map((w, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.4)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{w.fieldName.replace(/_/g, ' ')}: </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{w.actual || 'Extracted with lower confidence'}</span>
                </div>
                <Badge variant="amber">{w.details}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clean Success State */}
      {!hasBlocking && warningIssues.length === 0 && (
        <Card
          style={{
            background: 'rgba(6, 78, 59, 0.2)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <CheckCircle2 size={24} color="#34d399" />
          <div>
            <strong style={{ fontSize: '0.9375rem', color: '#ffffff' }}>
              All Evidence Cross-Checks Passed Cleanly
            </strong>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
              Zero cross-document contradictions detected. Proceed to policy clause reconciliation and review.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
