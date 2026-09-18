import React, { useState } from 'react';
import {
  Search,
  Filter,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Scale,
  Sparkles,
} from 'lucide-react';
import { EvidenceItem, ValidationSummary } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EvidenceCard } from './EvidenceCard';
import { ValidationSummaryCard } from './ValidationSummaryCard';

export interface EvidenceSectionProps {
  evidence: EvidenceItem[];
  validation: ValidationSummary | null;
  totalDocuments: number;
  processedDocuments: number;
  onNavigateToUpload?: () => void;
  onEscalate?: () => void;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  evidence,
  validation,
  totalDocuments,
  processedDocuments,
  onNavigateToUpload,
  onEscalate,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  // Filter evidence
  const filteredEvidence = evidence.filter((item) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fieldMatch = item.fieldName.toLowerCase().includes(q);
      const valMatch = item.value.toLowerCase().includes(q);
      const typeMatch = item.factType.toLowerCase().includes(q);
      if (!fieldMatch && !valMatch && !typeMatch) return false;
    }

    // Status filter
    if (statusFilter === 'FLAGGED') {
      if (item.status === 'VALID') return false;
    } else if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }

    // Source filter
    if (sourceFilter !== 'ALL' && item.factType !== sourceFilter) {
      return false;
    }

    return true;
  });

  // Unique sources for filter
  const uniqueSources = Array.from(new Set(evidence.map((e) => e.factType)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Layers size={16} color="#60a5fa" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-light)' }}>
              Stage 5 • Provenance & Evidence Verification
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Structured Claim Evidence & Cross-Check Results
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Extracted facts linked directly to source document pages with AI confidence provenance.
          </p>
        </div>

        <Badge variant="blue">
          {evidence.length} Extracted Facts Verified
        </Badge>
      </div>

      {/* Validation Summary & Conflict Warnings */}
      {validation && (
        <ValidationSummaryCard
          validation={validation}
          totalDocuments={totalDocuments}
          processedDocuments={processedDocuments}
          totalEvidenceCount={evidence.length}
          onNavigateToUpload={onNavigateToUpload}
          onEscalate={onEscalate}
        />
      )}

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFFFF',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Search Box */}
        <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fields (e.g. room rent, diagnosis)..."
            style={{
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.375rem 0.75rem 0.375rem 2.25rem',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
            Status:
          </span>
          {['ALL', 'FLAGGED', 'VALID'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? '#EFF6FF' : '#FFFFFF',
                border: statusFilter === st ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                borderRadius: 'var(--radius-sm)',
                padding: '0.25rem 0.625rem',
                color: statusFilter === st ? '#2563EB' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Source Filter Dropdown */}
        {uniqueSources.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem',
                outline: 'none',
              }}
            >
              <option value="ALL">All Documents</option>
              {uniqueSources.map((src) => (
                <option key={src} value={src}>
                  {src.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Evidence Cards Grid */}
      {filteredEvidence.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.875rem' }}>
          {filteredEvidence.map((item) => (
            <EvidenceCard key={item.id} evidence={item} />
          ))}
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            No evidence matches the selected filter criteria.
          </p>
        </Card>
      )}
    </div>
  );
};
