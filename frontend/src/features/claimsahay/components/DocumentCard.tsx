import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import { DocumentItem } from '../../../types';
import { Badge } from '../../../components/ui/Badge';

export interface DocumentCardProps {
  document: DocumentItem;
  onRetry?: (documentId: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onRetry }) => {
  const status = document.status.toUpperCase();

  let statusBadgeVariant: 'blue' | 'green' | 'amber' | 'red' | 'gray' = 'blue';
  let StatusIcon = Clock;
  let statusText = status;

  if (status === 'PROCESSED') {
    statusBadgeVariant = 'green';
    StatusIcon = CheckCircle2;
    statusText = 'Processed';
  } else if (status === 'PROCESSING') {
    statusBadgeVariant = 'blue';
    StatusIcon = Cpu;
    statusText = 'Processing';
  } else if (status === 'UPLOADED') {
    statusBadgeVariant = 'blue';
    StatusIcon = CheckCircle2;
    statusText = 'Uploaded';
  } else if (status === 'FAILED') {
    statusBadgeVariant = 'red';
    StatusIcon = AlertTriangle;
    statusText = 'Failed';
  } else if (status === 'REQUIRES_REVIEW') {
    statusBadgeVariant = 'amber';
    StatusIcon = AlertTriangle;
    statusText = 'Needs Review';
  }

  const sizeBytes = document.size || document.sizeBytes || 0;
  const formattedSize =
    sizeBytes > 1024 * 1024
      ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;

  const fieldsCount = document.fields?.length || 0;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={16} color="#2563EB" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={document.originalName}
            >
              {document.originalName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {document.documentType} • {formattedSize}
            </div>
          </div>
        </div>

        <Badge variant={statusBadgeVariant}>
          <StatusIcon size={12} style={{ marginRight: '0.25rem' }} />
          {statusText}
        </Badge>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#64748B',
          paddingTop: '0.375rem',
          borderTop: '1px solid #F1F5F9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Layers size={13} color="#94A3B8" />
          <span>
            {fieldsCount > 0 ? `${fieldsCount} fields extracted` : status === 'PROCESSED' ? 'Extraction complete' : 'Awaiting OCR pipeline'}
          </span>
        </div>

        {status === 'FAILED' && onRetry && (
          <button
            onClick={() => onRetry(document.id)}
            className="btn btn-secondary"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}
          >
            <RefreshCw size={11} />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
};
