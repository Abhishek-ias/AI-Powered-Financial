import React from 'react';
import {
  AlertCircle,
  LifeBuoy,
} from 'lucide-react';
import { ValidationSummary } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export interface ValidationSummaryCardProps {
  validation: ValidationSummary;
  totalDocuments: number;
  processedDocuments: number;
  totalEvidenceCount: number;
  onNavigateToUpload?: () => void;
  onEscalate?: () => void;
  onReviewEvidence?: () => void;
}

export const ValidationSummaryCard: React.FC<ValidationSummaryCardProps> = ({
  validation,
  totalDocuments,
  processedDocuments,
  totalEvidenceCount,
  onNavigateToUpload,
  onEscalate,
  onReviewEvidence,
}) => {
  const blockingIssues = validation.blocking || [];
  const warningIssues = validation.warnings || [];
  const totalIssues = blockingIssues.length + warningIssues.length;
  const isBlocking = blockingIssues.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 18. EVIDENCE SUMMARY: Compact Overview Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
            {totalEvidenceCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.125rem' }}>
            Evidence items
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
            {processedDocuments} / {totalDocuments}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.125rem' }}>
            Documents processed
          </div>
        </div>

        <div
          style={{
            background: totalIssues > 0 ? '#FFF7ED' : '#FFFFFF',
            border: totalIssues > 0 ? '1px solid #FED7AA' : '1px solid #E2E8F0',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: totalIssues > 0 ? '#9A3412' : '#0F172A' }}>
            {totalIssues}
          </div>
          <div style={{ fontSize: '0.75rem', color: totalIssues > 0 ? '#9A3412' : '#64748B', marginTop: '0.125rem' }}>
            Items need review
          </div>
        </div>
      </div>

      {/* 11. CONFLICT UI: Soft amber container (#FFF7ED, #FED7AA, #9A3412, #7C2D12) */}
      {totalIssues > 0 && (
        <div
          style={{
            background: isBlocking ? '#FEF2F2' : '#FFF7ED',
            border: `1px solid ${isBlocking ? '#FECACA' : '#FED7AA'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertCircle
              size={18}
              color={isBlocking ? '#DC2626' : '#D97706'}
              style={{ flexShrink: 0, marginTop: '2px' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: isBlocking ? '#991B1B' : '#9A3412' }}>
                  Information needs review
                </h4>
                <Badge variant={isBlocking ? 'red' : 'amber'}>
                  {isBlocking ? 'Blocking Contradiction' : 'Needs Review'}
                </Badge>
              </div>

              {/* Sub-limit rate comparison */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                  margin: '0.75rem 0',
                }}
              >
                <div style={{ background: '#FFFFFF', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                    Hospital Bill
                  </span>
                  <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0F172A', marginTop: '0.125rem' }}>
                    ₹7,500 / day
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                    Policy Limit
                  </span>
                  <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#16A34A', marginTop: '0.125rem' }}>
                    ₹5,000 / day
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: isBlocking ? '#7F1D1D' : '#7C2D12', lineHeight: 1.45, marginBottom: '0.875rem' }}>
                <strong>Why this matters: </strong>
                The available evidence exceeds the selected policy condition. The copilot can prepare a targeted clause appeal or escalate to a specialist.
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {onReviewEvidence && (
                  <button
                    onClick={onReviewEvidence}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                  >
                    Review evidence
                  </button>
                )}

                {onEscalate && (
                  <button
                    onClick={onEscalate}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', gap: '0.375rem' }}
                  >
                    <LifeBuoy size={13} />
                    <span>Escalate to human</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
