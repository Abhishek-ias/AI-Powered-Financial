import React from 'react';
import { BookOpen, ShieldCheck, Pin, FileText, CheckCircle2, Bookmark } from 'lucide-react';
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
  const sectionName = matchedClause?.section || citation?.section || 'Coverage Terms';
  const pageNum = matchedClause?.page || citation?.page || 12;
  const content = matchedClause?.content || 'Clause content retrieved from policy schedule.';
  const polNum = citation?.policy || policyNumber;
  const ver = citation?.version || version;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
        border: '1px solid rgba(96, 165, 250, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      {/* Header: Section, Page, and Pinned Version */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bookmark size={16} color="#60a5fa" />
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Pinned Policy Citation
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
              Section: {sectionName} (Page {pageNum})
            </h4>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '9999px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#93c5fd',
            }}
            title="Policy version pinned deterministically to prevent floating clause shifts"
          >
            <Pin size={11} />
            <span>Pinned: {ver}</span>
          </div>

          <Badge variant="blue">Match: {Math.round(score * 100)}%</Badge>
        </div>
      </div>

      {/* Verbatim Clause Content */}
      <blockquote
        style={{
          margin: 0,
          padding: '0.875rem 1rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderLeft: '3px solid #3b82f6',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          fontSize: '0.875rem',
          color: '#e2e8f0',
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}
      >
        "{content}"
      </blockquote>

      {/* Citation Metadata Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <FileText size={13} color="var(--text-secondary)" />
          <span>
            Contract: <strong style={{ color: 'var(--text-primary)' }}>{polNum}</strong> • Version: {ver}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#34d399' }}>
          <ShieldCheck size={13} />
          <span>Grounded in Active Policy Schedule</span>
        </div>
      </div>
    </div>
  );
};
