import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCode,
  Shield,
  Layers,
  Info,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { LendingEMIResult, LendingAffordabilityResult } from '../../../types';

interface LendingExplainabilityCardProps {
  monthlyIncome: number;
  existingEMI: number;
  monthlyExpenses: number;
  emiResult: LendingEMIResult;
  affordResult: LendingAffordabilityResult;
}

const inr = (n: number, dec = 0) =>
  `₹${Math.round(n).toLocaleString('en-IN', { maximumFractionDigits: dec, minimumFractionDigits: dec })}`;

export const LendingExplainabilityCard: React.FC<LendingExplainabilityCardProps> = ({
  monthlyIncome,
  existingEMI,
  monthlyExpenses,
  emiResult,
  affordResult,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF' }}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          background: 'var(--bg-surface-secondary)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--color-text)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={16} color="var(--color-primary)" />
          <span>HOW DID WE REACH THIS? (Calculation &amp; Policy Logic)</span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Formula explanation */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              Standard Reducing Balance Method
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
              Your EMI is calculated deterministically on the backend using the financial reducing-balance formula:
            </p>
            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--neutral-bg)', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-primary)' }}>
              EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
              Where Principal P = {inr(emiResult.principal)}, monthly rate r = {(emiResult.annualRate / 12 / 100).toFixed(6)}, and tenure n = {emiResult.tenureMonths} months.
            </div>
          </div>

          {/* DTI & Thresholds */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Debt-to-Income (DTI) Ratio</span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.125rem' }}>
                {affordResult.dtiPercent.toFixed(1)}%
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>(Existing EMIs + New EMI) / Monthly Income</span>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Regulatory Threshold (FOIR)</span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.125rem' }}>
                {affordResult.maxDtiPercent}% Maximum
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>RBI prudential affordability limit</span>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Max Recommended Repayment</span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.125rem' }}>
                {inr(affordResult.maxRecommendedEMI, 2)}
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Permissible EMI under 50% DTI</span>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Declared Monthly Living Expenses</span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.125rem' }}>
                {inr(monthlyExpenses)}
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>User-entered household baseline</span>
            </div>
          </div>

          {/* Assumption disclosures */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.875rem 1rem', borderRadius: '8px', fontSize: '0.75rem', color: '#92400E', lineHeight: 1.5 }}>
            <strong>Assumptions &amp; Regulatory Disclaimers:</strong>
            <ul style={{ margin: '0.375rem 0 0', paddingLeft: '1.125rem' }}>
              <li>Fixed annual percentage rate is assumed constant throughout the tenure.</li>
              <li>Processing fees, stamp duties, documentation charges, and insurance premiums are not included.</li>
              <li>Affordability results do not guarantee loan sanction; final credit approval is subject to institutional underwriting, bureau score checks, and physical verification.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
