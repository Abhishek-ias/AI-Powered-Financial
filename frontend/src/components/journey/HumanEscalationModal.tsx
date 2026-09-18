import React, { useState } from 'react';
import {
  LifeBuoy,
  X,
  AlertTriangle,
  FileText,
  Shield,
  CheckCircle2,
  Send,
  User,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { journeysApi } from '../../api/journeys';
import { SupportCase } from '../../types';

export interface HumanEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  journeyId: string;
  unresolvedIssue?: string;
  goal?: string;
  onEscalationSuccess?: (supportCase: SupportCase) => void;
}

export const HumanEscalationModal: React.FC<HumanEscalationModalProps> = ({
  isOpen,
  onClose,
  journeyId,
  unresolvedIssue = 'Diagnosis discrepancy or room rent sub-limit deduction requiring human specialist intervention.',
  goal = 'Resolve hospital reimbursement claim dispute.',
  onEscalationSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [supportCase, setSupportCase] = useState<SupportCase | null>(null);

  if (!isOpen) return null;

  const handleEscalate = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await journeysApi.escalate(
        journeyId,
        'CUSTOMER_REQUESTED',
        unresolvedIssue
      );

      setSupportCase(res.supportCase);
      if (onEscalationSuccess) {
        onEscalationSuccess(res.supportCase);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit escalation to support queue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LifeBuoy size={18} color="#c084fc" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>
                Human Insurance Specialist Escalation
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Seamless handoff with comprehensive 15-field context packet
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                color: '#fca5a5',
                fontSize: '0.8125rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Success State */}
          {supportCase ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                }}
              >
                <CheckCircle2 size={24} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
                      Escalated to Human Specialist
                    </strong>
                    <Badge variant="green">Queue Status: {supportCase.status}</Badge>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Your entire claim history, evidence dossier, and unresolved issue analysis have been packaged and assigned to an insurance specialist.
                  </p>
                </div>
              </div>

              {/* Case Metadata */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Support Case ID:</div>
                  <div style={{ fontWeight: 600, color: '#93c5fd', fontFamily: 'monospace', marginTop: '0.125rem' }}>
                    {supportCase.id.slice(0, 14)}...
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Priority Level:</div>
                  <div style={{ fontWeight: 600, color: '#fbbf24', marginTop: '0.125rem' }}>
                    {supportCase.priority}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Next Step:</div>
                  <div style={{ fontWeight: 600, color: '#34d399', marginTop: '0.125rem' }}>
                    Specialist Review (Est. 2 hours)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-primary"
                  style={{ minWidth: '120px' }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Pre-Escalation Disclosure Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* 1. WHY ESCALATION IS NEEDED */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <AlertTriangle size={15} color="#fbbf24" />
                  <strong style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                    WHY ESCALATION IS NEEDED
                  </strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  The automated copilot identified a cross-document discrepancy or policy sub-limit question that requires human judgment. A licensed claims specialist will review the evidence without you needing to re-explain your situation.
                </p>
              </div>

              {/* 2. CURRENT UNRESOLVED ISSUE */}
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.875rem 1rem',
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Current Unresolved Issue
                </div>
                <div style={{ fontSize: '0.875rem', color: '#fca5a5', fontWeight: 500 }}>
                  {unresolvedIssue}
                </div>
              </div>

              {/* 3. WHAT INFORMATION WILL BE SHARED */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.875rem 1rem',
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  What Information Will Be Shared (15-Field Context Packet)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div>• Customer Goal & Domain</div>
                  <div>• Uploaded Documents & OCR Data</div>
                  <div>• Extracted Evidence Facts (26 items)</div>
                  <div>• Policy Clause Citations (Page 12)</div>
                  <div>• Validation Discrepancy Findings</div>
                  <div>• Complete Audit Timeline Log</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleEscalate}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    borderColor: '#8b5cf6',
                    fontSize: '0.8125rem',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                      <span>Packaging Context & Escalating...</span>
                    </>
                  ) : (
                    <>
                      <LifeBuoy size={14} />
                      <span>Escalate to Human Specialist</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
