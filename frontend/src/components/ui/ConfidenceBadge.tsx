import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export interface ConfidenceBadgeProps {
  confidence: number;
  showPercent?: boolean;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  showPercent = true,
  size = 'md',
}) => {
  const score = confidence <= 1.0 ? Math.round(confidence * 100) : Math.round(confidence);

  let label = 'Low Confidence';
  let color = '#991B1B';
  let bg = '#FEE2E2';
  let border = '#FECACA';
  let Icon = AlertCircle;

  if (score >= 90) {
    label = 'High Confidence';
    color = '#166534';
    bg = '#DCFCE7';
    border = '#BBF7D0';
    Icon = CheckCircle2;
  } else if (score >= 70) {
    label = 'Good Confidence';
    color = '#075985';
    bg = '#E0F2FE';
    border = '#BAE6FD';
    Icon = CheckCircle2;
  } else if (score >= 50) {
    label = 'Moderate Confidence';
    color = '#92400E';
    bg = '#FEF3C7';
    border = '#FDE68A';
    Icon = AlertTriangle;
  }

  const isSmall = size === 'sm';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.25rem' : '0.375rem',
        padding: isSmall ? '0.15rem 0.45rem' : '0.2rem 0.6rem',
        borderRadius: '9999px',
        background: bg,
        border: `1px solid ${border}`,
        color: color,
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
      title={`Extraction Confidence: ${score}%`}
    >
      <Icon size={isSmall ? 11 : 13} color={color} />
      <span>{showPercent ? `${score}% ${label}` : label}</span>
    </div>
  );
};
