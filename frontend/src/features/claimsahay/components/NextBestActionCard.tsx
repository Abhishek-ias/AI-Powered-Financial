import React from 'react';
import {
  ArrowRight,
  LifeBuoy,
} from 'lucide-react';
import { NextBestAction } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export interface NextBestActionCardProps {
  actions: NextBestAction[];
  onSelectAction?: (action: NextBestAction) => void;
  onEscalate?: () => void;
}

export const NextBestActionCard: React.FC<NextBestActionCardProps> = ({
  actions,
  onSelectAction,
  onEscalate,
}) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  const primaryAction = actions[0];
  const otherActions = actions.slice(1);

  const formatActionName = (name: string) => {
    switch (name) {
      case 'CORRECT_FIELD':
        return 'Review room-rent evidence';
      case 'REVIEW_POLICY':
        return 'Examine pinned policy clause';
      case 'RESPOND_TO_INSURER':
        return 'Draft insurer appeal packet';
      case 'CONFIRM_CLAIM':
      case 'CONFIRM_AND_SUBMIT':
        return 'Review & confirm submission';
      case 'ESCALATE_TO_HUMAN':
        return 'Escalate to human specialist';
      case 'UPLOAD_DOCUMENT':
        return 'Upload missing documents';
      default:
        return name.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    }
  };

  const whyText =
    primaryAction.reason ||
    primaryAction.why ||
    'The available evidence exceeds the selected policy condition.';

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderTop: '3px solid var(--color-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Next Best Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-primary)',
          }}
        >
          Next Step
        </span>
        <Badge variant="gold">Recommended</Badge>
      </div>

      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
        {formatActionName(primaryAction.action)}
      </h4>

      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
        <strong>Why: </strong>{whyText}
      </p>

      {/* Primary and Secondary CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {onSelectAction && (
          <button
            type="button"
            onClick={() => onSelectAction(primaryAction)}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: '0.375rem' }}
          >
            <span>{formatActionName(primaryAction.action)}</span>
            <ArrowRight size={14} />
          </button>
        )}

        {onEscalate && (
          <button
            type="button"
            onClick={onEscalate}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
          >
            <LifeBuoy size={13} />
            <span>Escalate to human</span>
          </button>
        )}
      </div>

      {otherActions.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Alternative Actions:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.375rem' }}>
            {otherActions.map((act, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectAction && onSelectAction(act)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0.25rem 0',
                  color: 'var(--color-primary)',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 500,
                }}
              >
                <span>• {formatActionName(act.action)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
