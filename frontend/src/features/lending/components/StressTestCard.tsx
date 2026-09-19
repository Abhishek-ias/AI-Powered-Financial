import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { LendingEMIResult, LendingAffordabilityResult } from '../../../types';

interface StressTestCardProps {
  monthlyIncome: number;
  existingEMI: number;
  monthlyExpenses: number;
  emiResult: LendingEMIResult;
  affordResult: LendingAffordabilityResult;
}

type StressScenarioKey = 'baseline' | 'income_down_10' | 'income_down_20' | 'expenses_up_15' | 'unexpected_shock';

interface ScenarioDef {
  key: StressScenarioKey;
  label: string;
  description: string;
  incomeDropPct: number;
  expenseIncreasePct: number;
  unexpectedAmount: number;
}

const SCENARIOS: ScenarioDef[] = [
  {
    key: 'baseline',
    label: 'Baseline Plan',
    description: 'Current declared income and living costs',
    incomeDropPct: 0,
    expenseIncreasePct: 0,
    unexpectedAmount: 0,
  },
  {
    key: 'income_down_10',
    label: 'Income Down 10%',
    description: 'Modest slowdown or reduced variable pay',
    incomeDropPct: 0.10,
    expenseIncreasePct: 0,
    unexpectedAmount: 0,
  },
  {
    key: 'income_down_20',
    label: 'Income Down 20%',
    description: 'Significant career gap or salary adjustment',
    incomeDropPct: 0.20,
    expenseIncreasePct: 0,
    unexpectedAmount: 0,
  },
  {
    key: 'expenses_up_15',
    label: 'Living Costs +15%',
    description: 'Inflation shock across household essentials',
    incomeDropPct: 0,
    expenseIncreasePct: 0.15,
    unexpectedAmount: 0,
  },
  {
    key: 'unexpected_shock',
    label: '+₹5,000 Shock',
    description: 'Unexpected recurring medical or family support cost',
    incomeDropPct: 0,
    expenseIncreasePct: 0,
    unexpectedAmount: 5000,
  },
];

const inr = (n: number) =>
  `₹${Math.round(n).toLocaleString('en-IN')}`;

export const StressTestCard: React.FC<StressTestCardProps> = ({
  monthlyIncome,
  existingEMI,
  monthlyExpenses,
  emiResult,
}) => {
  const [activeScenarioKey, setActiveScenarioKey] = useState<StressScenarioKey>('income_down_10');

  const newEMI = emiResult.monthlyEMI;
  const baseTotalCommitments = existingEMI + newEMI + monthlyExpenses;
  const baseBuffer = monthlyIncome - baseTotalCommitments;

  const activeScenario = SCENARIOS.find((s) => s.key === activeScenarioKey) || SCENARIOS[1];

  // Recalculate under the active scenario
  const simIncome = monthlyIncome * (1 - activeScenario.incomeDropPct);
  const simExpenses = monthlyExpenses * (1 + activeScenario.expenseIncreasePct) + activeScenario.unexpectedAmount;
  const simCommitments = existingEMI + newEMI + simExpenses;
  const simBuffer = simIncome - simCommitments;
  const simDti = simIncome > 0 ? ((existingEMI + newEMI) / simIncome) * 100 : 100;
  const bufferDelta = simBuffer - baseBuffer;

  const isResilient = simBuffer >= simIncome * 0.10 && simDti <= 50;
  const isTight = simBuffer >= 0 && !isResilient;
  const isDeficit = simBuffer < 0;

  return (
    <Card
      id="lending-stress-test-section"
      style={{
        padding: '1.75rem',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 2px 10px rgba(20,35,28,0.05)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Activity size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-primary)' }}>
              Scenario Simulation
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            HOW WOULD THIS PLAN HOLD UP?
          </h3>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <Info size={12} />
          <span>Simulation · Not a guaranteed forecast</span>
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
        Test how your plan weathers unexpected life events before taking on a multi-year repayment commitment.
      </p>

      {/* Scenario Selector Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {SCENARIOS.map((sc) => {
          const isActive = sc.key === activeScenarioKey;
          return (
            <button
              key={sc.key}
              type="button"
              onClick={() => setActiveScenarioKey(sc.key)}
              style={{
                padding: '0.45rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isActive ? 'var(--color-primary)' : 'var(--border-subtle)',
                background: isActive ? 'var(--primary-subtle)' : '#FFFFFF',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {sc.label}
            </button>
          );
        })}
      </div>

      {/* Simulation Results Card */}
      <div
        style={{
          background: 'var(--neutral-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
              Active Simulation: {activeScenario.label}
            </span>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
              {activeScenario.description}
            </div>
          </div>

          <Badge variant={isDeficit ? 'red' : isTight ? 'amber' : 'green'}>
            {isDeficit ? 'Deficit Warning' : isTight ? 'Narrow Margin' : 'Resilient Plan'}
          </Badge>
        </div>

        {/* Metric Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Simulated Income</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
              {inr(simIncome)}
            </div>
            {activeScenario.incomeDropPct > 0 && (
              <div style={{ fontSize: '0.6875rem', color: '#DC2626', marginTop: '0.15rem' }}>
                -{activeScenario.incomeDropPct * 100}% from baseline
              </div>
            )}
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Simulated Commitments</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
              {inr(simCommitments)}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
              EMIs + Expenses
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Simulated Buffer</div>
            <div
              style={{
                fontSize: '1.0625rem',
                fontWeight: 800,
                color: simBuffer >= 0 ? 'var(--color-primary)' : '#DC2626',
                fontFamily: 'var(--font-mono)',
                marginTop: '0.15rem',
              }}
            >
              {inr(simBuffer)}
            </div>
            <div style={{ fontSize: '0.6875rem', color: bufferDelta < 0 ? '#DC2626' : 'var(--color-text-muted)', marginTop: '0.15rem' }}>
              {bufferDelta < 0 ? `${inr(bufferDelta)} vs baseline` : 'Baseline level'}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Simulated DTI</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: simDti > 50 ? '#DC2626' : 'var(--color-text)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
              {simDti.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
              50% ceiling threshold
            </div>
          </div>
        </div>

        {/* Plain Language Interpretation */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {isDeficit ? (
            <>
              <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <span>
                <strong>Deficit Alert:</strong> Under this simulated scenario, your total commitments exceed monthly income by {inr(Math.abs(simBuffer))}. Consider building at least 3–6 months of EMI reserve fund or reducing the borrowed principal upfront.
              </span>
            </>
          ) : isTight ? (
            <>
              <AlertTriangle size={16} color="var(--color-secondary)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <span>
                <strong>Tight Margin:</strong> This shock leaves an estimated monthly buffer of {inr(simBuffer)}. While still solvent, your discretionary safety margin would be significantly compressed.
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <span>
                <strong>Healthy Buffer:</strong> Your plan remains sustainable under this scenario, retaining an estimated monthly buffer of {inr(simBuffer)} after fulfilling all obligations.
              </span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
