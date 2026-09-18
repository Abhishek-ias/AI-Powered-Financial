import React, { useState } from 'react';
import {
  FileCheck,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Send,
  FileText,
  Clock,
  Sparkles,
  Info,
  Scale,
  Hash,
  Activity,
  Layers,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Journey,
  EvidenceItem,
  DocumentItem,
  ValidationSummary,
  ReconciliationResult,
  ApprovalRequest,
  NextBestAction,
} from '../../types';

export interface ReviewApprovalCardProps {
  journey: Journey;
  documents: DocumentItem[];
  evidence: EvidenceItem[];
  validation: ValidationSummary | null;
  reconciliation: ReconciliationResult | null;
  nextActions: NextBestAction[];
  onConfirm: () => Promise<ApprovalRequest>;
  onApprove: (approvalId: string) => Promise<any>;
  onViewTimeline?: () => void;
  onEscalate?: () => void;
}

export const ReviewApprovalCard: React.FC<ReviewApprovalCardProps> = ({
  journey,
  documents,
  evidence,
  validation,
  reconciliation,
  nextActions,
  onConfirm,
  onApprove,
  onViewTimeline,
  onEscalate,
}) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [approval, setApproval] = useState<ApprovalRequest | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  // Status checks
  const isConfirmed = journey.status === 'USER_CONFIRMED' || !!approval;
  const isSubmitted =
    journey.status === 'SUBMITTED' ||
    journey.status === 'INSTITUTION_REVIEW' ||
    journey.status === 'COMPLETED' ||
    !!submissionResult;

  // Key evidence fields
  const keyEvidenceFields = [
    { key: 'hospital_name', label: 'Hospital Name' },
    { key: 'admission_date', label: 'Admission Date' },
    { key: 'discharge_date', label: 'Discharge Date' },
    { key: 'total_bill_amount', label: 'Total Billed Amount' },
    { key: 'room_rent_per_day', label: 'Room Rent / Day' },
    { key: 'diagnosis', label: 'Primary Diagnosis' },
  ];

  const getEvidenceValue = (key: string) => {
    const item = evidence.find((e) => e.fieldName === key);
    if (!item) return '—';
    if (key.includes('amount') || key.includes('rent')) {
      const num = parseFloat(item.value);
      return isNaN(num) ? item.value : `₹${num.toLocaleString('en-IN')}`;
    }
    return item.value;
  };

  const blockingIssues = validation?.blocking || [];
  const warningIssues = validation?.warnings || [];

  // Handle Step 1: Consequential Confirmation
  const handleConfirm = async () => {
    setIsConfirming(true);
    setError(null);
    setLoadingStep('Preparing your response & creating cryptographic approval...');

    try {
      const app = await onConfirm();
      setApproval(app);
    } catch (err: any) {
      setError(err.message || 'Failed to record confirmation with backend.');
    } finally {
      setIsConfirming(false);
      setLoadingStep('');
    }
  };

  // Handle Step 2: Final Approval & Submission Gate
  const handleApprove = async () => {
    if (!approval?.id) return;
    setIsApproving(true);
    setError(null);
    setLoadingStep('Submitting case to institution workflow (MOCK)...');

    try {
      const res = await onApprove(approval.id);
      setSubmissionResult(res);
      setLoadingStep('Updating status to INSTITUTION_REVIEW...');
    } catch (err: any) {
      setError(err.message || 'Failed to submit case to institution.');
    } finally {
      setIsApproving(false);
      setLoadingStep('');
    }
  };

  // If already submitted, display the authoritative Success State
  if (isSubmitted) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card
          glow
          style={{
            background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(52, 211, 153, 0.2)',
                border: '1px solid #34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={26} color="#34d399" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#ffffff' }}>
                  Submission Successful
                </h3>
                <Badge variant="green">Status: Under Review</Badge>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '9999px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#fbbf24',
                  }}
                >
                  Sandbox / Demo Simulation
                </span>
              </div>

              <p style={{ fontSize: '1rem', color: '#e2e8f0', lineHeight: 1.5, marginTop: '0.5rem' }}>
                <strong>Your case has been submitted for review.</strong>
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {submissionResult?.message ||
                  'The claim dispute dossier and structured evidence have been securely submitted to the insurer adjudication engine.'}
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.5rem' }}>
                {submissionResult?.safetyNote ||
                  'Safety Note: This is a MOCK submission. No real financial action has been taken.'}
              </p>
            </div>
          </div>

          {/* Submission Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Journey ID:</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', fontFamily: 'monospace', marginTop: '0.125rem' }}>
                {journey.id.slice(0, 16)}...
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Backend State:</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#34d399', marginTop: '0.125rem' }}>
                {journey.status === 'USER_CONFIRMED' ? 'INSTITUTION_REVIEW' : journey.status}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workflow Execution:</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#93c5fd', fontFamily: 'monospace', marginTop: '0.125rem' }}>
                {submissionResult?.workflow?.executionId || 'exec-mock-active'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next Step:</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
                Awaiting Insurer Adjudication Response
              </div>
            </div>
          </div>

          {/* Navigation CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Audit logged • Deterministic verification complete
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {onEscalate && (
                <button
                  type="button"
                  onClick={onEscalate}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Talk to Specialist
                </button>
              )}

              {onViewTimeline && (
                <button
                  type="button"
                  onClick={onViewTimeline}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}
                >
                  <Activity size={14} />
                  <span>Inspect Audit Timeline</span>
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <FileCheck size={16} color="#60a5fa" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-light)' }}>
              Stage 7 • Comprehensive Case Review & Consequential Approval
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Claim Dossier Review & Consequential Approval Gate
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Verify deterministic evidence against policy terms before triggering institutional submission.
          </p>
        </div>

        <Badge variant={blockingIssues.length > 0 ? 'red' : 'green'}>
          {blockingIssues.length > 0 ? `${blockingIssues.length} Blocking Issue` : 'Ready for Confirmation'}
        </Badge>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
          }}
        >
          <strong>Error: </strong>
          {error}
        </div>
      )}

      {/* 1. REVIEW SCREEN: Customer Goal & Case Metadata */}
      <Card
        style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid var(--border-subtle)',
          padding: '1.5rem',
        }}
      >
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Customer Goal & Journey Profile
        </div>
        <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#ffffff', marginBottom: '1rem' }}>
          "{journey.goal || 'Hospital reimbursement dispute and room rent sub-limit reconciliation.'}"
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Domain:</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
              {journey.domain} ({journey.journeyType})
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Active Status:</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fbbf24', marginTop: '0.125rem' }}>
              {journey.status}
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Policy Schedule:</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#93c5fd', marginTop: '0.125rem' }}>
              POL-HEALTH-2024-001 (v2024-v1)
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Documents Uploaded:</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#34d399', marginTop: '0.125rem' }}>
              {documents.length} Files ({documents.filter((d) => d.status === 'PROCESSED').length} Processed)
            </div>
          </div>
        </div>
      </Card>

      {/* 2. DUAL COLUMN: FACT/EVIDENCE vs AI EXPLANATION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Left: Deterministic Facts & Evidence */}
        <Card
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={16} color="#60a5fa" />
              <strong style={{ fontSize: '0.9375rem', color: '#ffffff' }}>
                FACT / EVIDENCE
              </strong>
            </div>
            <Badge variant="blue">Deterministic ({evidence.length} items)</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {keyEvidenceFields.map((field, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{field.label}:</span>
                <strong style={{ color: '#ffffff' }}>{getEvidenceValue(field.key)}</strong>
              </div>
            ))}
          </div>

          {/* Unresolved Issues Flagging */}
          {blockingIssues.length > 0 && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#fca5a5', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <AlertTriangle size={13} />
                <span>Detected Validation Discrepancy:</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                {blockingIssues[0].details || 'Diagnosis mismatch between Hospital Bill and Discharge Summary.'}
              </p>
            </div>
          )}
        </Card>

        {/* Right: AI Explanation & Policy Reconciler */}
        <Card
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#c084fc" />
              <strong style={{ fontSize: '0.9375rem', color: '#ffffff' }}>
                AI POLICY EXPLANATION
              </strong>
            </div>
            <Badge variant="purple">Grounded Reasoning</Badge>
          </div>

          <div
            style={{
              padding: '0.875rem 1rem',
              background: 'rgba(30, 41, 59, 0.4)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              minHeight: '120px',
            }}
          >
            {reconciliation?.explanation ||
              'Based on the SafeGuard Health Insurance Schedule (POL-HEALTH-2024-001, v2024-v1), room rent is subject to a daily sub-limit of ₹5,000. Billed rates above ₹5,000 (such as ₹7,500/day) generate a ₹2,500/day out-of-pocket variance.'}
          </div>

          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '0.75rem',
            }}
          >
            <div>
              Citation: <strong>Section: Room Rent (Page 12)</strong>
            </div>
            <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Shield size={12} />
              <span>Prompt Barrier Active</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. ACTION SUMMARY BEFORE SUBMISSION */}
      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid var(--border-subtle)',
          padding: '1.5rem',
        }}
      >
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Action Summary (Prepared for Insurer Submission)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.875rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACTION:</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>
              Submit Claim Assistance & Rebuttal Packet
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.875rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>WHY:</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Evidence cross-validation & policy clause reconciliation completed.
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.875rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>EVIDENCE:</div>
            <div style={{ fontSize: '0.875rem', color: '#93c5fd', marginTop: '0.25rem' }}>
              {documents.length} verified documents ({evidence.length} extracted facts)
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.875rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SOURCE:</div>
            <div style={{ fontSize: '0.875rem', color: '#a7f3d0', marginTop: '0.25rem' }}>
              SafeGuard Policy POL-HEALTH-2024-001 (v2024-v1)
            </div>
          </div>
        </div>

        {/* 4. TWO-STEP CONFIRMATION & APPROVAL GATE */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          {/* Step 1: When not yet confirmed */}
          {!isConfirmed && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Lock size={16} color="#60a5fa" />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                  Consequential Confirmation Required
                </h4>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Before submitting this claim case to the insurer workflow, review the details above.
                Clicking <strong>Review & Confirm</strong> will transition the journey state to <code>USER_CONFIRMED</code> and create a cryptographically hashed approval record.
              </p>

              {loadingStep && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#93c5fd', fontSize: '0.8125rem' }}>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#93c5fd' }} />
                  <span>{loadingStep}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                {onEscalate && (
                  <button
                    type="button"
                    onClick={onEscalate}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Escalate to Human
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px', justifyContent: 'center' }}
                >
                  {isConfirming ? (
                    <>
                      <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck size={16} />
                      <span>Review & Confirm</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: When Confirmed, Approval Record Displayed & Ready for Submission */}
          {isConfirmed && !isSubmitted && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <CheckCircle2 size={18} color="#34d399" />
                    <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#ffffff' }}>
                      Approval Request Created
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Your confirmation has been recorded. Final authorization is required to dispatch the case.
                  </p>
                </div>

                <Badge variant="blue">Status: PENDING_APPROVAL</Badge>
              </div>

              {/* Approval Metadata Record */}
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Action:</span>
                  <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '0.125rem' }}>
                    {approval?.action || 'SUBMIT_CLAIM'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Approval ID:</span>
                  <div style={{ fontWeight: 600, color: '#93c5fd', fontFamily: 'monospace', marginTop: '0.125rem' }}>
                    {approval?.id?.slice(0, 14) || 'appr-generated'}...
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Payload Hash:</span>
                  <div style={{ fontWeight: 600, color: '#fde047', fontFamily: 'monospace', marginTop: '0.125rem' }}>
                    {approval?.payloadHash?.slice(0, 16) || '5daf884b3c35...'}...
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Environment:</span>
                  <div style={{ fontWeight: 600, color: '#fbbf24', marginTop: '0.125rem' }}>
                    Sandbox / Demo
                  </div>
                </div>
              </div>

              {loadingStep && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#93c5fd', fontSize: '0.8125rem' }}>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#93c5fd' }} />
                  <span>{loadingStep}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ⚠️ Dispatches case to insurer workflow in simulated sandbox mode.
                </span>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    minWidth: '220px',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderColor: '#10b981',
                  }}
                >
                  {isApproving ? (
                    <>
                      <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                      <span>Submitting Case...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Confirm and Continue</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
