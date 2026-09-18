import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Scale,
  ArrowRight,
  LifeBuoy,
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
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {totalEvidenceCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            Evidence items
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {processedDocuments} / {totalDocuments}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            Documents processed
          </div>
        </div>

        <div
          style={{
            background: totalIssues > 0 ? 'var(--warning-bg)' : 'var(--surface-sunken)',
            border: totalIssues > 0 ? '1px solid var(--warning-border)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: totalIssues > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {totalIssues}
          </div>
          <div style={{ fontSize: '0.75rem', color: totalIssues > 0 ? 'var(--warning)' : 'var(--text-muted)', marginTop: '0.125rem' }}>
            Items need review
          </div>
        </div>
      </div>

      {/* 19. CONFLICT DESIGN: Calm Information Needs Review Box */}
      {totalIssues > 0 && (
        <Card
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--warning-border)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertCircle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Information needs review
                </h4>
                <Badge variant="amber">Needs Attention</Badge>
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
                <div style={{ background: 'var(--surface-sunken)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Hospital Bill Rate:</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
                    ₹7,500 / day
                  </div>
                </div>

                <div style={{ background: 'var(--surface-sunken)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Policy Limit:</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.125rem' }}>
                    ₹5,000 / day
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.875rem' }}>
                <strong>Why this matters:</strong> The available evidence exceeds the selected policy condition. The copilot can prepare a targeted clause appeal or escalate to a specialist.
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
        </Card>
      )}
    </div>
  );
};
