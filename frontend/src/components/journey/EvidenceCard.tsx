import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Info,
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

  // Status mapping
  let statusBadgeVariant: 'green' | 'amber' | 'red' | 'blue' | 'gray' = 'green';
  let statusLabel = 'Valid Evidence';
  let isContradicted = evidence.status === 'CONTRADICTED';
  let isPolicyFlagged = evidence.status === 'POLICY_CONDITION_FLAGGED';
  let isLowConfidence = evidence.status === 'LOW_CONFIDENCE';

  if (isContradicted) {
    statusBadgeVariant = 'red';
    statusLabel = 'Contradicted';
  } else if (isPolicyFlagged) {
    statusBadgeVariant = 'amber';
    statusLabel = 'Exceeds Policy Limit';
  } else if (isLowConfidence) {
    statusBadgeVariant = 'amber';
    statusLabel = 'Low Confidence';
  } else if (evidence.status === 'VALID') {
    statusBadgeVariant = 'green';
    statusLabel = 'Verified';
  }

  // Format field name for humans (e.g. room_rent_per_day -> Room Rent Per Day)
  const formattedField = evidence.fieldName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Format value (e.g. add currency symbol if unit is INR or field contains bill/rent)
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
        background: isContradicted
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)'
          : isPolicyFlagged
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)'
          : 'rgba(30, 41, 59, 0.6)',
        border: isContradicted
          ? '1px solid rgba(239, 68, 68, 0.4)'
          : isPolicyFlagged
          ? '1px solid rgba(245, 158, 11, 0.4)'
          : '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header: Field Name & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
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
            FIELD
          </span>
          <h4
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginTop: '0.125rem',
            }}
          >
            {formattedField}
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <ConfidenceBadge confidence={evidence.confidence} size="sm" />
          <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
        </div>
      </div>

      {/* Primary Value */}
      <div
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: isContradicted ? '#fca5a5' : isPolicyFlagged ? '#fde047' : '#ffffff',
          fontFamily: isCurrency ? 'var(--font-mono)' : 'inherit',
          padding: '0.25rem 0',
        }}
      >
        {displayValue}
      </div>

      {/* Provenance: Document Source & Page */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          background: 'rgba(15, 23, 42, 0.45)',
          padding: '0.375rem 0.625rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <FileText size={13} color="#60a5fa" />
          <span>
            Source: <strong style={{ color: 'var(--text-primary)' }}>{sourceLabel}</strong>
          </span>
        </div>

        {evidence.sourcePage && (
          <span style={{ color: 'var(--text-muted)' }}>
            Page {evidence.sourcePage}
          </span>
        )}
      </div>

      {/* Source Text Drawer */}
      {evidence.sourceText && (
        <div style={{ marginTop: '0.125rem' }}>
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
            <span>{showSource ? 'Hide OCR source snippet' : 'View extracted snippet'}</span>
            {showSource ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showSource && (
            <div
              style={{
                marginTop: '0.375rem',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
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
