import React from 'react';
import {
  Brain,
  HelpCircle,
  FileCheck2,
  UploadCloud,
  Search,
  Scale,
  CheckCircle2,
  LifeBuoy,
  Check,
} from 'lucide-react';
import { JourneyStatus } from '../../types';

export interface JourneyStepperProps {
  status: JourneyStatus;
  allQuestionsAnswered?: boolean;
  consentGranted?: boolean;
  currentStepId?: string;
  onSelectStep?: (stepId: string) => void;
}

export interface StepItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  isComplete: (status: JourneyStatus, questionsDone?: boolean, consentDone?: boolean) => boolean;
  isActive: (status: JourneyStatus, questionsDone?: boolean, consentDone?: boolean) => boolean;
}

export const JOURNEY_STEPS: StepItem[] = [
  {
    id: 'goal',
    label: 'Understand',
    shortLabel: 'Goal',
    icon: Brain,
    isComplete: (st) => st !== 'CREATED',
    isActive: (st) => st === 'CREATED' || st === 'GOAL_IDENTIFIED',
  },
  {
    id: 'questions',
    label: 'Questions',
    shortLabel: 'Questions',
    icon: HelpCircle,
    isComplete: (st, qDone) =>
      Boolean(
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
        st === 'INSTITUTION_REVIEW' ||
        st === 'COMPLETED'
      ),
    isActive: (st, qDone) => st === 'QUESTIONS_PENDING' && !qDone,
  },
  {
    id: 'consent',
    label: 'Consent',
    shortLabel: 'Consent',
    icon: FileCheck2,
    isComplete: (st, _, cDone) =>
      Boolean(
        cDone ||
        st === 'DOCUMENTS_PENDING' ||
        st === 'DOCUMENT_PROCESSING' ||
        st === 'VALIDATING' ||
        st === 'NEEDS_ACTION' ||
        st === 'READY_FOR_REVIEW' ||
        st === 'USER_CONFIRMED' ||
        st === 'ACTION_PENDING' ||
        st === 'SUBMITTED' ||
        st === 'INSTITUTION_REVIEW' ||
        st === 'COMPLETED'
      ),
    isActive: (st, qDone, cDone) =>
      Boolean((st === 'CONSENT_PENDING' || qDone) && !cDone && st !== 'DOCUMENTS_PENDING'),
  },
  {
    id: 'documents',
    label: 'Documents',
    shortLabel: 'Documents',
    icon: UploadCloud,
    isComplete: (st) =>
      st === 'DOCUMENT_PROCESSING' ||
      st === 'VALIDATING' ||
      st === 'NEEDS_ACTION' ||
      st === 'READY_FOR_REVIEW' ||
      st === 'USER_CONFIRMED' ||
      st === 'ACTION_PENDING' ||
      st === 'SUBMITTED' ||
      st === 'INSTITUTION_REVIEW' ||
      st === 'COMPLETED',
    isActive: (st) => st === 'DOCUMENTS_PENDING',
  },
  {
    id: 'evidence',
    label: 'Verify',
    shortLabel: 'Verify',
    icon: Search,
    isComplete: (st) =>
      st === 'VALIDATING' ||
      st === 'NEEDS_ACTION' ||
      st === 'READY_FOR_REVIEW' ||
      st === 'USER_CONFIRMED' ||
      st === 'ACTION_PENDING' ||
      st === 'SUBMITTED' ||
      st === 'INSTITUTION_REVIEW' ||
      st === 'COMPLETED',
    isActive: (st) => st === 'DOCUMENT_PROCESSING',
  },
  {
    id: 'reconcile',
    label: 'Explain',
    shortLabel: 'Explain',
    icon: Scale,
    isComplete: (st) =>
      st === 'READY_FOR_REVIEW' ||
      st === 'USER_CONFIRMED' ||
      st === 'ACTION_PENDING' ||
      st === 'SUBMITTED' ||
      st === 'INSTITUTION_REVIEW' ||
      st === 'COMPLETED',
    isActive: (st) => st === 'VALIDATING' || st === 'NEEDS_ACTION',
  },
  {
    id: 'review',
    label: 'Review',
    shortLabel: 'Review',
    icon: CheckCircle2,
    isComplete: (st) =>
      st === 'USER_CONFIRMED' ||
      st === 'ACTION_PENDING' ||
      st === 'SUBMITTED' ||
      st === 'INSTITUTION_REVIEW' ||
      st === 'COMPLETED',
    isActive: (st) => st === 'READY_FOR_REVIEW',
  },
  {
    id: 'timeline',
    label: 'Track',
    shortLabel: 'Track',
    icon: LifeBuoy,
    isComplete: (st) => st === 'COMPLETED',
    isActive: (st) =>
      st === 'SUBMITTED' ||
      st === 'INSTITUTION_REVIEW' ||
      st === 'HUMAN_REVIEW' ||
      st === 'COMPLETED',
  },
];

export const JourneyStepper: React.FC<JourneyStepperProps> = ({
  status,
  allQuestionsAnswered = false,
  consentGranted = false,
  currentStepId,
  onSelectStep,
}) => {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.875rem 1.25rem',
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: '720px',
          position: 'relative',
        }}
      >
        {JOURNEY_STEPS.map((step, idx) => {
          const complete = step.isComplete(status, allQuestionsAnswered, consentGranted);
          const isCurrentActive = currentStepId
            ? currentStepId === step.id
            : !complete && step.isActive(status, allQuestionsAnswered, consentGranted);
          const isAccessible = complete || isCurrentActive || Boolean(onSelectStep);

          return (
            <React.Fragment key={step.id}>
              {/* Step Pill / Button */}
              <button
                type="button"
                onClick={() => isAccessible && onSelectStep && onSelectStep(step.id)}
                disabled={!isAccessible}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  cursor: isAccessible && onSelectStep ? 'pointer' : 'default',
                  borderRadius: 'var(--radius-md)',
                  opacity: !complete && !isCurrentActive ? 0.45 : 1,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: complete
                      ? 'var(--success-bg)'
                      : isCurrentActive
                      ? 'var(--primary-subtle)'
                      : 'rgba(30, 41, 59, 0.6)',
                    border: complete
                      ? '1px solid var(--success-border)'
                      : isCurrentActive
                      ? '1.5px solid var(--primary)'
                      : '1px solid var(--border-subtle)',
                    color: complete
                      ? 'var(--success)'
                      : isCurrentActive
                      ? 'var(--primary-light)'
                      : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {complete ? <Check size={14} /> : idx + 1}
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: isCurrentActive ? 700 : complete ? 600 : 500,
                      color: isCurrentActive
                        ? 'var(--text-primary)'
                        : complete
                        ? 'var(--text-secondary)'
                        : 'var(--text-muted)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {step.label}
                  </div>
                </div>
              </button>

              {/* Quiet subtle connector */}
              {idx < JOURNEY_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    background: complete
                      ? 'var(--success-border)'
                      : isCurrentActive
                      ? 'rgba(59, 130, 246, 0.3)'
                      : 'var(--border-subtle)',
                    margin: '0 0.5rem',
                    minWidth: '16px',
                    transition: 'background 0.2s ease',
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
