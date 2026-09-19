import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Circle,
  GitBranch,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';
import { Journey, TimelineEvent } from '../../../types';
import { Badge } from '../../../components/ui/Badge';

export interface N8nOrchestrationPanelProps {
  journey: Journey;
  timelineEvents?: TimelineEvent[];
  workflowRun?: {
    executionId?: string;
    status?: string;
    providerMode?: string;
  } | null;
  compact?: boolean;
}

interface WorkflowStage {
  id: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'CURRENT' | 'REQUIRES_HUMAN' | 'PENDING';
  completedAt?: string;
}

export const N8nOrchestrationPanel: React.FC<N8nOrchestrationPanelProps> = ({
  journey,
  timelineEvents = [],
  workflowRun,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(!compact);

  // Derive execution ID from real backend workflow run or fallback to journey ID
  const realExecutionId =
    workflowRun?.executionId ||
    (journey as any).workflowRuns?.[0]?.executionId ||
    `exec-mock-${journey.id.slice(0, 8)}`;

  const isHumanReview =
    journey.status === 'HUMAN_REVIEW' ||
    timelineEvents.some((e) => e.eventType === 'escalation_created');

  const isCompleted =
    journey.status === 'COMPLETED' ||
    journey.status === 'INSTITUTION_REVIEW' ||
    journey.status === 'SUBMITTED';

  // Helper to check if a timeline event occurred
  const hasEvent = (type: string) => timelineEvents.some((e) => e.eventType === type);
  const getEventTime = (type: string) => {
    const ev = timelineEvents.find((e) => e.eventType === type);
    if (!ev) return undefined;
    return new Date(ev.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Determine stage progression
  const qDone =
    hasEvent('question_answered') ||
    journey.questions?.every((q) => !!q.answer) ||
    ['CONSENT_PENDING', 'DOCUMENTS_PENDING', 'DOCUMENT_PROCESSING', 'VALIDATING', 'NEEDS_ACTION', 'READY_FOR_REVIEW', 'USER_CONFIRMED', 'ACTION_PENDING', 'SUBMITTED', 'INSTITUTION_REVIEW', 'COMPLETED'].includes(journey.status);

  const consentDone =
    hasEvent('consent_granted') ||
    journey.consentState === 'GRANTED' ||
    ['DOCUMENTS_PENDING', 'DOCUMENT_PROCESSING', 'VALIDATING', 'NEEDS_ACTION', 'READY_FOR_REVIEW', 'USER_CONFIRMED', 'ACTION_PENDING', 'SUBMITTED', 'INSTITUTION_REVIEW', 'COMPLETED'].includes(journey.status);

  const docsProcessed =
    hasEvent('documents_processed') ||
    (journey.documents && journey.documents.some((d) => d.status === 'PROCESSED')) ||
    ['VALIDATING', 'NEEDS_ACTION', 'READY_FOR_REVIEW', 'USER_CONFIRMED', 'ACTION_PENDING', 'SUBMITTED', 'INSTITUTION_REVIEW', 'COMPLETED'].includes(journey.status);

  const evidenceValidated =
    hasEvent('validation_run') ||
    (journey.evidenceItems && journey.evidenceItems.length > 0) ||
    ['NEEDS_ACTION', 'READY_FOR_REVIEW', 'USER_CONFIRMED', 'ACTION_PENDING', 'SUBMITTED', 'INSTITUTION_REVIEW', 'COMPLETED'].includes(journey.status);

  const rulesApplied =
    hasEvent('reconciliation_run') ||
    ['READY_FOR_REVIEW', 'USER_CONFIRMED', 'ACTION_PENDING', 'SUBMITTED', 'INSTITUTION_REVIEW', 'COMPLETED'].includes(journey.status);

  const userConfirmed =
    hasEvent('user_confirmed') ||
    ['USER_CONFIRMED', 'ACTION_PENDING', 'SUBMITTED', 'INSTITUTION_REVIEW', 'COMPLETED'].includes(journey.status);

  const approved =
    hasEvent('action_approved') ||
    ['ACTION_PENDING', 'SUBMITTED', 'INSTITUTION_REVIEW', 'COMPLETED'].includes(journey.status);

  const submitted =
    hasEvent('action_submitted') ||
    hasEvent('claim_submitted') ||
    ['SUBMITTED', 'INSTITUTION_REVIEW', 'COMPLETED'].includes(journey.status);

  const auditLogged = submitted;

  // 11 Workflow Stages mapped to real backend events
  const stages: WorkflowStage[] = [
    {
      id: 'started',
      title: 'Journey Started',
      description: 'Goal received and journey initialized in core engine',
      status: 'COMPLETED',
      completedAt: getEventTime('journey_created') || new Date(journey.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'goal',
      title: 'Understand Goal',
      description: 'Customer intent parsed via intent classifier',
      status: journey.status === 'CREATED' ? 'CURRENT' : 'COMPLETED',
      completedAt: getEventTime('intent_detected') || (journey.goal ? 'Verified' : undefined),
    },
    {
      id: 'info',
      title: 'Collect Information',
      description: 'Dynamic question answers and privacy consent recorded',
      status: consentDone
        ? 'COMPLETED'
        : journey.status === 'QUESTIONS_PENDING' || journey.status === 'CONSENT_PENDING'
        ? 'CURRENT'
        : 'PENDING',
      completedAt: getEventTime('consent_granted') || (consentDone ? 'Recorded' : undefined),
    },
    {
      id: 'docs',
      title: 'Process Documents',
      description: 'Document AI OCR parsing, line-item extraction and schema mapping',
      status: docsProcessed
        ? 'COMPLETED'
        : journey.status === 'DOCUMENTS_PENDING' || journey.status === 'DOCUMENT_PROCESSING'
        ? 'CURRENT'
        : 'PENDING',
      completedAt: getEventTime('documents_processed') || (docsProcessed ? 'Extracted' : undefined),
    },
    {
      id: 'validate',
      title: 'Validate Evidence',
      description: 'Cross-document fact consistency and verification checks',
      status: evidenceValidated
        ? 'COMPLETED'
        : journey.status === 'VALIDATING'
        ? 'CURRENT'
        : 'PENDING',
      completedAt: getEventTime('validation_run') || (evidenceValidated ? 'Validated' : undefined),
    },
    {
      id: 'policy',
      title: 'Apply Rules / Policy',
      description: 'Insurer schedule clause matching and deduction reconciliation',
      status: rulesApplied
        ? 'COMPLETED'
        : journey.status === 'NEEDS_ACTION'
        ? 'CURRENT'
        : 'PENDING',
      completedAt: getEventTime('reconciliation_run') || (rulesApplied ? 'Reconciled' : undefined),
    },
    {
      id: 'action',
      title: 'Determine Next Action',
      description: 'Rules engine evaluates next best action recommendation',
      status: rulesApplied
        ? 'COMPLETED'
        : 'PENDING',
      completedAt: rulesApplied ? 'Evaluated' : undefined,
    },
    {
      id: 'confirm',
      title: 'Customer Confirmation',
      description: 'Consequential user confirmation gate and review',
      status: userConfirmed
        ? 'COMPLETED'
        : journey.status === 'READY_FOR_REVIEW'
        ? 'CURRENT'
        : 'PENDING',
      completedAt: getEventTime('user_confirmed') || (userConfirmed ? 'Confirmed' : undefined),
    },
    {
      id: 'approval',
      title: 'Approval Generated',
      description: 'Cryptographic payload hash and signed approval record',
      status: approved
        ? 'COMPLETED'
        : journey.status === 'USER_CONFIRMED'
        ? 'CURRENT'
        : 'PENDING',
      completedAt: getEventTime('action_approved') || (approved ? 'Authorized' : undefined),
    },
    {
      id: 'submission',
      title: isHumanReview ? 'Human Specialist Review' : 'Action / Submission',
      description: isHumanReview
        ? 'Case escalated to licensed human claims specialist for review'
        : 'Automated dispatch to insurer adjudication workflow via n8n integration',
      status: isHumanReview
        ? 'REQUIRES_HUMAN'
        : submitted
        ? 'COMPLETED'
        : journey.status === 'ACTION_PENDING'
        ? 'CURRENT'
        : 'PENDING',
      completedAt: isHumanReview
        ? getEventTime('escalation_created') || 'Assigned'
        : getEventTime('action_submitted') || getEventTime('claim_submitted') || (submitted ? 'Dispatched' : undefined),
    },
    {
      id: 'audit',
      title: 'Audit Recorded',
      description: 'Deterministic audit ledger entry and transition timestamp',
      status: auditLogged
        ? 'COMPLETED'
        : 'PENDING',
      completedAt: auditLogged ? 'Logged' : undefined,
    },
  ];

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <GitBranch size={16} color="var(--color-primary)" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-primary)',
              }}
            >
              Workflow Orchestration
            </span>
          </div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            Orchestrated through n8n
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>
            Financial journey workflow layer coordinating validation, policy reconciliation, and institutional submission.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Transparent Simulation Label */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--secondary-subtle)',
              border: '1px solid var(--secondary-border)',
              borderRadius: '9999px',
              padding: '0.25rem 0.65rem',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--secondary-text)',
            }}
          >
            <Cpu size={12} />
            Sandbox / Demo Simulation
          </span>

          <Badge variant={isCompleted ? 'green' : isHumanReview ? 'amber' : 'forest'}>
            {isCompleted ? '✓ Workflow Completed' : isHumanReview ? 'Human Review' : 'In Progress'}
          </Badge>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.25rem' }}
          >
            <span>{isExpanded ? 'Hide Steps' : 'View Workflow'}</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Execution Details Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          background: 'var(--bg-surface-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          fontSize: '0.8125rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Engine</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text)', marginTop: '0.125rem' }}>
            n8n Workflow Automation
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Workflow</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text)', marginTop: '0.125rem' }}>
            Financial Journey Orchestration
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Execution ID</div>
          <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'monospace', marginTop: '0.125rem' }}>
            {realExecutionId}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Mode & Safety</div>
          <div style={{ fontWeight: 600, color: 'var(--color-secondary)', marginTop: '0.125rem' }}>
            Sandbox / Demo Simulation
          </div>
        </div>
      </div>

      {/* 11-Stage Workflow Visualization */}
      {isExpanded && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Workflow Stage Sequence ({stages.filter((s) => s.status === 'COMPLETED').length} of {stages.length} Completed)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', position: 'relative' }}>
            {stages.map((stage, idx) => {
              const isLast = idx === stages.length - 1;
              const isStageComplete = stage.status === 'COMPLETED';
              const isStageCurrent = stage.status === 'CURRENT';
              const isStageHuman = stage.status === 'REQUIRES_HUMAN';

              return (
                <div
                  key={stage.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.875rem',
                    position: 'relative',
                  }}
                >
                  {/* Step Connector Line */}
                  {!isLast && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '11px',
                        top: '24px',
                        bottom: '-10px',
                        width: '2px',
                        background: isStageComplete ? 'var(--color-primary)' : 'var(--color-border)',
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Step Indicator Dot */}
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isStageComplete
                        ? '#2E7D5B'
                        : isStageCurrent
                        ? 'var(--color-primary)'
                        : isStageHuman
                        ? 'var(--color-secondary)'
                        : '#FFFFFF',
                      border: isStageComplete || isStageCurrent || isStageHuman
                        ? 'none'
                        : '2px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 1,
                      color: '#FFFFFF',
                    }}
                  >
                    {isStageComplete ? (
                      <CheckCircle2 size={14} color="#FFFFFF" />
                    ) : isStageCurrent ? (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#FFFFFF',
                        }}
                      />
                    ) : isStageHuman ? (
                      <AlertTriangle size={12} color="#FFFFFF" />
                    ) : (
                      <Circle size={8} color="var(--color-text-muted)" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div
                    style={{
                      flex: 1,
                      background: isStageCurrent
                        ? 'var(--primary-subtle)'
                        : isStageHuman
                        ? 'var(--secondary-subtle)'
                        : 'transparent',
                      border: isStageCurrent
                        ? '1px solid var(--primary-border)'
                        : isStageHuman
                        ? '1px solid var(--secondary-border)'
                        : '1px solid transparent',
                      borderRadius: 'var(--radius-sm)',
                      padding: isStageCurrent || isStageHuman ? '0.5rem 0.75rem' : '0.2rem 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: isStageCurrent || isStageComplete ? 600 : 500,
                            color: isStageCurrent
                              ? 'var(--color-primary)'
                              : isStageHuman
                              ? 'var(--secondary-text)'
                              : isStageComplete
                              ? 'var(--color-text)'
                              : 'var(--color-text-muted)',
                          }}
                        >
                          {stage.title}
                        </span>

                        {isStageCurrent && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              background: 'var(--color-primary)',
                              color: '#FFFFFF',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '9999px',
                            }}
                          >
                            Active
                          </span>
                        )}

                        {isStageHuman && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              background: 'var(--color-secondary)',
                              color: '#FFFFFF',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '9999px',
                            }}
                          >
                            Human Review
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: isStageCurrent ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          marginTop: '0.125rem',
                        }}
                      >
                        {stage.description}
                      </div>
                    </div>

                    {stage.completedAt && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          color: isStageComplete ? '#2E7D5B' : 'var(--color-text-muted)',
                          fontWeight: 500,
                          flexShrink: 0,
                        }}
                      >
                        {stage.completedAt}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion Callout Banner if Completed */}
      {isCompleted && (
        <div
          style={{
            background: 'var(--primary-subtle)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <ShieldCheck size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              JOURNEY COMPLETED
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text)', marginTop: '0.125rem' }}>
              Your financial journey has been processed successfully via n8n workflow orchestration. (Sandbox / Demo Simulation)
            </div>
          </div>
        </div>
      )}

      {/* Human Review Banner if applicable */}
      {isHumanReview && !isCompleted && (
        <div
          style={{
            background: 'var(--secondary-subtle)',
            border: '1px solid var(--secondary-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={20} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--secondary-text)' }}>
              JOURNEY STATUS: Human Review
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text)', marginTop: '0.125rem' }}>
              Workflow paused for human-in-the-loop specialist intervention. All dossier context has been packaged and assigned.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
