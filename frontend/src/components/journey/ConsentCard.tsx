import React, { useState } from 'react';
import {
  FileCheck2,
  Shield,
  Lock,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  FileText,
  UserCheck,
  Building2,
  Cpu,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export interface ConsentCardProps {
  journeyId: string;
  onGrantConsent: (purposes: string[]) => Promise<void>;
  isSubmittingConsent: boolean;
  consentGranted: boolean;
  requirements?: any[];
}

interface PurposeDefinition {
  id: string;
  title: string;
  description: string;
  dataUsed: string;
  whyNeeded: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  defaultChecked: boolean;
}

const CONSENT_PURPOSES: PurposeDefinition[] = [
  {
    id: 'DATA_PROCESSING',
    title: 'Personal & Hospital Claim Processing',
    description: 'Authorize ClaimSahay to ingest and process patient demographic details, hospital name, and admission dates.',
    dataUsed: 'Patient name, admission/discharge timestamps, hospital identity, policy identifier.',
    whyNeeded: 'Required to match claim records with your hospital episode and insurer database.',
    icon: UserCheck,
    defaultChecked: true,
  },
  {
    id: 'DOCUMENT_ANALYSIS',
    title: 'AI Document OCR & Evidence Extraction',
    description: 'Authorize automated optical character recognition (OCR) and layout extraction across uploaded bills, discharge summaries, and prescriptions.',
    dataUsed: 'Itemized hospital bills, room rent breakdown, pharmacy receipts, surgical diagnosis.',
    whyNeeded: 'Extracts exact line-item amounts and medical diagnoses for evidence-backed verification.',
    icon: Cpu,
    defaultChecked: true,
  },
  {
    id: 'POLICY_VERIFICATION',
    title: 'Automated Policy Clause Reconciliation',
    description: 'Authorize cross-referencing your treatment diagnosis and bill items against Star Health Insurance policy limits and exclusion schedules.',
    dataUsed: 'Policy terms, room rent cappings, daycare procedure tables, co-payment clauses.',
    whyNeeded: 'Identifies erroneous insurer deductions and cites exact policy clauses supporting your claim.',
    icon: Shield,
    defaultChecked: true,
  },
  {
    id: 'EXTERNAL_SUBMISSION',
    title: 'Preparation of Insurer Resolution Packet',
    description: 'Authorize compilation of a structured appeal packet for submission to the insurer or TPA.',
    dataUsed: 'Structured evidence items, reconciliation table, and supporting document references.',
    whyNeeded: 'Assembles your formal claim dispute. Final transmission always requires your separate explicit confirmation.',
    icon: Building2,
    defaultChecked: true,
  },
];

export const ConsentCard: React.FC<ConsentCardProps> = ({
  journeyId,
  onGrantConsent,
  isSubmittingConsent,
  consentGranted,
  requirements = [],
}) => {
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(
    CONSENT_PURPOSES.map((p) => p.id)
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const togglePurpose = (id: string) => {
    if (consentGranted || isSubmittingConsent) return;
    if (selectedPurposes.includes(id)) {
      setSelectedPurposes(selectedPurposes.filter((p) => p !== id));
    } else {
      setSelectedPurposes([...selectedPurposes, id]);
    }
  };

  const handleSelectAll = () => {
    if (consentGranted || isSubmittingConsent) return;
    if (selectedPurposes.length === CONSENT_PURPOSES.length) {
      setSelectedPurposes([]);
    } else {
      setSelectedPurposes(CONSENT_PURPOSES.map((p) => p.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPurposes.length === 0) {
      setErrorMessage('Please grant at least one consent purpose to continue with your claim journey.');
      return;
    }
    setErrorMessage(null);
    try {
      await onGrantConsent(selectedPurposes);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record consent. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Card
        glow={!consentGranted}
        style={{
          border: consentGranted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-focus)',
          background: consentGranted ? 'rgba(6, 78, 59, 0.15)' : 'rgba(15, 23, 42, 0.85)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <FileCheck2 size={16} color={consentGranted ? '#34d399' : '#60a5fa'} />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: consentGranted ? 'var(--success)' : 'var(--primary-light)',
                }}
              >
                Stage 3 • Contextual Consent & Data Usage
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {consentGranted ? 'Explicit Consent Verified & Recorded' : 'Authorize Required Data Access for ClaimSahay'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              We believe in complete transparency. Review what data is accessed, why it is necessary, and grant explicit consent.
            </p>
          </div>

          <Badge variant={consentGranted ? 'green' : 'blue'}>
            {consentGranted ? 'Consent Granted' : 'Customer Consent Required'}
          </Badge>
        </div>

        {/* 3 Pillars of Transparency */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.875rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#60a5fa', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <Lock size={14} />
              <span>1. What Data Is Used</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Hospital bills, discharge summaries, surgical diagnoses, and your active health policy document.
            </p>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#34d399', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <Shield size={14} />
              <span>2. Why It Is Needed</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              To perform AI evidence extraction, check room rent sub-limits, and cite specific insurer policy clauses.
            </p>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#a78bfa', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <FileText size={14} />
              <span>3. Control & Safety</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Synthetic sandbox mode. No data is sold. Final claim submission always requires your final review.
            </p>
          </div>
        </div>

        {/* Consent Purposes Checklist */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Explicit Purpose Scopes ({selectedPurposes.length} of {CONSENT_PURPOSES.length} selected)
            </span>
            {!consentGranted && (
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={isSubmittingConsent}
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                {selectedPurposes.length === CONSENT_PURPOSES.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {CONSENT_PURPOSES.map((purpose) => {
              const isSelected = selectedPurposes.includes(purpose.id);
              const Icon = purpose.icon;

              return (
                <div
                  key={purpose.id}
                  onClick={() => togglePurpose(purpose.id)}
                  style={{
                    background: isSelected ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.4)',
                    border: isSelected ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: consentGranted ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '4px',
                      border: isSelected ? '2px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.2)',
                      background: isSelected ? '#3b82f6' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {isSelected && <CheckCircle2 size={16} color="#ffffff" />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Icon size={16} color={isSelected ? '#60a5fa' : 'var(--text-muted)'} />
                      <strong style={{ fontSize: '0.9375rem', color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                        {purpose.title}
                      </strong>
                      <code style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{purpose.id}</code>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {purpose.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Data: </strong>
                        {purpose.dataUsed}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Purpose: </strong>
                        {purpose.whyNeeded}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {errorMessage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '0.8125rem' }}>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {!consentGranted && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={selectedPurposes.length === 0 || isSubmittingConsent}
                className="btn btn-primary"
                style={{ minWidth: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isSubmittingConsent ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} />
                    <span>Recording Consent in Audit Log...</span>
                  </>
                ) : (
                  <>
                    <span>Grant Explicit Consent & Proceed</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </Card>

      {/* When Consent is Granted: Show Document Requirements Preview (Phase 4 Bridge) */}
      {consentGranted && (
        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.25) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} color="#34d399" />
              <div>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  Phase 3 Completed • Backend Document Requirements Generated
                </strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Consent recorded in backend audit log. Journey transitioned to <code>DOCUMENTS_PENDING</code>.
                </div>
              </div>
            </div>
            <Badge variant="green">Ready for Phase 4 (Document AI)</Badge>
          </div>

          {requirements && requirements.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Required Documents Checklist (Generated by Backend Engine):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.625rem' }}>
                {requirements.map((req, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {req.label || req.key}
                      </strong>
                      <Badge variant={req.priority === 'HIGH' ? 'amber' : 'gray'}>
                        {req.priority || 'REQUIRED'}
                      </Badge>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {req.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
