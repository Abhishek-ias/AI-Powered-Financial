import React from 'react';
import {
  Compass,
  ArrowRight,
  AlertTriangle,
  FileCheck,
  Send,
  LifeBuoy,
  Scale,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { NextBestAction } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export interface NextBestActionCardProps {
  actions: NextBestAction[];
  onSelectAction?: (action: NextBestAction) => void;
}

export const NextBestActionCard: React.FC<NextBestActionCardProps> = ({
  actions,
  onSelectAction,
}) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  // Helper to format action button label and icon
  const getActionDetails = (actionName: string) => {
    switch (actionName) {
      case 'CORRECT_FIELD':
        return {
          label: 'Review & Correct Conflicting Field',
          icon: AlertTriangle,
          variant: 'amber' as const,
        };
      case 'REVIEW_POLICY':
        return {
          label: 'Examine Pinned Policy Clause',
          icon: Scale,
          variant: 'blue' as const,
        };
      case 'RESPOND_TO_INSURER':
        return {
          label: 'Draft Rebuttal / Evidence Packet',
          icon: Send,
          variant: 'green' as const,
        };
      case 'CONFIRM_CLAIM':
      case 'CONFIRM_AND_SUBMIT':
        return {
          label: 'Proceed to Consequential Confirmation',
          icon: CheckCircle2,
          variant: 'green' as const,
        };
      case 'ESCALATE_TO_HUMAN':
        return {
          label: 'Escalate to Insurance Specialist',
          icon: LifeBuoy,
          variant: 'purple' as const,
        };
      case 'UPLOAD_DOCUMENT':
        return {
          label: 'Upload Missing Document',
          icon: FileCheck,
          variant: 'blue' as const,
        };
      default:
        return {
          label: actionName.replace(/_/g, ' '),
          icon: ArrowRight,
          variant: 'blue' as const,
        };
    }
  };

  return (
    <Card
      glow
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(96, 165, 250, 0.4)',
        padding: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={18} color="#60a5fa" />
          <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Authoritative Next Best Actions ({actions.length})
          </h4>
        </div>

        <Badge variant="blue">Engine-Recommended</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {actions.map((act, idx) => {
          const { label, icon: ActionIcon, variant } = getActionDetails(act.action);
          const reasonText = act.reason || act.why || 'Recommended by ClaimSahay decision tree.';
          const isBlocking = act.blocking ?? false;
          const priority = act.priority || 'HIGH';

          return (
            <div
              key={idx}
              style={{
                background: isBlocking ? 'rgba(239, 68, 68, 0.08)' : 'rgba(30, 41, 59, 0.5)',
                border: isBlocking
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.9375rem', color: '#ffffff' }}>
                    {act.action.replace(/_/g, ' ')}
                  </strong>
                  <Badge variant={priority === 'HIGH' ? 'amber' : 'gray'}>
                    Priority: {priority}
                  </Badge>
                  {isBlocking && <Badge variant="red">Blocking</Badge>}
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {reasonText}
                </p>
              </div>

              {onSelectAction && (
                <button
                  type="button"
                  onClick={() => onSelectAction(act)}
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.8125rem',
                    padding: '0.5rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <ActionIcon size={14} />
                  <span>{label}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
