import React, { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
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
    title: 'Room Rent Capping Dispute',
    text: 'Insurer deducted ₹25,000 claiming room rent of ₹7,500 exceeded policy sub-limit.',
  },
  {
    title: 'Pre-Authorization Denied',
    text: 'Cashless pre-authorization was denied for appendicitis surgery at Apollo Hospital.',
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
      <Card style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--primary-light)',
            }}
          >
            Start Your Journey
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' }}>
            Tell us what you want to accomplish
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Describe your insurance query, hospital deduction, or reimbursement issue.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={disabled || isSubmitting}
              placeholder="e.g. My hospital claim was queried/rejected and I don't understand why."
              rows={3}
              className="input-text"
              style={{ fontSize: '0.9375rem', lineHeight: 1.5, resize: 'vertical' }}
            />
          </div>

          {!disabled && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Suggested goals:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPrompt(prompt.text)}
                    disabled={isSubmitting}
                    style={{
                      textAlign: 'left',
                      background: goal === prompt.text ? 'var(--primary-subtle)' : 'var(--surface-sunken)',
                      border: goal === prompt.text ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.625rem 0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
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
                style={{ minWidth: '180px', gap: '0.5rem' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" style={{ width: '15px', height: '15px', borderTopColor: '#fff' }} />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Start Journey</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </Card>

      {/* 11. INTENT DISPLAY: Compact Confirmation */}
      {intentResult && (
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--success)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                You Want Help With
              </span>
            </div>
            <Badge variant="blue">
              Confidence: {Math.round((intentResult.confidence ?? 0.95) * 100)}%
            </Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'var(--surface-sunken)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Domain:</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
                {intentResult.domain || 'Insurance claim assistance'}
              </div>
            </div>

            <div style={{ background: 'var(--surface-sunken)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Goal:</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
                {intentResult.goal || goal}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
