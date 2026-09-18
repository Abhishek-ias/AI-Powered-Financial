import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export interface ConfidenceBadgeProps {
  confidence: number; // 0.0 to 1.0 or 0 to 100
  showPercent?: boolean;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  showPercent = true,
  size = 'md',
}) => {
  // Normalize to 0-100 scale
  const score = confidence <= 1.0 ? Math.round(confidence * 100) : Math.round(confidence);

  let label = 'Low Confidence';
  let color = '#f87171';
  let bg = 'rgba(239, 68, 68, 0.15)';
  let border = 'rgba(239, 68, 68, 0.3)';
  let Icon = AlertCircle;

  if (score >= 90) {
    label = 'High Confidence';
    color = '#34d399';
    bg = 'rgba(16, 185, 129, 0.15)';
    border = 'rgba(16, 185, 129, 0.3)';
    Icon = CheckCircle2;
  } else if (score >= 70) {
    label = 'Good Confidence';
    color = '#60a5fa';
    bg = 'rgba(59, 130, 246, 0.15)';
    border = 'rgba(59, 130, 246, 0.3)';
    Icon = CheckCircle2;
  } else if (score >= 50) {
    label = 'Moderate Confidence';
    color = '#fbbf24';
    bg = 'rgba(245, 158, 11, 0.15)';
    border = 'rgba(245, 158, 11, 0.3)';
    Icon = AlertTriangle;
  }

  const isSmall = size === 'sm';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.25rem' : '0.375rem',
        padding: isSmall ? '0.125rem 0.375rem' : '0.25rem 0.625rem',
        borderRadius: '9999px',
        background: bg,
        border: `1px solid ${border}`,
        color: color,
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
      title={`AI Extraction Confidence: ${score}%`}
    >
      <Icon size={isSmall ? 11 : 13} color={color} />
      <span>{showPercent ? `${score}% ${label}` : label}</span>
    </div>
  );
};
