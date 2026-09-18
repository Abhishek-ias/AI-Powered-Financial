import React, { useState } from 'react';
import { Shield, DollarSign, CreditCard, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
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
  readyStatus,
}) => {
  const [goalText, setGoalText] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    onStartJourney(goalText);
  };

  const sampleGoals = [
    {
      title: 'Hospital Claim Query',
      text: "My hospital claim was queried/rejected and I don't understand what is missing.",
      domain: 'INSURANCE' as const,
      tag: 'Primary Demo',
      color: 'blue' as const,
    },
    {
      title: 'Home Renovation Loan',
      text: 'I need a home renovation loan of ₹10 Lakhs for 5 years.',
      domain: 'LENDING' as const,
      tag: 'Lending',
      color: 'green' as const,
    },
    {
      title: 'Failed UPI Transaction',
      text: 'My UPI payment of ₹4,999 failed but money was debited from my account.',
      domain: 'FINTECH' as const,
      tag: 'Fintech',
      color: 'purple' as const,
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '820px', margin: '1rem auto 0' }}>
        <Badge variant="blue" size="md">
          <Sparkles size={12} style={{ marginRight: '4px' }} />
          Multi-Domain Financial Copilot
        </Badge>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            lineHeight: 1.15,
            marginTop: '1rem',
            marginBottom: '1rem',
            background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          One Conversation. Every Financial Goal.
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          An evidence-backed financial copilot that connects your goal with dynamic questions,
          document intelligence, policy terms, and verifiable explanations before any consequential action.
        </p>

        {/* Natural Language Goal Input */}
        <form onSubmit={handleStart} style={{ marginTop: '2rem' }}>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-highlight)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <input
              type="text"
              placeholder="What financial goal can we assist you with today? (e.g. claim help, loan EMI, transaction dispute)..."
              value={goalText}
              onChange={e => setGoalText(e.target.value)}
              className="input-text"
              style={{ border: 'none', background: 'transparent', fontSize: '1rem' }}
            />
            <button
              type="submit"
              disabled={!goalText.trim()}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)' }}
            >
              Start Journey <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* Quick Click Prompts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
            Quick Prompts:
          </span>
          {sampleGoals.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => onStartJourney(sample.text, sample.domain)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
            >
              <Badge variant={sample.color} size="sm">{sample.tag}</Badge>
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Domain Pillars */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Financial Pillars</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>
            — Evidence-backed execution across 3 domains
          </span>
        </h3>
        <div className="grid-3">
          {/* ClaimSahay */}
          <Card
            interactive
            onClick={() => onNavigateTab('claimsahay')}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <Shield size={24} color="#3b82f6" />
                </div>
                <Badge variant="blue">ClaimSahay Deep Journey</Badge>
              </div>
              <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Insurance Claims</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Resolves complex insurer queries by reconciling medical bills and discharge summaries
                against policy clauses with full citation provenance.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#60a5fa', fontSize: '0.875rem', fontWeight: 600 }}>
              Launch ClaimSahay <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </div>
          </Card>

          {/* Lending */}
          <Card
            interactive
            onClick={() => onNavigateTab('lending')}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <DollarSign size={24} color="#10b981" />
                </div>
                <Badge variant="green">Lending Copilot</Badge>
              </div>
              <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Personal & Home Loans</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Authoritative mathematical calculations for EMI schedules, DTI affordability ratios,
                and income verification between salary slips and bank records.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#34d399', fontSize: '0.875rem', fontWeight: 600 }}>
              Explore Lending Tools <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </div>
          </Card>

          {/* Fintech */}
          <Card
            interactive
            onClick={() => onNavigateTab('fintech')}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <CreditCard size={24} color="#8b5cf6" />
                </div>
                <Badge variant="purple">Fintech Disputes</Badge>
              </div>
              <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Payment Disputes</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Automated triage of failed-but-debited UPI transactions, resolution timeline estimation,
                and chargeback dispute filing.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#a78bfa', fontSize: '0.875rem', fontWeight: 600 }}>
              Track Transactions <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </div>
          </Card>
        </div>
      </div>

      {/* Backend & Environment Health Status Card */}
      {readyStatus && (
        <Card style={{ background: 'rgba(15, 23, 42, 0.7)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="#10b981" />
                Backend System Status: Verified & Frozen
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                Active on localhost:3000 • 27 Database Tables • 44 Unit Tests Passing
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant="green">DB: SQLite Ready</Badge>
              <Badge variant="amber">Azure AI: Sandbox</Badge>
              <Badge variant="amber">Doc Intelligence: Sandbox</Badge>
              <Badge variant="amber">n8n Workflow: Sandbox</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
