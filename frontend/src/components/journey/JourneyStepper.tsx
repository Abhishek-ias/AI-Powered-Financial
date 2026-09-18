import React from 'react';
import {
  Brain,
  HelpCircle,
  FileCheck2,
  UploadCloud,
  Search,
  Scale,
  CheckCircle2,
  Send,
  LifeBuoy,
} from 'lucide-react';
import { JourneyStatus } from '../../types';

export interface JourneyStepperProps {
  status: JourneyStatus;
  allQuestionsAnswered?: boolean;
  consentGranted?: boolean;
}

interface StepItem {
  id: string;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  isComplete: (status: JourneyStatus, questionsDone?: boolean, consentDone?: boolean) => boolean;
  isActive: (status: JourneyStatus, questionsDone?: boolean, consentDone?: boolean) => boolean;
}

const STEPS: StepItem[] = [
  {
    id: 'understand',
    label: 'Understand',
    subLabel: 'Goal & Intent',
    icon: Brain,
    isComplete: (st) => st !== 'CREATED',
    isActive: (st) => st === 'CREATED' || st === 'GOAL_IDENTIFIED',
  },
  {
    id: 'questions',
    label: 'Questions',
    subLabel: 'Clarification',
    icon: HelpCircle,
    isComplete: (st, qDone) =>
      qDone ||
      st === 'CONSENT_PENDING' ||
      st === 'DOCUMENTS_PENDING' ||
      st === 'DOCUMENT_PROCESSING' ||
      st === 'VALIDATING' ||
      st === 'NEEDS_ACTION' ||
      st === 'READY_FOR_REVIEW' ||
      st === 'USER_CONFIRMED' ||
      st === 'ACTION_PENDING' ||
      st === 'SUBMITTED' ||
      st === 'COMPLETED',
    isActive: (st, qDone) => st === 'QUESTIONS_PENDING' && !qDone,
  },
  {
    id: 'consent',
    label: 'Consent',
    subLabel: 'Permissions',
    icon: FileCheck2,
    isComplete: (st, _, cDone) =>
      cDone ||
      st === 'DOCUMENTS_PENDING' ||
      st === 'DOCUMENT_PROCESSING' ||
      st === 'VALIDATING' ||
      st === 'NEEDS_ACTION' ||
      st === 'READY_FOR_REVIEW' ||
      st === 'USER_CONFIRMED' ||
      st === 'ACTION_PENDING' ||
      st === 'SUBMITTED' ||
      st === 'COMPLETED',
    isActive: (st, qDone, cDone) =>
      Boolean((st === 'CONSENT_PENDING' || qDone) && !cDone && st !== 'DOCUMENTS_PENDING'),
  },
  {
    id: 'documents',
    label: 'Documents',
    subLabel: 'Bills & Discharge',
    icon: UploadCloud,
    isComplete: (st) =>
      st === 'DOCUMENT_PROCESSING' ||
      st === 'VALIDATING' ||
      st === 'NEEDS_ACTION' ||
      st === 'READY_FOR_REVIEW' ||
      st === 'USER_CONFIRMED' ||
      st === 'ACTION_PENDING' ||
      st === 'SUBMITTED' ||
      st === 'COMPLETED',
    isActive: (st) => st === 'DOCUMENTS_PENDING',
  },
  {
    id: 'verify',
    label: 'Verify',
    subLabel: 'AI Extraction',
    icon: Search,
    isComplete: (st) =>
      st === 'VALIDATING' ||
      st === 'NEEDS_ACTION' ||
      st === 'READY_FOR_REVIEW' ||
      st === 'USER_CONFIRMED' ||
      st === 'ACTION_PENDING' ||
      st === 'SUBMITTED' ||
      st === 'COMPLETED',
    isActive: (st) => st === 'DOCUMENT_PROCESSING',
  },
  {
    id: 'explain',
    label: 'Explain',
    subLabel: 'Policy Rules',
    icon: Scale,
    isComplete: (st) =>
      st === 'READY_FOR_REVIEW' ||
      st === 'USER_CONFIRMED' ||
      st === 'ACTION_PENDING' ||
      st === 'SUBMITTED' ||
      st === 'COMPLETED',
    isActive: (st) => st === 'VALIDATING' || st === 'NEEDS_ACTION',
  },
  {
    id: 'review',
    label: 'Review',
    subLabel: 'Reconciliation',
    icon: CheckCircle2,
    isComplete: (st) =>
      st === 'USER_CONFIRMED' ||
      st === 'ACTION_PENDING' ||
      st === 'SUBMITTED' ||
      st === 'COMPLETED',
    isActive: (st) => st === 'READY_FOR_REVIEW',
  },
  {
    id: 'act',
    label: 'Act',
    subLabel: 'Approval Gate',
    icon: Send,
    isComplete: (st) => st === 'SUBMITTED' || st === 'COMPLETED',
    isActive: (st) => st === 'USER_CONFIRMED' || st === 'ACTION_PENDING',
  },
  {
    id: 'track',
    label: 'Track',
    subLabel: 'Audit & Outcome',
    icon: LifeBuoy,
    isComplete: (st) => st === 'COMPLETED',
    isActive: (st) => st === 'SUBMITTED' || st === 'INSTITUTION_REVIEW' || st === 'HUMAN_REVIEW' || st === 'COMPLETED',
  },
];

export const JourneyStepper: React.FC<JourneyStepperProps> = ({
  status,
  allQuestionsAnswered = false,
  consentGranted = false,
}) => {
  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: '780px',
          position: 'relative',
        }}
      >
        {STEPS.map((step, idx) => {
          const complete = step.isComplete(status, allQuestionsAnswered, consentGranted);
          const active = !complete && step.isActive(status, allQuestionsAnswered, consentGranted);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  flex: 1,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: complete
                      ? 'var(--success)'
                      : active
                      ? 'var(--primary-gradient)'
                      : 'rgba(30, 41, 59, 0.8)',
                    border: active
                      ? '2px solid #60a5fa'
                      : complete
                      ? '2px solid #34d399'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: active
                      ? '0 0 16px rgba(59, 130, 246, 0.5)'
                      : complete
                      ? '0 0 10px rgba(16, 185, 129, 0.3)'
                      : 'none',
                    transition: 'all 0.3s ease',
                    color: complete || active ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  <Icon size={18} />
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: active || complete ? 700 : 500,
                      color: active
                        ? 'var(--primary-light)'
                        : complete
                        ? 'var(--text-primary)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.125rem',
                    }}
                  >
                    {step.subLabel}
                  </div>
                </div>
              </div>

              {/* Connecting line */}
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: complete
                      ? 'rgba(16, 185, 129, 0.5)'
                      : active
                      ? 'rgba(59, 130, 246, 0.4)'
                      : 'rgba(255, 255, 255, 0.08)',
                    margin: '0 -0.5rem 1.75rem -0.5rem',
                    transition: 'background 0.3s ease',
                    zIndex: 1,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
