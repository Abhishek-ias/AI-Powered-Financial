import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  FileCheck2,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  UploadCloud,
  Cpu,
  Search,
  Scale,
  Compass,
  FileCheck,
  Activity,
  LifeBuoy,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { LoadingState } from '../components/common/LoadingState';
import { JourneyStepper } from '../components/journey/JourneyStepper';
import { GoalEntryCard } from '../components/journey/GoalEntryCard';
import { DynamicQuestionnaire } from '../components/journey/DynamicQuestionnaire';
import { ConsentCard } from '../components/journey/ConsentCard';
import { DocumentUploadSection } from '../components/journey/DocumentUploadSection';
import { EvidenceSection } from '../components/journey/EvidenceSection';
import { PolicyExplanationCard } from '../components/journey/PolicyExplanationCard';
import { ReviewApprovalCard } from '../components/journey/ReviewApprovalCard';
import { TimelineView } from '../components/journey/TimelineView';
import { HumanEscalationModal } from '../components/journey/HumanEscalationModal';
import { journeysApi } from '../api/journeys';
import {
  Journey,
  Question,
  JourneyStatus,
  DocumentItem,
  EvidenceItem,
  ValidationSummary,
  JourneyRequirement,
  ReconciliationResult,
  NextBestAction,
  ApprovalRequest,
} from '../types';

export interface ClaimSahayViewProps {
  initialGoal?: string;
  onResetGoal?: () => void;
  onNavigateToSupport?: () => void;
}

