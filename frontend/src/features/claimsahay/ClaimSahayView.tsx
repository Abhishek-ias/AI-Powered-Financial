import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  LifeBuoy,
  Copy,
  Check,
  ArrowRight,
  Shield,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { JourneyStepper } from './components/JourneyStepper';
import { GoalEntryCard } from './components/GoalEntryCard';
import { DynamicQuestionnaire } from './components/DynamicQuestionnaire';
import { ConsentCard } from './components/ConsentCard';
import { DocumentUploadSection } from './components/DocumentUploadSection';
import { EvidenceSection } from './components/EvidenceSection';
import { PolicyExplanationCard } from './components/PolicyExplanationCard';
import { ReviewApprovalCard } from './components/ReviewApprovalCard';
import { TimelineView } from './components/TimelineView';
import { NextBestActionCard } from './components/NextBestActionCard';
import { HumanEscalationModal } from './components/HumanEscalationModal';
import { journeysApi } from '../../api/journeys';
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
} from '../../types';

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
  const [apiError, setApiError] = useState<{ message: string; details?: unknown } | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Active view step: goal | questions | consent | documents | evidence | reconcile | review | timeline
  const [viewStep, setViewStep] = useState<string>('goal');

  // Human Escalation Modal state
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState<boolean>(false);

  // Load requirements & documents when journey is active
  useEffect(() => {
    if (!journey?.id) return;

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

    journeysApi
      .getDocuments(journey.id)
      .then((res) => {
        if (res.documents) {
          setDocuments(res.documents);
        }
      })
      .catch(() => {});

    if (
      journey.status === 'VALIDATING' ||
      journey.status === 'NEEDS_ACTION' ||
      journey.status === 'READY_FOR_REVIEW' ||
      journey.status === 'USER_CONFIRMED' ||
      journey.status === 'INSTITUTION_REVIEW'
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

  // Handle Goal Submission & Journey Creation
  const handleStartJourney = async (goalText: string) => {
    setIsCreatingJourney(true);
    setApiError(null);

    try {
      const journeyRes = await journeysApi.createJourney({
        goal: goalText,
        message: goalText,
        domain: 'INSURANCE',
        journeyType: 'HEALTH_INSURANCE_CLAIM',
      });

      setJourney(journeyRes.journey);
      setIntentResult(
        journeyRes.intent || {
          domain: 'INSURANCE',
          journeyType: 'HEALTH_INSURANCE_CLAIM',
          goal: goalText,
          confidence: 0.95,
        }
      );

      if (journeyRes.questions && journeyRes.questions.length > 0) {
        setQuestions(journeyRes.questions);
        setViewStep('questions');
      } else {
        setViewStep('consent');
      }
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to initialize ClaimSahay journey with backend.',
      });
    } finally {
      setIsCreatingJourney(false);
    }
  };

  // Handle Question Answering
  const handleAnswerQuestion = async (questionId: string, answer: string): Promise<boolean> => {
    if (!journey) return false;
    setIsSubmittingAnswer(true);
    setApiError(null);

    try {
      await journeysApi.answerQuestion(journey.id, questionId, answer);
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, answer, status: 'ANSWERED' } : q))
      );

      const jRes = await journeysApi.getJourney(journey.id);
      setJourney(jRes.journey);

      const allDone = jRes.journey.status !== 'QUESTIONS_PENDING';
      if (allDone) {
        setViewStep('consent');
      }
      return allDone;
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to submit question answer.',
      });
      throw err;
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Handle Consent
  const handleGrantConsent = async (purposes: string[]) => {
    if (!journey) return;
    setIsSubmittingConsent(true);
    setApiError(null);

    try {
      const res = await journeysApi.grantConsent(journey.id, purposes);
      if (res.requirements && res.requirements.length > 0) {
        setRequirements(res.requirements);
      }

      const jRes = await journeysApi.getJourney(journey.id);
      setJourney(jRes.journey);
      setViewStep('documents');
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to record consent.',
      });
      throw err;
    } finally {
      setIsSubmittingConsent(false);
    }
  };

  // Handle Document Upload
  const handleUploadFile = async (file: File, documentType: string) => {
    if (!journey) return;
    setIsUploading(true);
    setApiError(null);

    try {
      await journeysApi.uploadDocument(journey.id, file, documentType);
      const docsRes = await journeysApi.getDocuments(journey.id);
      if (docsRes.documents) {
        setDocuments(docsRes.documents);
      }
      const jRes = await journeysApi.getJourney(journey.id);
      setJourney(jRes.journey);
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to upload document file.',
      });
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Process Documents
  const handleProcessDocuments = async () => {
    if (!journey) return;
    setIsProcessing(true);
    setApiError(null);

    try {
      const res = await journeysApi.processDocuments(journey.id);
      const jRes = await journeysApi.getJourney(journey.id);
      setJourney(jRes.journey);

      const evRes = await journeysApi.getEvidence(journey.id);
      if (evRes.evidence) setEvidence(evRes.evidence);
      if (res.validation) setValidation(res.validation);
      if (res.nextActions) setNextActions(res.nextActions);

      const docsRes = await journeysApi.getDocuments(journey.id);
      if (docsRes.documents) setDocuments(docsRes.documents);

      setViewStep('evidence');
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to run document processing pipeline.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reconcile
  const handleReconcile = async (queryType: string, queryText: string) => {
    if (!journey) return;
    setIsReconciling(true);
    setApiError(null);

    try {
      const res = await journeysApi.reconcile(journey.id, {
        queryType,
        queryText,
        policyId: 'POL-HEALTH-2024-001',
        policyVersion: '2024-v1',
      });
      setReconciliation(res);

      const jRes = await journeysApi.getJourney(journey.id);
      setJourney(jRes.journey);

      if (res.nextAction) {
        setNextActions([{ action: res.nextAction, reason: res.explanation }]);
      }
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to reconcile claim against policy schedule.',
      });
    } finally {
      setIsReconciling(false);
    }
  };

  // Handle Consequential Confirmation
  const handleConfirm = async (): Promise<ApprovalRequest> => {
    if (!journey) throw new Error('No active journey');
    setApiError(null);

    try {
      const res = await journeysApi.confirmJourney(journey.id);
      const jRes = await journeysApi.getJourney(journey.id);
      setJourney(jRes.journey);
      return res.approval;
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to record consequential confirmation.',
      });
      throw err;
    }
  };

  // Handle Approval Gate Submission
  const handleApprove = async (approvalId: string) => {
    if (!journey) throw new Error('No active journey');
    setApiError(null);

    try {
      const res = await journeysApi.approveAction(journey.id, { approvalId, approved: true });
      const jRes = await journeysApi.getJourney(journey.id);
      setJourney(jRes.journey);
      return res;
    } catch (err: any) {
      setApiError({
        message: err.message || 'Failed to complete approval dispatch.',
      });
      throw err;
    }
  };

  // Handle Next Best Action selection
  const handleSelectNextAction = (action: NextBestAction) => {
    if (action.action === 'ESCALATE_TO_HUMAN') {
      setIsEscalateModalOpen(true);
      return;
    }
    if (action.action === 'CORRECT_FIELD' || action.action === 'REVIEW_EVIDENCE') {
      setViewStep('evidence');
      return;
    }
    if (action.action === 'REVIEW_POLICY' || action.action === 'RESPOND_TO_INSURER') {
      setViewStep('reconcile');
      return;
    }
    if (action.action === 'CONFIRM_CLAIM' || action.action === 'CONFIRM_AND_SUBMIT') {
      setViewStep('review');
      return;
    }
    if (action.action === 'UPLOAD_DOCUMENT') {
      setViewStep('documents');
      return;
    }
    setViewStep('reconcile');
  };

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
    if (onResetGoal) onResetGoal();
  };

  const copyJourneyId = () => {
    if (!journey?.id) return;
    navigator.clipboard.writeText(journey.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const currentStatus: JourneyStatus = journey ? journey.status : 'CREATED';
  const allRequiredQuestions = questions.filter((q) => q.required ?? q.isRequired ?? true);
  const answeredRequired = allRequiredQuestions.filter((q) => q.status === 'ANSWERED');
  const allRequiredDone = allRequiredQuestions.length > 0 && answeredRequired.length === allRequiredQuestions.length;
  const isConsentGranted =
    currentStatus === 'DOCUMENTS_PENDING' ||
    currentStatus === 'DOCUMENT_PROCESSING' ||
    currentStatus === 'VALIDATING' ||
    currentStatus === 'NEEDS_ACTION' ||
    currentStatus === 'READY_FOR_REVIEW' ||
    currentStatus === 'USER_CONFIRMED' ||
    currentStatus === 'ACTION_PENDING' ||
    currentStatus === 'SUBMITTED' ||
    currentStatus === 'INSTITUTION_REVIEW' ||
    currentStatus === 'COMPLETED';

  // Customer-friendly status label
  const getDisplayStatus = (st: JourneyStatus) => {
    switch (st) {
      case 'INSTITUTION_REVIEW':
        return { label: 'Under review', variant: 'blue' as const, note: 'Submitted for review to insurer adjudication.' };
      case 'SUBMITTED':
        return { label: 'Submitted', variant: 'green' as const, note: 'Case packet successfully dispatched.' };
      case 'NEEDS_ACTION':
        return { label: 'Needs attention', variant: 'amber' as const, note: 'Hospital tariff exceeds policy limit.' };
      case 'READY_FOR_REVIEW':
        return { label: 'Ready for review', variant: 'blue' as const, note: 'Evidence verified and reconciled.' };
      case 'USER_CONFIRMED':
        return { label: 'Confirmed by you', variant: 'green' as const, note: 'Approval record created.' };
      case 'DOCUMENT_PROCESSING':
        return { label: 'Processing', variant: 'amber' as const, note: 'Running document OCR and fact extraction.' };
      case 'DOCUMENTS_PENDING':
        return { label: 'Documents required', variant: 'blue' as const, note: 'Upload hospital bill & discharge summary.' };
      case 'CONSENT_PENDING':
        return { label: 'Consent required', variant: 'blue' as const, note: 'Authorize medical document processing.' };
      case 'QUESTIONS_PENDING':
        return { label: 'In progress', variant: 'blue' as const, note: 'Answer clarification questions.' };
      default:
        return { label: 'Active', variant: 'blue' as const, note: 'Exploring claim assistance.' };
    }
  };

  const statusInfo = getDisplayStatus(currentStatus);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 9. HEADER: ClaimSahay Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              ClaimSahay
            </h1>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>• Insurance claim assistance</span>
            {journey && (
              <Badge variant={statusInfo.variant}>
                ● {statusInfo.label}
              </Badge>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, maxWidth: '720px' }}>
            {journey?.goal ||
              initialGoal ||
              'Guided resolution of hospital reimbursement queries, pre-auth rejections, and room rent capping disputes.'}
          </p>
        </div>

        {/* Header Secondary Actions */}
        {journey && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIsEscalateModalOpen(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', gap: '0.375rem' }}
            >
              <LifeBuoy size={14} color="var(--primary)" />
              <span>Specialist Help</span>
            </button>

            <button
              onClick={handleResetJourney}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', gap: '0.375rem' }}
            >
              <RotateCcw size={13} />
              <span>New Journey</span>
            </button>
          </div>
        )}
      </div>

      {/* Global API Error Banner */}
      {apiError && (
        <ErrorBanner
          message={apiError.message}
          onDismiss={() => setApiError(null)}
        />
      )}

      {/* 9. PROGRESS: Visual Milestone Stepper (Active during journey) */}
      {journey && (
        <JourneyStepper
          status={currentStatus}
          allQuestionsAnswered={allRequiredDone}
          consentGranted={isConsentGranted}
          currentStepId={viewStep}
          onSelectStep={(stepId) => setViewStep(stepId)}
        />
      )}

      {/* 47. RESPONSIVE CLAIMSAHAY LAYOUT: Master-Detail Grid */}
      <div className={journey ? 'workspace-grid' : 'workspace-single'}>
        {/* Left Column: Primary Workspace */}
        <div className="workspace-main">
          {/* 2. INSURANCE HERO SECTION (Shown on Insurance Landing) */}
          {!journey && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="hero-container" style={{ padding: '0.5rem 0 1rem' }}>
                <div className="hero-content">
                  <div className="hero-eyebrow">
                    <Shield size={13} />
                    <span>AI Financial Journey Copilot</span>
                  </div>

                  <h1 className="hero-heading" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}>
                    Life happens.<br />
                    We're here to help.
                  </h1>

                  <p className="hero-supporting">
                    File, understand, and track your insurance journey with AI-powered guidance. Reconcile room-rent sub-limits, resolve queries, and prepare authoritative claim appeals.
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.querySelector('textarea, input[type="text"]') as HTMLElement;
                        if (el) el.focus();
                      }}
                      className="btn btn-primary"
                      style={{ padding: '0.625rem 1.25rem', gap: '0.5rem', fontSize: '0.875rem' }}
                    >
                      <span>Start a Claim</span>
                      <ArrowRight size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToSupport) onNavigateToSupport();
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
                    >
                      View My Claims
                    </button>
                  </div>
                </div>

                <div className="hero-visual-card">
                  <img
                    src="/images/hero-insurance.jpg"
                    alt="Health & Insurance Protection Visual"
                    loading="eager"
                  />
                  <div className="hero-visual-overlay" />
                </div>
              </div>

              {/* 3. FINANCIAL TRUST STRIP */}
              <div className="trust-strip" style={{ margin: '0 0 0.5rem' }}>
                <div className="trust-item">
                  <div className="trust-icon-box">
                    <Shield size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.8125rem', color: '#0F172A', display: 'block' }}>
                      Policy-Aware Guidance
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      SafeGuard clause cross-checking
                    </span>
                  </div>
                </div>

                <div className="trust-item">
                  <div className="trust-icon-box">
                    <FileCheck size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.8125rem', color: '#0F172A', display: 'block' }}>
                      Secure Document Processing
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      OCR & deterministic fact verification
                    </span>
                  </div>
                </div>

                <div className="trust-item">
                  <div className="trust-icon-box">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.8125rem', color: '#0F172A', display: 'block' }}>
                      Transparent Explanations
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Clear sub-limit breakdown
                    </span>
                  </div>
                </div>

                <div className="trust-item">
                  <div className="trust-icon-box">
                    <LifeBuoy size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.8125rem', color: '#0F172A', display: 'block' }}>
                      Human Support When Needed
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      15-field context specialist escalation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP: GOAL */}
          {!journey && (
            <GoalEntryCard
              initialGoal={initialGoal}
              onSubmitGoal={handleStartJourney}
              isSubmitting={isCreatingJourney}
              intentResult={intentResult}
            />
          )}

          {journey && viewStep === 'goal' && (
            <GoalEntryCard
              initialGoal={journey.goal}
              onSubmitGoal={handleStartJourney}
              isSubmitting={isCreatingJourney}
              intentResult={intentResult || { domain: journey.domain, journeyType: journey.journeyType, goal: journey.goal }}
              disabled={true}
            />
          )}

          {/* STEP: QUESTIONS */}
          {journey && viewStep === 'questions' && (
            <DynamicQuestionnaire
              journeyId={journey.id}
              questions={questions}
              onAnswerQuestion={handleAnswerQuestion}
              onAllCompleted={() => setViewStep('consent')}
              isSubmittingAnswer={isSubmittingAnswer}
            />
          )}

          {/* STEP: CONSENT */}
          {journey && viewStep === 'consent' && (
            <ConsentCard
              journeyId={journey.id}
              onGrantConsent={handleGrantConsent}
              isSubmittingConsent={isSubmittingConsent}
              consentGranted={isConsentGranted}
              onBack={() => setViewStep('questions')}
            />
          )}

          {/* STEP: DOCUMENTS */}
          {journey && viewStep === 'documents' && (
            <DocumentUploadSection
              journeyId={journey.id}
              requirements={requirements}
              documents={documents}
              onUploadFile={handleUploadFile}
              onProcessDocuments={handleProcessDocuments}
              isUploading={isUploading}
              isProcessing={isProcessing}
              hasConsented={isConsentGranted}
              onProceedToEvidence={() => setViewStep('evidence')}
            />
          )}

          {/* STEP: EVIDENCE */}
          {journey && viewStep === 'evidence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <EvidenceSection
                evidence={evidence}
                validation={validation}
                totalDocuments={documents.length}
                processedDocuments={documents.filter((d) => d.status === 'PROCESSED').length}
                onNavigateToUpload={() => setViewStep('documents')}
                onEscalate={() => setIsEscalateModalOpen(true)}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setViewStep('reconcile')}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  <span>Proceed to Policy Explanation</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP: POLICY RECONCILE & EXPLANATION */}
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

          {/* STEP: REVIEW & APPROVAL */}
          {journey && viewStep === 'review' && (
            <ReviewApprovalCard
              journey={journey}
              documents={documents}
              evidence={evidence}
              validation={validation}
              reconciliation={reconciliation}
              nextActions={nextActions}
              onConfirm={handleConfirm}
              onApprove={handleApprove}
              onViewTimeline={() => setViewStep('timeline')}
              onEscalate={() => setIsEscalateModalOpen(true)}
            />
          )}

          {/* STEP: TRACK & TIMELINE */}
          {journey && viewStep === 'timeline' && (
            <TimelineView
              journeyId={journey.id}
              status={currentStatus}
              onEscalate={() => setIsEscalateModalOpen(true)}
              onRefreshJourney={() => {
                journeysApi.getJourney(journey.id).then((res) => setJourney(res.journey));
              }}
            />
          )}
        </div>

        {/* Right Column: Context Panel Rail (Shown when Journey Active) */}
        {journey && (
          <div className="workspace-rail">
            {/* 25. Authoritative Status Card */}
            <Card style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Current Status
                </span>
                <Badge variant={statusInfo.variant}>● {statusInfo.label}</Badge>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                {statusInfo.note}
              </p>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Case ID:</span>
                <button
                  type="button"
                  onClick={copyJourneyId}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="Copy full Journey ID"
                >
                  <span>{journey.id.slice(0, 12)}...</span>
                  {copiedId ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
                </button>
              </div>
            </Card>

            {/* 22. Next Best Action (Authoritative from Backend) */}
            {nextActions.length > 0 && (
              <NextBestActionCard
                actions={nextActions}
                onSelectAction={handleSelectNextAction}
                onEscalate={() => setIsEscalateModalOpen(true)}
              />
            )}

            {/* Evidence & Document Summary Metrics (Only when docs exist) */}
            {documents.length > 0 && (
              <Card style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Dossier Summary
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Documents processed:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                       {documents.filter((d) => d.status === 'PROCESSED').length} of {documents.length}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Verified facts:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{evidence.length}</strong>
                  </div>

                  {validation && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Review flags:</span>
                      <strong style={{ color: validation.blocking?.length ? 'var(--warning)' : 'var(--success)' }}>
                        {validation.blocking?.length || 0} issues
                      </strong>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Human Specialist Handoff Tile */}
            <Card style={{ padding: '1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <LifeBuoy size={16} color="var(--primary)" />
                <h5 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: '#0F172A' }}>Human Review Option</h5>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                Our senior claims advocate can review your policy deductions with insurer TPA desks.
              </p>
              <button
                type="button"
                onClick={() => setIsEscalateModalOpen(true)}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.75rem', padding: '0.375rem 0.5rem', justifyContent: 'center' }}
              >
                Escalate to Specialist
              </button>
            </Card>
          </div>
        )}
      </div>

      {/* Human Escalation Modal */}
      {journey && (
        <HumanEscalationModal
          isOpen={isEscalateModalOpen}
          onClose={() => setIsEscalateModalOpen(false)}
          journeyId={journey.id}
          goal={journey.goal}
          unresolvedIssue={
            reconciliation?.conflict?.description ||
            (validation?.blocking && validation.blocking[0]?.details) ||
            'Hospital tariff exceeds policy limit.'
          }
          onEscalationSuccess={() => {
            journeysApi.getJourney(journey.id).then((res) => setJourney(res.journey));
            setViewStep('timeline');
          }}
        />
      )}
    </div>
  );
};
