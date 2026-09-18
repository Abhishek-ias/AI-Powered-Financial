import React from 'react';
import {
  FileText,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import { DocumentItem } from '../../types';
import { Badge } from '../common/Badge';

export interface DocumentCardProps {
  document: DocumentItem;
  onRetry?: (documentId: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onRetry }) => {
  const status = document.status.toUpperCase();

  // Status mapping
  let statusBadgeVariant: 'blue' | 'green' | 'amber' | 'red' | 'gray' = 'blue';
  let StatusIcon = Clock;
  let statusText = status;

  if (status === 'PROCESSED') {
    statusBadgeVariant = 'green';
    StatusIcon = CheckCircle2;
    statusText = 'Processed';
  } else if (status === 'PROCESSING') {
    statusBadgeVariant = 'amber';
    StatusIcon = Cpu;
    statusText = 'Processing...';
  } else if (status === 'UPLOADED') {
    statusBadgeVariant = 'blue';
    StatusIcon = FileCheck;
    statusText = 'Uploaded';
  } else if (status === 'FAILED') {
    statusBadgeVariant = 'red';
    StatusIcon = AlertTriangle;
    statusText = 'Failed';
  } else if (status === 'REQUIRES_REVIEW') {
    statusBadgeVariant = 'amber';
    StatusIcon = AlertTriangle;
    statusText = 'Review Needed';
  }

  // Format file size
  const sizeBytes = document.size || document.sizeBytes || 0;
  const formattedSize =
    sizeBytes > 1024 * 1024
      ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;

  // Parse processing time if available
  let timingBreakdown: any = null;
  if (document.processingMs) {
    try {
      timingBreakdown =
        typeof document.processingMs === 'string'
          ? JSON.parse(document.processingMs)
          : document.processingMs;
    } catch {
      timingBreakdown = null;
    }
  }

  const fieldsCount = document.fields?.length || 0;

  return (
    <div
      style={{
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'border 0.2s ease',
      }}
    >
      {/* Top row: Icon, Name, and Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={18} color="#60a5fa" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={document.originalName}
            >
              {document.originalName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Type: <code style={{ color: 'var(--text-secondary)' }}>{document.documentType}</code> • {formattedSize}
            </div>
          </div>
        </div>

        <Badge variant={statusBadgeVariant}>
          <StatusIcon size={12} style={{ marginRight: '0.25rem' }} />
          {statusText}
        </Badge>
      </div>

      {/* Middle: Extracted info / timing */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          background: 'rgba(15, 23, 42, 0.4)',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Layers size={13} color="var(--text-secondary)" />
          <span>
            {fieldsCount > 0 ? (
              <strong style={{ color: 'var(--text-primary)' }}>{fieldsCount} fields extracted</strong>
            ) : status === 'PROCESSED' ? (
              <strong style={{ color: 'var(--text-primary)' }}>Extraction complete</strong>
            ) : (
              'Ready for OCR extraction'
            )}
          </span>
        </div>

        {timingBreakdown?.totalProcessingMs && (
          <span>{timingBreakdown.totalProcessingMs} ms</span>
        )}
      </div>

      {/* Bottom: Error / Retry state */}
      {status === 'FAILED' && onRetry && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onRetry(document.id)}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <RefreshCw size={12} />
            <span>Retry Processing</span>
          </button>
        </div>
      )}
    </div>
  );
};
