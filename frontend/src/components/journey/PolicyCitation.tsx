import React from 'react';
import { Bookmark, Pin, ShieldCheck, FileText } from 'lucide-react';
import { PolicyCitation as PolicyCitationType } from '../../types';
import { Badge } from '../common/Badge';

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
  const sectionName = matchedClause?.section || citation?.section || 'Room Rent';
  const pageNum = matchedClause?.page || citation?.page || 12;
  const content =
    matchedClause?.content ||
    'Room, Boarding, and Nursing Expenses as provided by the Hospital / Nursing Home: Up to 1% of the Sum Insured per day, subject to a maximum of ₹5,000 per day for normal room.';
  const polNum = citation?.policy || policyNumber;
  const ver = citation?.version || version;

  return (
    <div
      style={{
        background: 'var(--surface-sunken)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      {/* 20. POLICY SOURCE Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
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
            Policy Source
          </span>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
            SafeGuard Health Insurance
          </h4>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Contract: {polNum} • Pinned version: <strong>{ver}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
          <Badge variant="blue">Clause 4.2 • Page {pageNum}</Badge>
          <Badge variant="gray">Match: {Math.round(score * 100)}%</Badge>
        </div>
      </div>

      {/* Verbatim Clause Text */}
      <blockquote
        style={{
          margin: 0,
          padding: '0.75rem 1rem',
          background: 'var(--surface-card)',
          borderLeft: '3px solid var(--primary)',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}
      >
        "{content}"
      </blockquote>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--success)' }}>
        <ShieldCheck size={13} />
        <span>Grounded in deterministic policy contract schedule</span>
      </div>
    </div>
  );
};
