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
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-lg)',
        padding: '0.875rem 1.25rem',
        boxShadow: 'var(--shadow-sm)',
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

          // 15. Semantic Stepper Colors
          const circleBg = complete ? '#DCFCE7' : isCurrentActive ? '#2563EB' : '#F1F5F9';
          const circleBorder = complete ? '#BBF7D0' : isCurrentActive ? '#2563EB' : '#CBD5E1';
          const circleColor = complete ? '#166534' : isCurrentActive ? '#FFFFFF' : '#64748B';
          const textColor = complete ? '#166534' : isCurrentActive ? '#1D4ED8' : '#64748B';

          return (
            <React.Fragment key={step.id}>
              {/* Step Pill Button */}
              <button
                type="button"
                onClick={() => isAccessible && onSelectStep && onSelectStep(step.id)}
                disabled={!isAccessible}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: isCurrentActive ? '#EFF6FF' : 'transparent',
                  border: isCurrentActive ? '1px solid #BFDBFE' : '1px solid transparent',
                  padding: '0.375rem 0.625rem',
                  cursor: isAccessible && onSelectStep ? 'pointer' : 'default',
                  borderRadius: 'var(--radius-md)',
                  opacity: !complete && !isCurrentActive ? 0.65 : 1,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: circleBg,
                    border: `1px solid ${circleBorder}`,
                    color: circleColor,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {complete ? <Check size={13} strokeWidth={2.5} /> : idx + 1}
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: isCurrentActive ? 700 : complete ? 600 : 500,
                      color: textColor,
                    }}
                  >
                    {step.label}
                  </div>
                </div>
              </button>

              {/* Connector line */}
              {idx < JOURNEY_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: complete ? '#BBF7D0' : '#E2E8F0',
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
