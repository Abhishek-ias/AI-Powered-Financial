import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  details?: unknown;
  severity?: 'error' | 'warning' | 'info';
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  details,
  severity = 'error',
}) => {
  const bg =
    severity === 'error'
      ? 'var(--danger-bg)'
      : severity === 'warning'
      ? 'var(--warning-bg)'
      : 'var(--info-bg)';
  const border =
    severity === 'error'
      ? 'var(--danger-border)'
      : severity === 'warning'
      ? 'var(--warning-border)'
      : 'var(--info-border)';
  const color =
    severity === 'error'
      ? 'var(--danger-text)'
      : severity === 'warning'
      ? 'var(--warning-text)'
      : 'var(--info-text)';

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
        margin: '1rem 0',
      }}
    >
      <AlertTriangle size={20} style={{ color, flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ color, fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          {title}
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary"
          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};
