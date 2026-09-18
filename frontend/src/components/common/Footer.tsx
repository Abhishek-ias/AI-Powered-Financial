import React from 'react';
import { Shield, Lock, FileCheck, LifeBuoy, HeartHandshake, CheckCircle2 } from 'lucide-react';

export interface FooterProps {
  onNavigateTab?: (tab: 'home' | 'claimsahay' | 'lending' | 'fintech' | 'journeys' | 'support') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        {/* Security / Trust Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            paddingBottom: '2.5rem',
            marginBottom: '2.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="trust-icon-box">
              <Shield size={16} />
            </div>
            <div>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'block' }}>
                SafeGuard Policy Schedule
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Adjudication protocol v2024-v1 active
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="trust-icon-box">
              <Lock size={16} />
            </div>
            <div>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'block' }}>
                Cryptographic Audit Trail
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                SHA-256 state transition verification
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="trust-icon-box">
              <FileCheck size={16} />
            </div>
            <div>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'block' }}>
                Deterministic Fact Extraction
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                OCR confidence provenance scoring
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="trust-icon-box">
              <LifeBuoy size={16} />
            </div>
            <div>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'block' }}>
                Human Specialist Escort
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Seamless handoff with 15-field context
              </span>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Shield size={16} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                ClaimSahay
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '320px' }}>
              Institutional financial journey copilot providing deterministic intelligence for insurance claim disputes, loan affordability, and transaction triage.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.2rem 0.55rem',
                  background: '#DCFCE7',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  borderRadius: '9999px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={11} /> Sandbox Ready
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• Team NOVA Platform</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
              Financial Journeys
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('claimsahay')}
                className="btn-ghost"
                style={{ padding: '0.25rem 0', justifyContent: 'flex-start', color: 'var(--text-secondary)' }}
              >
                ClaimSahay Insurance Dispute
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('lending')}
                className="btn-ghost"
                style={{ padding: '0.25rem 0', justifyContent: 'flex-start', color: 'var(--text-secondary)' }}
              >
                Lending & EMI Calculator
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('fintech')}
                className="btn-ghost"
                style={{ padding: '0.25rem 0', justifyContent: 'flex-start', color: 'var(--text-secondary)' }}
              >
                Payment & UPI Disputes
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('journeys')}
                className="btn-ghost"
                style={{ padding: '0.25rem 0', justifyContent: 'flex-start', color: 'var(--text-secondary)' }}
              >
                Cryptographic Audit Log
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
              Governance & Safety
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <div>Prompt Barrier Enforced</div>
              <div>Consequential Approval Gate</div>
              <div>Role-Based Access Control</div>
              <div>No-Source Rag Grounding</div>
              <div>Deterministic Math Engine</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
              Specialist Desk
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('support')}
                className="btn-ghost"
                style={{ padding: '0.25rem 0', justifyContent: 'flex-start', color: 'var(--text-secondary)' }}
              >
                Human Support Queue
              </button>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4 }}>
                Escalations package comprehensive 15-field context with zero manual re-explanation.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © 2026 Team NOVA. AI Financial Journey Copilot. All rights reserved.
          </div>
          <div>
            Sandbox Demo simulation only. No real financial debits or binding policy determinations are executed.
          </div>
        </div>
      </div>
    </footer>
  );
};
