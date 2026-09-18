import React, { useState } from 'react';
import { Shield, DollarSign, CreditCard, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ReadyStatus } from '../types';

export interface HomeViewProps {
  onStartJourney: (message: string, domain?: 'INSURANCE' | 'LENDING' | 'FINTECH') => void;
  onNavigateTab: (tab: string) => void;
  readyStatus?: ReadyStatus | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartJourney,
  onNavigateTab,
}) => {
  const [goalText, setGoalText] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    onStartJourney(goalText);
  };

  const sampleJourneys = [
    {
      domain: 'INSURANCE' as const,
      tab: 'claimsahay',
      title: 'ClaimSahay (Insurance)',
      tagline: 'Resolve a hospital claim query or rejection',
      prompt: "My hospital claim was queried/rejected and I don't understand what is missing.",
      icon: Shield,
      color: '#3b82f6',
      badge: 'Primary Experience',
    },
    {
      domain: 'LENDING' as const,
      tab: 'lending',
      title: 'Lending Copilot',
      tagline: 'Explore loan eligibility, EMI & affordability',
      prompt: 'I need a home renovation loan of ₹10 Lakhs for 5 years.',
      icon: DollarSign,
      color: '#10b981',
      badge: 'Multi-Scenario',
    },
    {
      domain: 'FINTECH' as const,
      tab: 'fintech',
      title: 'Fintech Disputes',
      tagline: 'Resolve failed-but-debited payment transactions',
      prompt: 'My UPI payment of ₹4,999 failed but money was debited from my account.',
      icon: CreditCard,
      color: '#8b5cf6',
      badge: 'Instant Triage',
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: 'var(--space-4) auto 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: 'var(--space-2)' }}>
          How can we help you today?
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Tell us what you're trying to accomplish. We'll guide you through the next steps.
        </p>

        {/* Main Goal Input */}
        <form onSubmit={handleStart} style={{ marginTop: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-2)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <input
              type="text"
              placeholder="e.g. My hospital claim was queried and I don't understand why..."
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '0.625rem 0.875rem',
                fontSize: '0.9375rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!goalText.trim()}
              className="btn btn-primary"
              style={{ padding: '0.625rem 1.25rem' }}
            >
              <span>Start Journey</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
          One conversation. Every financial goal. Evidence-backed guidance before any consequential action.
        </p>
      </div>

      {/* Suggested Journeys Grid */}
      <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
          Suggested Financial Journeys
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {sampleJourneys.map((j, idx) => {
            const Icon = j.icon;
            return (
              <div
                key={idx}
                onClick={() => onStartJourney(j.prompt, j.domain)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-5)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={16} color={j.color} />
                    </div>
                    <Badge variant={idx === 0 ? 'blue' : 'gray'}>{j.badge}</Badge>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginBottom: 'var(--space-1)' }}>
                    {j.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 'var(--space-4)' }}>
                    {j.tagline}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#60a5fa', fontWeight: 500 }}>
                  <span>Launch Journey</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
