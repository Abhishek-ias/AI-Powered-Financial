import React, { useState } from 'react';
import { Shield, DollarSign, CreditCard, ArrowRight } from 'lucide-react';
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
      tagline: 'Resolve a hospital claim query, deduction, or rejection',
      prompt: "My hospital claim was queried/rejected and I don't understand what is missing.",
      icon: Shield,
      badge: 'Primary Journey',
      variant: 'blue' as const,
    },
    {
      domain: 'LENDING' as const,
      tab: 'lending',
      title: 'Lending Copilot',
      tagline: 'Explore loan affordability, EMI schedules, and DTI',
      prompt: 'I need a home renovation loan of ₹10 Lakhs for 5 years.',
      icon: DollarSign,
      badge: 'Authoritative Math',
      variant: 'green' as const,
    },
    {
      domain: 'FINTECH' as const,
      tab: 'fintech',
      title: 'Fintech Disputes',
      tagline: 'Resolve failed-but-debited UPI or card transactions',
      prompt: 'My UPI payment of ₹4,999 failed but money was debited from my account.',
      icon: CreditCard,
      badge: 'Dispute Triage',
      variant: 'purple' as const,
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* 22. Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '680px', margin: 'var(--space-4) auto 0' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#0F172A', marginBottom: 'var(--space-2)' }}>
          How can we help you today?
        </h1>
        <p style={{ fontSize: '1.0625rem', color: '#475569', lineHeight: 1.5 }}>
          Tell us what you're trying to accomplish. We'll guide you through the journey.
        </p>

        {/* Primary Input Container (White card + subtle border + soft shadow) */}
        <form onSubmit={handleStart} style={{ marginTop: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-lg)',
              padding: '0.375rem 0.5rem 0.375rem 0.75rem',
              boxShadow: 'var(--shadow-md)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
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
                color: '#0F172A',
                padding: '0.625rem 0.5rem',
                fontSize: '0.9375rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!goalText.trim()}
              className="btn btn-primary"
              style={{ padding: '0.625rem 1.25rem', gap: '0.375rem' }}
            >
              <span>Start Journey</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>

        <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 'var(--space-3)' }}>
          One conversation. Every financial goal. Evidence-backed guidance before any consequential action.
        </p>
      </div>

      {/* Suggested Journeys Grid (White surfaces with subtle borders) */}
      <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
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
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-5)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#94A3B8';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        background: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} color="#2563EB" />
                    </div>
                    <Badge variant={j.variant}>{j.badge}</Badge>
                  </div>

                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.25rem' }}>
                    {j.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>
                    {j.tagline}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 'var(--space-4)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                    color: '#2563EB',
                    fontWeight: 600,
                  }}
                >
                  <span>Begin journey</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