export const ClaimSahayView: React.FC<ClaimSahayViewProps> = ({
  initialGoal = '',
  onResetGoal,
  onNavigateToSupport,
}) => {
  // Journey state
  const [journey, setJourney] = useState<Journey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [intentResult, setIntentResult] = useState<any | null>(null);
  const [requirements, setRequirements] = useState<JourneyRequirement[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [reconciliation, setReconciliation] = useState<ReconciliationResult | null>(null);
  const [nextActions, setNextActions] = useState<NextBestAction[]>([]);

  // UI loading states
  const [isCreatingJourney, setIsCreatingJourney] = useState<boolean>(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);
  const [isSubmittingConsent, setIsSubmittingConsent] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReconciling, setIsReconciling] = useState<boolean>(false);

  // Error state
  const [apiError, setApiError] = useState<{ message: string; code?: string; details?: unknown } | null>(null);

  // Clipboard copy state
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Active view step
  const [viewStep, setViewStep] = useState<
    'goal' | 'questions' | 'consent' | 'documents' | 'evidence' | 'reconcile' | 'review' | 'timeline'
  >('goal');

  // Human Escalation Modal state
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState<boolean>(false);

  // Load requirements & documents when journey is active
  useEffect(() => {
    if (!journey?.id) return;

    // Fetch requirements if empty
    if (requirements.length === 0) {
      journeysApi
        .getRequirements(journey.id)
        .then((res) => {
          if (res.requirements && res.requirements.length > 0) {
            setRequirements(res.requirements);
          }
        })
        .catch(() => {});
    }

    // Fetch documents
    journeysApi
      .getDocuments(journey.id)
      .then((res) => {
        if (res.documents) {
          setDocuments(res.documents);
        }
      })
      .catch(() => {});

    // Fetch evidence if journey has already processed
    if (
      journey.status === 'VALIDATING' ||
      journey.status === 'NEEDS_ACTION' ||
      journey.status === 'READY_FOR_REVIEW' ||
      journey.status === 'USER_CONFIRMED'
    ) {
      journeysApi
        .getEvidence(journey.id)
        .then((res) => {
          if (res.evidence && res.evidence.length > 0) {
            setEvidence(res.evidence);
          }
        })
        .catch(() => {});

      journeysApi
        .getNextActions(journey.id)
        .then((res) => {
          if (res.nextActions) {
            setNextActions(res.nextActions);
          }
        })
        .catch(() => {});
    }
  }, [journey?.id, journey?.status]);

  // Auto-trigger initial policy reconciliation when entering Stage 5 (reconcile)
  useEffect(() => {
    if (journey?.id && viewStep === 'reconcile' && !reconciliation && !isReconciling) {
      handleReconcile(
        'ROOM_RENT_CAPPING',
        'Room rent sub-limit deduction: room tariff ₹7,500/day vs ₹5,000/day private room'
      );
    }
  }, [journey?.id, viewStep, reconciliation, isReconciling]);

  // Handle journey creation from goal
  const handleCreateJourney = async (goalMessage: string) => {
    setIsCreatingJourney(true);
    setApiError(null);

    try {
      const response = await journeysApi.createJourney({
        message: goalMessage,
        domain: 'INSURANCE',
        journeyType: 'HEALTH_INSURANCE_CLAIM',
        goal: goalMessage,
      });

      setJourney(response.journey);
      if (response.intent) {
        setIntentResult(response.intent);
      }
      if (response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
        setViewStep('questions');
      } else {
        try {
          const qRes = await journeysApi.getQuestions(response.journey.id);
          setQuestions(qRes.questions);
          setViewStep('questions');
        } catch {
          // If questions fetch fails, stay on created journey
        }
      }
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to analyze goal and initialize ClaimSahay journey.',
        code: err.code || 'CREATION_FAILED',
        details: err.details,
      });
    } finally {
      setIsCreatingJourney(false);
    }
  };

  // Handle answering a question
  const handleAnswerQuestion = async (questionId: string, answer: string): Promise<boolean> => {
    if (!journey) return false;
    setIsSubmittingAnswer(true);
    setApiError(null);

    try {
      const res = await journeysApi.answerQuestion(journey.id, questionId, answer);

      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, answer, status: 'ANSWERED' } : q))
      );

      if (res.journey) {
        setJourney(res.journey);
      }

      if (res.allRequiredAnswered) {
        setViewStep('consent');
        return true;
      }
      return false;
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to submit answer to question.',
        code: err.code || 'ANSWER_FAILED',
        details: err.details,
      });
      throw err;
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Handle granting consent
  const handleGrantConsent = async (purposes: string[]) => {
    if (!journey) return;
    setIsSubmittingConsent(true);
    setApiError(null);

    try {
      const res = await journeysApi.grantConsent(journey.id, purposes, 'HEALTH_CLAIM_RESOLUTION');

      // Refresh journey state from backend
      const refreshedJourney = await journeysApi.getJourney(journey.id);
      setJourney(refreshedJourney.journey);

      if (res.requirements && res.requirements.length > 0) {
        setRequirements(res.requirements);
      } else {
        const reqRes = await journeysApi.getRequirements(journey.id);
        setRequirements(reqRes.requirements);
      }

      // Advance to documents upload stage
      setViewStep('documents');
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to record consent in backend audit log.',
        code: err.code || 'CONSENT_FAILED',
        details: err.details,
      });
      throw err;
    } finally {
      setIsSubmittingConsent(false);
    }
  };

  // Handle uploading a document
  const handleUploadFile = async (file: File, documentType: string) => {
    if (!journey) return;
    setIsUploading(true);
    setApiError(null);

    try {
      await journeysApi.uploadDocument(journey.id, file, documentType);

      // Refresh documents list from backend
      const docsRes = await journeysApi.getDocuments(journey.id);
      setDocuments(docsRes.documents);
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to upload document to backend.',
        code: err.code || 'UPLOAD_FAILED',
        details: err.details,
      });
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle processing documents via Document AI pipeline
  const handleProcessDocuments = async () => {
    if (!journey) return;
    setIsProcessing(true);
    setApiError(null);

    try {
      const processRes = await journeysApi.processDocuments(journey.id);
      setValidation(processRes.validation);
      if (processRes.nextActions) {
        setNextActions(processRes.nextActions);
      }

      // Fetch newly extracted evidence
      const evidenceRes = await journeysApi.getEvidence(journey.id);
      setEvidence(evidenceRes.evidence);

      // Fetch refreshed documents with PROCESSED status & timings
      const docsRes = await journeysApi.getDocuments(journey.id);
      setDocuments(docsRes.documents);

      // Refresh journey authoritative state from backend
      const journeyRes = await journeysApi.getJourney(journey.id);
      setJourney(journeyRes.journey);

      // Advance view to Evidence & Validation section
      setViewStep('evidence');
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to execute Document AI pipeline.',
        code: err.code || 'PROCESSING_FAILED',
        details: err.details,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle policy clause reconciliation
  const handleReconcile = async (queryType: string, queryText: string) => {
    if (!journey) return;
    setIsReconciling(true);
    setApiError(null);

    try {
      const res = await journeysApi.reconcile(journey.id, {
        queryType,
        queryText,
        policyId: 'policy-001',
        policyVersion: '2024-v1',
      });
      setReconciliation(res);

      // Refresh next actions
      const actionsRes = await journeysApi.getNextActions(journey.id);
      if (actionsRes.nextActions) {
        setNextActions(actionsRes.nextActions);
      }

      // Refresh journey status from backend
      const jRes = await journeysApi.getJourney(journey.id);
      setJourney(jRes.journey);
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to execute policy clause reconciliation.',
        code: err.code || 'RECONCILE_FAILED',
        details: err.details,
      });
    } finally {
      setIsReconciling(false);
    }
  };

  // Handle Step 1: Confirmation gate
  const handleConfirmJourney = async (): Promise<ApprovalRequest> => {
    if (!journey) throw new Error('No active journey to confirm.');
    setApiError(null);
    try {
      const res = await journeysApi.confirmJourney(journey.id);
      const refreshed = await journeysApi.getJourney(journey.id);
      setJourney(refreshed.journey);
      return res.approval;
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to record confirmation with backend.',
        code: err.code || 'CONFIRM_FAILED',
        details: err.details,
      });
      throw err;
    }
  };

  // Handle Step 2: Approval & Submission
  const handleApproveAction = async (approvalId: string) => {
    if (!journey) throw new Error('No active journey to approve.');
    setApiError(null);
    try {
      const res = await journeysApi.approveAction(journey.id, { approvalId, approved: true });
      const refreshed = await journeysApi.getJourney(journey.id);
      setJourney(refreshed.journey);
      return res;
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to submit approved case.',
        code: err.code || 'APPROVE_FAILED',
        details: err.details,
      });
      throw err;
    }
  };

  // Reset current journey
  const handleResetJourney = () => {
    setJourney(null);
    setQuestions([]);
    setIntentResult(null);
    setRequirements([]);
    setDocuments([]);
    setEvidence([]);
    setValidation(null);
    setReconciliation(null);
    setNextActions([]);
    setViewStep('goal');
    setApiError(null);
    if (onResetGoal) onResetGoal();
  };

  const copyJourneyId = () => {
    if (!journey?.id) return;
    navigator.clipboard.writeText(journey.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const currentStatus: JourneyStatus = journey?.status || 'CREATED';
  const allRequiredDone =
    questions.length > 0 &&
    questions.filter((q) => q.required ?? q.isRequired ?? true).every((q) => q.status === 'ANSWERED');
  const isConsentGranted =
    journey?.consentState === 'GRANTED' ||
    (journey?.status !== 'CONSENT_PENDING' &&
      journey?.status !== 'QUESTIONS_PENDING' &&
      journey?.status !== 'CREATED' &&
      journey?.status !== 'GOAL_IDENTIFIED');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Global Error Alert */}
      {apiError && (
        <ErrorBanner
          title={`Error Encountered (${apiError.code || 'API_ERROR'})`}
          message={apiError.message}
          details={apiError.details}
          onDismiss={() => setApiError(null)}
        />
      )}

      {/* Journey Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Shield size={20} color="#3b82f6" />
              <strong style={{ fontSize: '1.125rem', color: '#ffffff' }}>ClaimSahay</strong>
            </div>
            <Badge variant="blue">Domain: Insurance</Badge>
            <Badge
              variant={
                currentStatus === 'DOCUMENTS_PENDING' || currentStatus === 'READY_FOR_REVIEW'
                  ? 'green'
                  : currentStatus === 'NEEDS_ACTION'
                  ? 'red'
                  : 'amber'
              }
            >
              Status: {currentStatus}
            </Badge>
            {journey && (
              <button
                onClick={copyJourneyId}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.25rem 0.5rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  cursor: 'pointer',
                }}
                title="Click to copy journey ID"
              >
                <code>ID: {journey.id.slice(0, 8)}...</code>
                {copiedId ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
              </button>
            )}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' }}>
            Evidence-Backed Insurance Claim Settlement
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '750px' }}>
            {journey?.goal ||
              initialGoal ||
              'Guided resolution of hospital reimbursement queries, pre-auth rejections, and room rent capping disputes.'}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {journey && (
            <button
              type="button"
              onClick={() => setIsEscalateModalOpen(true)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8125rem',
                padding: '0.5rem 0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: '#c084fc',
                borderColor: 'rgba(192, 132, 252, 0.4)',
              }}
            >
              <LifeBuoy size={14} />
              <span>Talk to Specialist</span>
            </button>
          )}

          {journey && (
            <button
              onClick={handleResetJourney}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <RotateCcw size={14} />
              <span>Start New Journey</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Milestone Stepper */}
      <JourneyStepper
        status={currentStatus}
        allQuestionsAnswered={allRequiredDone}
        consentGranted={isConsentGranted}
      />

      {/* Stage Navigation Tabs (When Journey is Active) */}
      {journey && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(15, 23, 42, 0.5)',
            padding: '0.375rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflowX: 'auto',
            width: 'fit-content',
            maxWidth: '100%',
          }}
        >
          <button
            onClick={() => setViewStep('goal')}
            style={{
              background: viewStep === 'goal' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              border: viewStep === 'goal' ? '1px solid #3b82f6' : 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.375rem 0.75rem',
              color: viewStep === 'goal' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={14} />
            <span>1. Goal</span>
          </button>

          <button
            onClick={() => setViewStep('questions')}
            style={{
              background: viewStep === 'questions' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              border: viewStep === 'questions' ? '1px solid #3b82f6' : 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.375rem 0.75rem',
              color: viewStep === 'questions' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
            }}
          >
            <HelpCircle size={14} />
            <span>2. Questions</span>
          </button>

          <button
            onClick={() => setViewStep('consent')}
            style={{
              background: viewStep === 'consent' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              border: viewStep === 'consent' ? '1px solid #3b82f6' : 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.375rem 0.75rem',
              color: viewStep === 'consent' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
            }}
          >
            <FileCheck2 size={14} />
            <span>3. Consent</span>
          </button>

          <button
            onClick={() => setViewStep('documents')}
            style={{
              background: viewStep === 'documents' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              border: viewStep === 'documents' ? '1px solid #3b82f6' : 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.375rem 0.75rem',
              color: viewStep === 'documents' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
            }}
          >
            <UploadCloud size={14} />
            <span>4. Documents ({documents.length})</span>
          </button>

          {evidence.length > 0 && (
            <button
              onClick={() => setViewStep('evidence')}
              style={{
                background: viewStep === 'evidence' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: viewStep === 'evidence' ? '1px solid #3b82f6' : 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.375rem 0.75rem',
                color: viewStep === 'evidence' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Search size={14} />
              <span>5. Evidence & Conflicts ({evidence.length})</span>
            </button>
          )}

          {evidence.length > 0 && (
            <button
              onClick={() => setViewStep('reconcile')}
              style={{
                background: viewStep === 'reconcile' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: viewStep === 'reconcile' ? '1px solid #3b82f6' : 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.375rem 0.75rem',
                color: viewStep === 'reconcile' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Scale size={14} />
              <span>6. Policy Citation & Explanation</span>
            </button>
          )}

          {evidence.length > 0 && (
            <button
              onClick={() => setViewStep('review')}
              style={{
                background: viewStep === 'review' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: viewStep === 'review' ? '1px solid #3b82f6' : 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.375rem 0.75rem',
                color: viewStep === 'review' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                whiteSpace: 'nowrap',
              }}
            >
              <FileCheck size={14} />
              <span>7. Review & Submit</span>
            </button>
          )}

          {journey && (
            <button
              onClick={() => setViewStep('timeline')}
              style={{
                background: viewStep === 'timeline' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: viewStep === 'timeline' ? '1px solid #3b82f6' : 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.375rem 0.75rem',
                color: viewStep === 'timeline' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Activity size={14} />
              <span>8. Audit Timeline</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Goal View */}
      {!journey && (
        <GoalEntryCard
          initialGoal={initialGoal}
          onSubmitGoal={handleCreateJourney}
          isSubmitting={isCreatingJourney}
          intentResult={intentResult}
        />
      )}

      {journey && viewStep === 'goal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <GoalEntryCard
            initialGoal={journey.goal}
            onSubmitGoal={handleCreateJourney}
            isSubmitting={isCreatingJourney}
            intentResult={intentResult}
            disabled={true}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setViewStep('questions')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Continue to Questionnaire</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Questions View */}
      {journey && viewStep === 'questions' && (
        <DynamicQuestionnaire
          journeyId={journey.id}
          questions={questions}
          onAnswerQuestion={handleAnswerQuestion}
          onAllCompleted={() => setViewStep('consent')}
          isSubmittingAnswer={isSubmittingAnswer}
        />
      )}

      {/* 3. Consent View */}
      {journey && viewStep === 'consent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ConsentCard
            journeyId={journey.id}
            onGrantConsent={handleGrantConsent}
            isSubmittingConsent={isSubmittingConsent}
            consentGranted={isConsentGranted}
            requirements={requirements}
          />

          {isConsentGranted && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setViewStep('documents')}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>Proceed to Document Upload</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. Document Upload View */}
      {journey && viewStep === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <DocumentUploadSection
            journeyId={journey.id}
            requirements={requirements}
            documents={documents}
            onUploadFile={handleUploadFile}
            onProcessDocuments={handleProcessDocuments}
            isUploading={isUploading}
            isProcessing={isProcessing}
            hasConsented={isConsentGranted}
          />

          {evidence.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setViewStep('evidence')}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>View Extracted Evidence & Conflicts ({evidence.length})</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Evidence & Conflicts View */}
      {journey && viewStep === 'evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <EvidenceSection
            evidence={evidence}
            validation={validation}
            totalDocuments={documents.length}
            processedDocuments={documents.filter((d) => d.status === 'PROCESSED').length}
            onNavigateToUpload={() => setViewStep('documents')}
            onEscalate={onNavigateToSupport}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              onClick={() => setViewStep('documents')}
              className="btn btn-secondary"
            >
              Upload Additional Documents
            </button>

            <button
              onClick={() => setViewStep('reconcile')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Examine Policy Citations & Grounded Reasoning</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 6. Policy & Explanation View (Phase 5) */}
      {journey && viewStep === 'reconcile' && (
        <PolicyExplanationCard
          journeyId={journey.id}
          reconciliation={reconciliation}
          nextActions={nextActions}
          onReconcile={handleReconcile}
          isReconciling={isReconciling}
          onEscalateToHuman={() => setIsEscalateModalOpen(true)}
          onProceedToReview={() => setViewStep('review')}
        />
      )}

      {/* 7. Review & Consequential Approval View (Phase 6) */}
      {journey && viewStep === 'review' && (
        <ReviewApprovalCard
          journey={journey}
          documents={documents}
          evidence={evidence}
          validation={validation}
          reconciliation={reconciliation}
          nextActions={nextActions}
          onConfirm={handleConfirmJourney}
          onApprove={handleApproveAction}
          onViewTimeline={() => setViewStep('timeline')}
          onEscalate={() => setIsEscalateModalOpen(true)}
        />
      )}

      {/* 8. Audit Timeline & Authoritative Status View (Phase 6) */}
      {journey && viewStep === 'timeline' && (
        <TimelineView
          journeyId={journey.id}
          status={journey.status}
          onEscalate={() => setIsEscalateModalOpen(true)}
          onRefreshJourney={async () => {
            const refreshed = await journeysApi.getJourney(journey.id);
            setJourney(refreshed.journey);
          }}
        />
      )}

      {/* Human Specialist Escalation Modal (Phase 6) */}
      {journey && (
        <HumanEscalationModal
          isOpen={isEscalateModalOpen}
          onClose={() => setIsEscalateModalOpen(false)}
          journeyId={journey.id}
          goal={journey.goal}
          unresolvedIssue={
            validation?.blocking[0]?.details ||
            reconciliation?.conflict?.description ||
            'Cross-document validation discrepancy or room rent sub-limit capping requiring specialist intervention.'
          }
          onEscalationSuccess={async () => {
            const refreshed = await journeysApi.getJourney(journey.id);
            setJourney(refreshed.journey);
          }}
        />
      )}
    </div>
  );
};
