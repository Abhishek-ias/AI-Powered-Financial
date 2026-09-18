import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export interface GoalEntryCardProps {
  initialGoal?: string;
  onSubmitGoal: (goal: string) => Promise<void>;
  isSubmitting: boolean;
  intentResult?: {
    domain?: string;
    journeyType?: string;
    confidence?: number;
    goal?: string;
    entities?: string[];
    urgency?: string;
  } | null;
  disabled?: boolean;
}

const SAMPLE_PROMPTS = [
  {
    title: 'Hospital Claim Queried / Rejected',
    text: 'My hospital claim was queried/rejected and I don\'t understand what is missing.',
  },
  {
    title: 'Pre-Authorization Denied',
    text: 'Cashless pre-authorization was denied for appendicitis surgery at Apollo Hospital.',
  },
  {
    title: 'Room Rent Capping Dispute',
    text: 'Insurer deducted ₹25,000 claiming room rent of ₹7,500 exceeded policy sub-limit.',
  },
  {
    title: 'Missing Documents Query',
    text: 'Received insurer query regarding missing indoor case papers and detailed pharmacy bills.',
  },
];

export const GoalEntryCard: React.FC<GoalEntryCardProps> = ({
  initialGoal = '',
  onSubmitGoal,
  isSubmitting,
  intentResult,
  disabled = false,
}) => {
  const [goal, setGoal] = useState(initialGoal || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isSubmitting || disabled) return;
    onSubmitGoal(goal.trim());
  };

  const handleSelectPrompt = (promptText: string) => {
    if (disabled || isSubmitting) return;
    setGoal(promptText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Card
        glow={!disabled}
        style={{
          border: disabled ? '1px solid var(--border-subtle)' : '1px solid var(--border-focus)',
          background: disabled ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.85)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Sparkles size={16} color="#60a5fa" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-light)' }}>
                Stage 1 • Natural Language Goal & Intent
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              What would you like ClaimSahay to resolve today?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Describe your insurance dispute, query letter, or reimbursement issue in plain English.
            </p>
          </div>
          <Badge variant="blue">AI Intent Engine Ready</Badge>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={disabled || isSubmitting}
              placeholder="e.g. My hospital claim was queried/rejected and I don't understand what is missing."
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '0.875rem 1rem',
                fontSize: '0.9375rem',
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none',
                transition: 'border 0.2s',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Minimum 10 characters recommended for accurate intent classification.</span>
              <span>{goal.length} chars</span>
            </div>
          </div>

          {!disabled && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Or select a realistic insurance query scenario:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPrompt(prompt.text)}
                    disabled={isSubmitting}
                    style={{
                      textAlign: 'left',
                      background: goal === prompt.text ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                      border: goal === prompt.text ? '1px solid var(--primary-light)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.625rem 0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
                      {prompt.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prompt.text}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!disabled && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={!goal.trim() || isSubmitting}
                className="btn btn-primary"
                style={{ minWidth: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} />
                    <span>Analyzing & Creating Journey...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Goal & Start ClaimSahay</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </Card>

      {/* Verified Intent Result Panel */}
      {intentResult && (
        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#34d399" />
              <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                Backend Intent Classification Confirmed
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Badge variant="blue">Domain: {intentResult.domain || 'INSURANCE'}</Badge>
              <Badge variant="green">
                Confidence: {Math.round((intentResult.confidence ?? 0.95) * 100)}%
              </Badge>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Journey Workflow
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
                {intentResult.journeyType || 'HEALTH_INSURANCE_CLAIM'}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Detected Core Goal
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                {intentResult.goal || goal}
              </div>
            </div>

            {intentResult.urgency && (
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Urgency Level
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b', marginTop: '0.125rem' }}>
                  {intentResult.urgency}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
