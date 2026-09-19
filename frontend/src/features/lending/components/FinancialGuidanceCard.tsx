import React from 'react';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ShieldAlert,
  Sparkles,
  Sliders,
  DollarSign,
  Clock,
  Activity,
  Edit3,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { LendingEMIResult, LendingAffordabilityResult } from '../../../types';

interface FinancialGuidanceCardProps {
  monthlyIncome: number;
  existingEMI: number;
  monthlyExpenses: number;
  emiResult: LendingEMIResult;
  affordResult: LendingAffordabilityResult;
  onOptionSelect: (option: 'increase_downpayment' | 'reduce_loan' | 'compare_tenure' | 'run_stress_test' | 'edit_details') => void;
}

const inr = (n: number, dec = 0) =>
  `₹${Math.round(n).toLocaleString('en-IN', { maximumFractionDigits: dec, minimumFractionDigits: dec })}`;

export const FinancialGuidanceCard: React.FC<FinancialGuidanceCardProps> = ({
  monthlyIncome,
  existingEMI,
  monthlyExpenses,
  emiResult,
  affordResult,
  onOptionSelect,
}) => {
  const newEMI = emiResult.monthlyEMI;
  const totalCommitments = existingEMI + newEMI + monthlyExpenses;
  const monthlyBuffer = monthlyIncome - totalCommitments;
  const bufferPercentage = monthlyIncome > 0 ? (monthlyBuffer / monthlyIncome) * 100 : 0;
  const dtiPercent = affordResult.dtiPercent;

  // Derive pressure category
  let pressureCategory: 'LOWER' | 'MODERATE' | 'HIGH' = 'LOWER';
  if (monthlyBuffer < monthlyIncome * 0.05 || dtiPercent > 50) {
    pressureCategory = 'HIGH';
  } else if (monthlyBuffer < monthlyIncome * 0.20 || dtiPercent > 40) {
    pressureCategory = 'MODERATE';
  }

  // Interpretations
  const getExplanation = () => {
    switch (pressureCategory) {
      case 'LOWER':
        return "Based on the figures you've entered, the plan leaves a larger monthly buffer. Your projected repayments represent a manageable portion of your stated monthly income.";
      case 'MODERATE':
        return "Your plan leaves a smaller monthly buffer after the expenses you've entered. Consider comparing a lower loan amount or larger down payment.";
      case 'HIGH':
        return "Your listed commitments leave limited monthly room under these assumptions. Consider reducing the amount borrowed or increasing the upfront contribution.";
    }
  };

  const getGuidanceStatement = () => {
    switch (pressureCategory) {
      case 'LOWER':
        return "Your plan appears less sensitive to normal cash flow fluctuations. Review your monthly expenses and emergency savings before taking on the commitment.";
      case 'MODERATE':
        return "Consider increasing your down payment to reduce the monthly repayment, or compare a slightly lower loan amount before proceeding.";
      case 'HIGH':
        return "We recommend exploring a lower borrowing principal or comparing an extended repayment period to keep monthly commitments sustainable.";
    }
  };

  const badgeProps = {
    LOWER: { variant: 'green' as const, label: 'Manageable Cash Flow' },
    MODERATE: { variant: 'amber' as const, label: 'Moderate Cash Flow Pressure' },
    HIGH: { variant: 'red' as const, label: 'Tight Cash Flow Buffer' },
  }[pressureCategory];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── 1. MAIN GUIDANCE CARD ── */}
      <Card
        style={{
          padding: '1.75rem',
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 10px rgba(20,35,28,0.05)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Wallet size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-primary)' }}>
                Personalized Assessment
              </span>
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              YOUR FINANCIAL GUIDANCE
            </h2>
          </div>

          <Badge variant={badgeProps.variant}>
            {badgeProps.label}
          </Badge>
        </div>

        {/* ── 2. WHAT WE FOUND ── */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.875rem' }}>
            What We Found
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {/* Monthly Income */}
            <div style={{ background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.875rem 1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Monthly income</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                {inr(monthlyIncome)}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.25rem' }}>Declared net take-home</div>
            </div>

            {/* Existing EMIs */}
            <div style={{ background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.875rem 1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Existing loan payments</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                {inr(existingEMI)}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.25rem' }}>Current obligations</div>
            </div>

            {/* New Estimated EMI */}
            <div style={{ background: 'var(--primary-subtle)', border: '1px solid var(--primary-border)', borderRadius: '12px', padding: '0.875rem 1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>New estimated EMI</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                {inr(newEMI)}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-primary)', opacity: 0.85, marginTop: '0.25rem' }}>Backend calculated</div>
            </div>

            {/* Listed Monthly Expenses */}
            <div style={{ background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.875rem 1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Listed monthly expenses</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                {inr(monthlyExpenses)}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.25rem' }}>Household &amp; living</div>
            </div>

            {/* Estimated Monthly Buffer */}
            <div
              style={{
                background: monthlyBuffer >= 0 ? 'var(--secondary-subtle)' : '#FEF2F2',
                border: `1px solid ${monthlyBuffer >= 0 ? 'var(--secondary-border)' : '#FCA5A5'}`,
                borderRadius: '12px',
                padding: '0.875rem 1rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: monthlyBuffer >= 0 ? 'var(--secondary-text)' : '#991B1B', fontWeight: 600, marginBottom: '0.25rem' }}>
                Estimated monthly buffer
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: monthlyBuffer >= 0 ? 'var(--secondary-text)' : '#991B1B', fontFamily: 'var(--font-mono)' }}>
                {inr(monthlyBuffer)}
              </div>
              <div style={{ fontSize: '0.6875rem', color: monthlyBuffer >= 0 ? 'var(--secondary-text)' : '#991B1B', opacity: 0.85, marginTop: '0.25rem' }}>
                {bufferPercentage.toFixed(0)}% of income remaining
              </div>
            </div>
          </div>
        </div>

        {/* ── 7. TOTAL MONTHLY COMMITMENT VIEW ── */}
        <div
          style={{
            background: 'var(--neutral-bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            Total Monthly Commitment Breakdown
          </div>

          {/* Equation Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <span style={{ padding: '0.25rem 0.5rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              Existing EMIs: <strong>{inr(existingEMI)}</strong>
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>+</span>
            <span style={{ padding: '0.25rem 0.5rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              New EMI: <strong>{inr(newEMI)}</strong>
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>+</span>
            <span style={{ padding: '0.25rem 0.5rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              Listed Expenses: <strong>{inr(monthlyExpenses)}</strong>
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>=</span>
            <span style={{ padding: '0.25rem 0.65rem', background: 'var(--primary-subtle)', color: 'var(--color-primary)', borderRadius: '6px', border: '1px solid var(--primary-border)', fontWeight: 700 }}>
              Estimated Commitments: {inr(totalCommitments)}
            </span>
          </div>

          {/* Buffer Bar Representation */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
              <span>Monthly Income Distribution</span>
              <span>Total Commitments: {((totalCommitments / monthlyIncome) * 100).toFixed(0)}% · Free Buffer: {bufferPercentage.toFixed(0)}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
              {/* Existing EMI segment */}
              <div
                style={{ width: `${Math.min(100, (existingEMI / monthlyIncome) * 100)}%`, background: 'var(--color-tertiary)' }}
                title="Existing Loans"
              />
              {/* New EMI segment */}
              <div
                style={{ width: `${Math.min(100, (newEMI / monthlyIncome) * 100)}%`, background: 'var(--color-primary)' }}
                title="New Loan EMI"
              />
              {/* Living expenses segment */}
              <div
                style={{ width: `${Math.min(100, (monthlyExpenses / monthlyIncome) * 100)}%`, background: 'var(--color-secondary)' }}
                title="Household Expenses"
              />
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-tertiary)' }} /> Existing EMIs ({((existingEMI / monthlyIncome) * 100).toFixed(0)}%)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} /> New EMI ({((newEMI / monthlyIncome) * 100).toFixed(0)}%)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-secondary)' }} /> Expenses ({((monthlyExpenses / monthlyIncome) * 100).toFixed(0)}%)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1' }} /> Uncommitted Buffer ({bufferPercentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. WHAT THIS MEANS & 4. OUR GUIDANCE ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {/* What this means */}
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
              <TrendingUp size={15} />
              <strong style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                What This Means
              </strong>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
              {getExplanation()}
            </p>
          </div>

          {/* Our guidance */}
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
              <Sparkles size={15} />
              <strong style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Our Guidance
              </strong>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
              {getGuidanceStatement()}
            </p>
          </div>
        </div>

        {/* ── 5. YOUR OPTIONS ── */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            Your Options — Explore Scenarios
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0 0 0.875rem' }}>
            Click an option below to dynamically adjust your plan and compare affordability:
          </p>

          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onOptionSelect('increase_downpayment')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', gap: '0.375rem' }}
            >
              <DollarSign size={14} color="var(--color-primary)" />
              <span>Increase Down Payment</span>
            </button>

            <button
              type="button"
              onClick={() => onOptionSelect('reduce_loan')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', gap: '0.375rem' }}
            >
              <ArrowDownRight size={14} color="var(--color-primary)" />
              <span>Reduce Loan Amount (-15%)</span>
            </button>

            <button
              type="button"
              onClick={() => onOptionSelect('compare_tenure')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', gap: '0.375rem' }}
            >
              <Clock size={14} color="var(--color-primary)" />
              <span>Compare Repayment Period</span>
            </button>

            <button
              type="button"
              onClick={() => onOptionSelect('run_stress_test')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', gap: '0.375rem' }}
            >
              <Activity size={14} color="var(--color-primary)" />
              <span>Run Stress Test</span>
            </button>

            <button
              type="button"
              onClick={() => onOptionSelect('edit_details')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', gap: '0.375rem' }}
            >
              <Edit3 size={14} color="var(--color-primary)" />
              <span>Edit Financial Details</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
