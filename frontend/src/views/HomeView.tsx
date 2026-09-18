import React, { useState } from 'react';
import {
  Shield,
  DollarSign,
  CreditCard,
  ArrowRight,
  FileCheck,
  Sparkles,
  LifeBuoy,
  Lock,
  CheckCircle2,
} from 'lucide-react';
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

  const domainCards = [
    {
      domain: 'INSURANCE' as const,
      tab: 'claimsahay',
      title: 'Insurance',
      subtitle: 'Claims, policies and coverage',
      prompt: "My hospital claim was queried/rejected and I don't understand what is missing.",
      image: '/images/hero-insurance.jpg',
      icon: Shield,
      badge: 'ClaimSahay Engine',
      cta: 'Explore Claim Journey',
    },
    {
      domain: 'LENDING' as const,
      tab: 'lending',
      title: 'Lending',
      subtitle: 'Borrowing and affordability journeys',
      prompt: 'I need a home renovation loan of ₹10 Lakhs for 5 years.',
      image: '/images/hero-lending.jpg',
      icon: DollarSign,
      badge: 'Deterministic Math',
      cta: 'Calculate Affordability',
    },
    {
      domain: 'FINTECH' as const,
      tab: 'fintech',
      title: 'Fintech',
      subtitle: 'Payments and everyday financial services',
      prompt: 'My UPI payment of ₹4,999 failed but money was debited from my account.',
      image: '/images/hero-fintech.jpg',
      icon: CreditCard,
      badge: 'Dispute Triage',
      cta: 'Triage Payment Dispute',
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 10. HERO SECTION: 2-Column Responsive Layout */}
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <Sparkles size={13} />
            <span>AI Financial Journey Copilot</span>
          </div>

          <h1 className="hero-heading">
            One conversation.<br />
            Every financial goal.
          </h1>

          <p className="hero-supporting">
            AI-powered guidance across insurance, lending and fintech. File disputes, evaluate borrowing limits, and resolve transactions with deterministic evidence.
          </p>

          {/* Primary Input Container */}
          <form onSubmit={handleStart} style={{ width: '100%', maxWidth: '540px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '0.375rem 0.5rem 0.375rem 0.875rem',
                boxShadow: 'var(--shadow-card)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            >
              <input
                type="text"
                placeholder="e.g. My hospital claim was queried, what is missing?"
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

          {/* Prompt Suggestion Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Try:</span>
            {[
              { label: 'Room Rent Dispute', text: "My hospital claim was queried and room rent was capped at ₹5,000/day.", domain: 'INSURANCE' as const },
              { label: '₹10L Home Loan EMI', text: 'I need a home renovation loan of ₹10 Lakhs for 5 years.', domain: 'LENDING' as const },
              { label: 'Failed UPI Debit', text: 'My UPI payment of ₹4,999 failed but money was debited from my account.', domain: 'FINTECH' as const },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onStartJourney(chip.text, chip.domain)}
                className="btn-ghost"
                style={{
                  padding: '0.2rem 0.6rem',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  color: '#334155',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Sophisticated Blended Financial Artwork */}
        <div className="hero-visual-card">
          <img
            src="/images/hero-home.jpg"
            alt="AI Financial Intelligence Visual"
            loading="eager"
          />
          <div className="hero-visual-overlay" />
        </div>
      </div>

      {/* 3. FINANCIAL TRUST STRIP */}
      <div className="trust-strip">
        <div className="trust-item">
          <div className="trust-icon-box">
            <Shield size={16} />
          </div>
          <div>
            <strong style={{ fontSize: '0.8125rem', color: '#0F172A', display: 'block' }}>
              Policy-Aware Guidance
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Grounded in verified policy schedules
            </span>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon-box">
            <FileCheck size={16} />
          </div>
          <div>
            <strong style={{ fontSize: '0.8125rem', color: '#0F172A', display: 'block' }}>
              Secure Document Intelligence
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Deterministic OCR fact provenance
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
              Plain-English reasoning with citations
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
              Seamless specialist handoff
            </span>
          </div>
        </div>
      </div>

      {/* 10. THREE VISUAL DOMAIN CARDS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0F172A' }}>
              Specialized Financial Domains
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
              Explore deep workflows tailored for complex retail banking and health insurance problems.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {domainCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => onStartJourney(card.prompt, card.domain)}
                className="card card-interactive"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '18px',
                }}
              >
                {/* Artwork Thumbnail Container */}
                <div style={{ position: 'relative', height: '140px', width: '100%', overflow: 'hidden', background: '#F1F5F9' }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.35) 100%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(4px)',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.1)',
                      }}
                    >
                      <Icon size={12} color="#2563EB" />
                      <span>{card.title}</span>
                    </span>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: '#FFFFFF',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                      {card.title}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                      {card.subtitle}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '0.875rem',
                      borderTop: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8125rem',
                      color: '#2563EB',
                      fontWeight: 600,
                    }}
                  >
                    <span>{card.cta}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
