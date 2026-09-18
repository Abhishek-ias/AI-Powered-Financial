import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EvidenceItem } from '../../types';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { Badge } from '../common/Badge';

export interface EvidenceCardProps {
  evidence: EvidenceItem;
  documentName?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, documentName }) => {
  const [showSource, setShowSource] = useState<boolean>(false);

  let statusBadgeVariant: 'green' | 'amber' | 'red' | 'blue' | 'gray' = 'green';
  let statusLabel = 'Verified';
  const isContradicted = evidence.status === 'CONTRADICTED';
  const isPolicyFlagged = evidence.status === 'POLICY_CONDITION_FLAGGED';
  const isLowConfidence = evidence.status === 'LOW_CONFIDENCE';

  if (isContradicted) {
    statusBadgeVariant = 'amber';
    statusLabel = 'Needs Review';
  } else if (isPolicyFlagged) {
    statusBadgeVariant = 'amber';
    statusLabel = 'Exceeds Cap';
  } else if (isLowConfidence) {
    statusBadgeVariant = 'amber';
    statusLabel = 'Low Confidence';
  } else if (evidence.status === 'VALID') {
    statusBadgeVariant = 'green';
    statusLabel = 'Verified';
  }

  // Format field name for humans (e.g. room_rent_per_day -> ROOM RENT)
  const formattedField = evidence.fieldName
    .split('_')
    .join(' ')
    .toUpperCase();

  // Format display value
  let displayValue = evidence.normalizedValue || evidence.value;
  const isCurrency =
    evidence.unit === 'INR' ||
    evidence.fieldName.includes('amount') ||
    evidence.fieldName.includes('bill') ||
    evidence.fieldName.includes('rent') ||
    evidence.fieldName.includes('charges') ||
    evidence.fieldName.includes('salary');

  if (isCurrency && !displayValue.startsWith('₹') && !isNaN(Number(displayValue))) {
    displayValue = `₹${Number(displayValue).toLocaleString('en-IN')}`;
    if (evidence.fieldName === 'room_rent_per_day') {
      displayValue += ' / day';
    }
  }

  const sourceLabel = documentName || evidence.factType.replace(/_/g, ' ');

  return (
    <div
      style={{
        background: 'var(--surface-sunken)',
        border: isPolicyFlagged || isContradicted
          ? '1px solid var(--warning-border)'
          : '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
      }}
    >
      {/* Header: Field Name & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
            }}
          >
            {formattedField}
          </span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '0.125rem',
              fontFamily: isCurrency ? 'var(--font-mono)' : 'inherit',
            }}
          >
            {displayValue}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
          <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
          <ConfidenceBadge confidence={evidence.confidence} size="sm" />
        </div>
      </div>

      {/* Provenance: Document Source & Page */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          background: 'var(--surface-card)',
          padding: '0.375rem 0.625rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <FileText size={12} color="var(--primary-light)" />
          <span>{sourceLabel}</span>
        </div>

        {evidence.sourcePage && (
          <span style={{ color: 'var(--text-muted)' }}>Page {evidence.sourcePage}</span>
        )}
      </div>

      {/* Expandable OCR Snippet */}
      {evidence.sourceText && (
        <div>
          <button
            type="button"
            onClick={() => setShowSource(!showSource)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              color: 'var(--primary-light)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>{showSource ? 'Hide source text' : 'View source snippet'}</span>
            {showSource ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showSource && (
            <div
              style={{
                marginTop: '0.375rem',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {evidence.sourceText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
