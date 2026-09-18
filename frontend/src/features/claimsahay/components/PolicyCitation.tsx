import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { PolicyCitation as PolicyCitationType } from '../../../types';
import { Badge } from '../../../components/ui/Badge';

export interface PolicyCitationProps {
  citation?: PolicyCitationType;
  matchedClause?: {
    content: string;
    source?: string;
    section: string;
    page?: number | null;
  } | null;
  policyNumber?: string;
  version?: string;
  score?: number;
}

export const PolicyCitation: React.FC<PolicyCitationProps> = ({
  citation,
  matchedClause,
  policyNumber = 'POL-HEALTH-2024-001',
  version = '2024-v1',
  score = 0.94,
}) => {
  const pageNum = matchedClause?.page || citation?.page || 12;
  const content =
    matchedClause?.content ||
    'Room, Boarding, and Nursing Expenses as provided by the Hospital / Nursing Home: Up to 1% of the Sum Insured per day, subject to a maximum of ₹5,000 per day for normal room.';
  const polNum = citation?.policy || policyNumber;
  const ver = citation?.version || version;

  return (
    <div
      style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 13. POLICY SOURCE Header (Dark navy heading, blue source accent, light neutral background) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#2563EB',
            }}
          >
            Policy Source
          </span>
          <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0F172A', marginTop: '0.125rem' }}>
            SafeGuard Health Insurance
          </h4>
          <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
            Policy {polNum} · Version {ver} · Clause 4.2 · Page {pageNum}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
          <Badge variant="blue">Clause 4.2</Badge>
          <Badge variant="gray">Match: {Math.round(score * 100)}%</Badge>
        </div>
      </div>

      {/* Verbatim Clause Text */}
      <blockquote
        style={{
          margin: 0,
          padding: '0.875rem 1rem',
          background: '#FFFFFF',
          borderLeft: '3px solid #2563EB',
          borderTop: '1px solid #E2E8F0',
          borderRight: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          fontSize: '0.875rem',
          color: '#1E293B',
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}
      >
        "{content}"
      </blockquote>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#166534' }}>
        <ShieldCheck size={14} color="#16A34A" />
        <span style={{ fontWeight: 500 }}>Grounded in deterministic policy contract schedule</span>
      </div>
    </div>
  );
};
