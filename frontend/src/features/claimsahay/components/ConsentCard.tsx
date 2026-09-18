import React, { useState } from 'react';
import {
  FileCheck2,
  Shield,
  ArrowRight,
  AlertCircle,
  UserCheck,
  Building2,
  Cpu,
  Check,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export interface ConsentCardProps {
  journeyId: string;
  onGrantConsent: (purposes: string[]) => Promise<void>;
  isSubmittingConsent: boolean;
  consentGranted: boolean;
  onBack?: () => void;
}

interface PurposeDefinition {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const CONSENT_PURPOSES: PurposeDefinition[] = [
  {
    id: 'DATA_PROCESSING',
    title: 'Personal & Hospital Claim Processing',
    description: 'Ingest and verify patient identity, admission dates, and hospital episode records.',
    icon: UserCheck,
  },
  {
    id: 'DOCUMENT_ANALYSIS',
    title: 'Document OCR & Evidence Extraction',
    description: 'Extract line-item hospital bills, room rent tariffs, and surgical diagnoses with AI.',
    icon: Cpu,
  },
  {
    id: 'POLICY_VERIFICATION',
    title: 'Policy Clause Reconciliation',
    description: 'Cross-reference hospital expenses against policy limits and exclusion schedules.',
    icon: Shield,
  },
  {
    id: 'EXTERNAL_SUBMISSION',
    title: 'Claim Resolution Packet Preparation',
    description: 'Compile an evidence packet for insurer submission with separate explicit confirmation.',
    icon: Building2,
  },
];

export const ConsentCard: React.FC<ConsentCardProps> = ({
  journeyId,
  onGrantConsent,
  isSubmittingConsent,
  consentGranted,
  onBack,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPurposes.length === 0) {
      setErrorMessage('Please select at least one purpose to continue.');
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
    <Card style={{ padding: '2rem' }}>
      {/* 17. Headline & Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#2563EB',
            }}
          >
            Permissions & Data Privacy
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>
            Before we continue
          </h2>
          <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            To assist with your claim reconciliation, we need your authorization to process your medical documents.
          </p>
        </div>

        <Badge variant={consentGranted ? 'green' : 'blue'}>
          {consentGranted ? 'Consent Granted' : 'Action Required'}
        </Badge>
      </div>

      {/* 3 Pillars: WHAT WE USE, WHY WE NEED IT, YOUR CONTROL (Light neutral panels #F8FAFC) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            background: '#F8FAFC',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '0.375rem' }}>
            What We Use
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.4, margin: 0 }}>
            Itemized hospital bills, discharge summaries, and your active health policy document.
          </p>
        </div>

        <div
          style={{
            background: '#F8FAFC',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '0.375rem' }}>
            Why We Need It
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.4, margin: 0 }}>
            To extract line items, identify insurer deductions, and cite exact policy clauses.
          </p>
        </div>

        <div
          style={{
            background: '#F8FAFC',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '0.375rem' }}>
            Your Control
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.4, margin: 0 }}>
            Your data is never shared without your separate explicit review and final approval.
          </p>
        </div>
      </div>

      {/* Checkbox Purposes */}
      <form onSubmit={handleSubmit}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.75rem' }}>
          Select Authorized Purposes:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
          {CONSENT_PURPOSES.map((purpose) => {
            const isChecked = selectedPurposes.includes(purpose.id);

            return (
              <div
                key={purpose.id}
                onClick={() => togglePurpose(purpose.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isChecked ? '#EFF6FF' : '#FFFFFF',
                  border: isChecked ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  cursor: consentGranted || isSubmittingConsent ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: isChecked ? '1px solid #2563EB' : '1px solid #CBD5E1',
                    background: isChecked ? '#2563EB' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                >
                  {isChecked && <Check size={13} color="#FFFFFF" />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                    {purpose.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.125rem' }}>
                    {purpose.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#DC2626',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CTA Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmittingConsent}
              className="btn btn-secondary"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSubmittingConsent || consentGranted || selectedPurposes.length === 0}
            className="btn btn-primary"
            style={{ minWidth: '160px', gap: '0.5rem' }}
          >
            {isSubmittingConsent ? (
              <>
                <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                <span>Authorizing...</span>
              </>
            ) : consentGranted ? (
              <>
                <Check size={16} />
                <span>Authorized</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </Card>
  );
};
