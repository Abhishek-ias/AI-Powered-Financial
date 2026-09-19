import React, { useState, useEffect } from 'react';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Shield,
  Eye,
  Users,
  Car,
  Wallet,
  Sparkles,
  Sliders,
  DollarSign,
  Info,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { lendingApi } from '../../api/lending';
import { LendingEMIResult, LendingAffordabilityResult } from '../../types';
import {
  FinancialGuidanceCard,
  StressTestCard,
  VehicleOwnershipCard,
  FinancialCoachChat,
  LendingExplainabilityCard,
} from './components';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inr = (n: number, dec = 0) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: dec, minimumFractionDigits: dec })}`;

// ─── Step Indicator ───────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ current: number }> = ({ current }) => {
  const steps = ['Loan details', 'Income & expenses', 'Affordability & guidance'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem' }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: done ? 'var(--color-primary)' : active ? 'var(--primary-subtle)' : 'var(--bg-surface-secondary)',
                border: active ? '2px solid var(--color-primary)' : done ? 'none' : '1.5px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}>
                {done ? (
                  <CheckCircle2 size={14} color="#fff" strokeWidth={3} />
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                    {num}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: active ? 600 : 400,
                color: done ? 'var(--color-text)' : active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: done ? 'var(--color-primary)' : 'var(--border-subtle)',
                margin: '0 0.5rem',
                marginBottom: '1rem',
                transition: 'background 0.3s ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const LendingView: React.FC = () => {
  // Inputs — initialized to the standard verified scenario
  const [principal, setPrincipal] = useState(800000);
  const [rate, setRate] = useState(9.5);
  const [tenure, setTenure] = useState(60);
  const [monthlyIncome, setMonthlyIncome] = useState(70500);
  const [existingEMI, setExistingEMI] = useState(5000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(30000);

  // Vehicle Mode (Cost of Ownership)
  const [isVehicleMode, setIsVehicleMode] = useState(false);
  const [carPrice, setCarPrice] = useState(1000000);
  const [downPayment, setDownPayment] = useState(200000);
  const [monthlyInsurance, setMonthlyInsurance] = useState(3000);
  const [monthlyFuel, setMonthlyFuel] = useState(5000);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState(2000);
  const [monthlyParkingTolls, setMonthlyParkingTolls] = useState(1000);

  // Results
  const [emiResult, setEmiResult] = useState<LendingEMIResult | null>(null);
  const [affordResult, setAffordResult] = useState<LendingAffordabilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showTrust, setShowTrust] = useState(false);

  // Derived: current step for stepper
  const currentStep = emiResult ? 3 : 1;

  const handleCalculate = async (overrides?: {
    principal?: number;
    rate?: number;
    tenure?: number;
    income?: number;
    existing?: number;
    expenses?: number;
  }) => {
    setLoading(true);
    setError(null);
    const p = overrides?.principal ?? principal;
    const r = overrides?.rate ?? rate;
    const t = overrides?.tenure ?? tenure;
    const inc = overrides?.income ?? monthlyIncome;
    const ext = overrides?.existing ?? existingEMI;

    try {
      // POST /api/lending/calculate-emi — unchanged backend API
      const emi = await lendingApi.calculateEMI(p, r, t);
      setEmiResult(emi);
      // POST /api/lending/affordability — unchanged backend API
      const afford = await lendingApi.checkAffordability(inc, ext, emi.monthlyEMI);
      setAffordResult(afford);
    } catch (err: any) {
      setError(err.message || 'Calculation failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Run calculation on initial mount to populate the financial guidance view immediately
  useEffect(() => {
    handleCalculate();
  }, []);

  // When Vehicle Mode is enabled, automatically calculate loan = carPrice - downPayment
  const handleToggleVehicleMode = (enabled: boolean) => {
    setIsVehicleMode(enabled);
    if (enabled) {
      const derivedLoan = Math.max(50000, carPrice - downPayment);
      setPrincipal(derivedLoan);
      handleCalculate({ principal: derivedLoan });
    }
  };

  const handleCarPriceChange = (price: number) => {
    setCarPrice(price);
    const newPrincipal = Math.max(50000, price - downPayment);
    setPrincipal(newPrincipal);
  };

  const handleDownPaymentChange = (dp: number) => {
    setDownPayment(dp);
    const newPrincipal = Math.max(50000, carPrice - dp);
    setPrincipal(newPrincipal);
  };

  // Interactive Options handler
  const handleOptionSelect = (
    option: 'increase_downpayment' | 'reduce_loan' | 'compare_tenure' | 'run_stress_test' | 'edit_details'
  ) => {
    if (option === 'increase_downpayment') {
      if (!isVehicleMode) {
        setIsVehicleMode(true);
        const newDp = 250000;
        const newCarPrice = principal + newDp;
        setCarPrice(newCarPrice);
        setDownPayment(newDp);
        handleCalculate({ principal });
      } else {
        const newDp = downPayment + 50000;
        setDownPayment(newDp);
        const newLoan = Math.max(50000, carPrice - newDp);
        setPrincipal(newLoan);
        handleCalculate({ principal: newLoan });
      }
    } else if (option === 'reduce_loan') {
      const newPrincipal = Math.max(50000, Math.round((principal * 0.85) / 10000) * 10000);
      setPrincipal(newPrincipal);
      if (isVehicleMode) {
        setDownPayment(carPrice - newPrincipal);
      }
      handleCalculate({ principal: newPrincipal });
    } else if (option === 'compare_tenure') {
      const nextTenure = tenure === 60 ? 84 : tenure === 36 ? 48 : tenure === 48 ? 60 : 60;
      setTenure(nextTenure);
      handleCalculate({ tenure: nextTenure });
    } else if (option === 'run_stress_test') {
      document.getElementById('stress-test-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (option === 'edit_details') {
      document.getElementById('loan-input-form')?.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('principal-input-field')?.focus();
    }
  };

  const isAffordable = affordResult?.isAffordable ?? false;
  const statusColor = isAffordable ? '#2E7D5B' : '#B7791F';
  const statusBg = isAffordable ? '#EAF4EE' : '#FEF8EC';
  const statusBorder = isAffordable ? '#B7DEC8' : '#F3DBA8';

  const totalMonthlyCommitments = affordResult
    ? affordResult.requestedEMI + affordResult.existingEMI + monthlyExpenses
    : 0;
  const monthlyBuffer = affordResult
    ? affordResult.monthlyIncome - totalMonthlyCommitments
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── HERO ── */}
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <Calculator size={13} />
            <span>Borrowing Journey & Financial Guidance</span>
          </div>

          <h1 className="hero-heading" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}>
            Personalized borrowing<br />
            & affordability copilot.
          </h1>

          <p className="hero-supporting">
            Understand your monthly cash flow, stress-test your repayment plan against unexpected shocks, and explore prudent options with zero credit impact.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.65rem', background: 'var(--primary-subtle)', border: '1px solid var(--primary-border)', borderRadius: '9999px', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              Deterministic Calculations
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.65rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '9999px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Zero Credit Impact
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.65rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '9999px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              50% FOIR Safeguard
            </span>
          </div>
        </div>

        <div className="hero-visual-card">
          <img src="/images/hero-lending.jpg" alt="Borrowing journey visual" loading="eager" />
          <div className="hero-visual-overlay" />
        </div>
      </div>

      {/* ── MAIN JOURNEY GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>

        {/* ── LEFT: Guided Input Form ── */}
        <Card id="loan-input-form" style={{ padding: '2rem' }}>
          <StepIndicator current={currentStep} />

          {/* Mode Selector (General Loan vs Vehicle Loan) */}
          <div style={{ marginBottom: '1.5rem', background: 'var(--bg-surface-secondary)', padding: '0.375rem', borderRadius: '10px', display: 'flex', gap: '0.375rem' }}>
            <button
              type="button"
              onClick={() => handleToggleVehicleMode(false)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                border: 'none',
                borderRadius: '8px',
                background: !isVehicleMode ? '#FFFFFF' : 'transparent',
                boxShadow: !isVehicleMode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                color: !isVehicleMode ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: !isVehicleMode ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Standard Loan
            </button>
            <button
              type="button"
              onClick={() => handleToggleVehicleMode(true)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                border: 'none',
                borderRadius: '8px',
                background: isVehicleMode ? '#FFFFFF' : 'transparent',
                boxShadow: isVehicleMode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                color: isVehicleMode ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: isVehicleMode ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}
            >
              <Car size={14} />
              Vehicle / Car Mode
            </button>
          </div>

          {/* STEP 1 — Loan Details */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#fff' }}>1</span>
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                {isVehicleMode ? 'Vehicle & Loan Parameters' : 'Loan details'}
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginLeft: '1.75rem', marginBottom: '1.25rem' }}>
              {isVehicleMode ? 'Configure car on-road price, down payment, and loan terms.' : "Tell us what you're looking to borrow."}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {/* If Vehicle Mode: Car Price and Down Payment */}
              {isVehicleMode ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                        Car on-road price
                      </label>
                      <input
                        type="number"
                        value={carPrice}
                        onChange={(e) => handleCarPriceChange(Number(e.target.value))}
                        className="input-text"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem', display: 'block', fontWeight: 500 }}>
                        {inr(carPrice)}
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                        Down payment
                      </label>
                      <input
                        type="number"
                        value={downPayment}
                        onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                        className="input-text"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                        {carPrice > 0 ? `${((downPayment / carPrice) * 100).toFixed(0)}% of price` : inr(downPayment)}
                      </span>
                    </div>
                  </div>

                  {/* Derived Loan Principal */}
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--primary-subtle)', borderRadius: '8px', border: '1px solid var(--primary-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                      Derived Loan Amount:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                      {inr(principal)}
                    </span>
                  </div>
                </>
              ) : (
                /* Standard Loan Principal */
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                    Loan amount
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.4rem' }}>How much would you like to borrow?</p>
                  <input
                    id="principal-input-field"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="input-text"
                    placeholder="e.g. 8,00,000"
                  />
                  {principal > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem', display: 'block', fontWeight: 500 }}>
                      {inr(principal)}
                    </span>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Interest rate */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                    Interest rate
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.4rem' }}>Annual rate</p>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="input-text"
                      style={{ paddingRight: '2rem' }}
                    />
                    <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>%</span>
                  </div>
                </div>

                {/* Repayment period */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                    Repayment period
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.4rem' }}>Tenure duration</p>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="input-text"
                      style={{ paddingRight: '3.25rem' }}
                    />
                    <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginBottom: '1.75rem' }} />

          {/* STEP 2 — Income & Living Expenses */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#fff' }}>2</span>
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Monthly cash flow & commitments
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginLeft: '1.75rem', marginBottom: '1.25rem' }}>
              We compute your real monthly cushion using both existing EMIs and declared living costs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                    Take-home income
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.4rem' }}>Monthly post-tax</p>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="input-text"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem', display: 'block', fontWeight: 500 }}>
                    {inr(monthlyIncome)}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                    Existing loan EMIs
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.4rem' }}>Monthly debt obligations</p>
                  <input
                    type="number"
                    value={existingEMI}
                    onChange={(e) => setExistingEMI(Number(e.target.value))}
                    className="input-text"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    {inr(existingEMI)}
                  </span>
                </div>
              </div>

              {/* Listed Monthly Living Expenses */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                  Listed monthly expenses
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.4rem' }}>
                  Household, rent, groceries, utilities, and lifestyle expenses
                </p>
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  className="input-text"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  {inr(monthlyExpenses)} / month
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => handleCalculate()}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.8125rem 1.5rem', fontSize: '1rem', fontWeight: 600 }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '15px', height: '15px', borderTopColor: '#fff' }} />
                <span>Computing Guidance...</span>
              </>
            ) : (
              <>
                <span>Update Financial Guidance</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {error && (
            <div style={{ marginTop: '0.875rem', padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '0.8125rem', color: '#DC2626' }}>
              {error}
            </div>
          )}
        </Card>

        {/* ── RIGHT: Results & Guidance Cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {emiResult && affordResult ? (
            <>
              {/* 1. Hero EMI card */}
              <Card style={{ padding: '1.75rem', borderLeft: `4px solid ${statusColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)' }}>
                    Your estimated repayment
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    background: statusBg,
                    color: statusColor,
                    border: `1px solid ${statusBorder}`,
                  }}>
                    {isAffordable ? 'DTI Within 50% Limit' : 'Exceeds 50% Threshold'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {inr(emiResult.monthlyEMI, 2)}
                  </span>
                  <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 400 }}> / month</span>
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  For {emiResult.tenureMonths} months · {emiResult.annualRate}% annual interest · Principal: {inr(emiResult.principal)}
                </span>
              </Card>

              {/* 2. Affordability status */}
              <Card style={{ padding: '1.25rem 1.5rem', background: statusBg, border: `1px solid ${statusBorder}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  {isAffordable
                    ? <CheckCircle2 size={20} color={statusColor} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    : <AlertTriangle size={20} color={statusColor} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  }
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: statusColor, marginBottom: '0.2rem' }}>
                      {isAffordable
                        ? 'Within configured affordability criteria'
                        : 'Exceeds recommended affordability threshold'
                      }
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      Total debt obligations (Existing ₹{Math.round(existingEMI).toLocaleString('en-IN')} + New ₹{Math.round(emiResult.monthlyEMI).toLocaleString('en-IN')}) take up {affordResult.dtiPercent.toFixed(1)}% of your take-home pay (FOIR limit: {affordResult.maxDtiPercent}%).
                    </div>
                  </div>
                </div>
              </Card>

              {/* 3. Monthly Summary with Expenses & Net Buffer */}
              <Card style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Monthly Cash Flow Summary
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: 'Monthly take-home income', value: inr(affordResult.monthlyIncome), color: 'var(--color-text)' },
                    { label: '(-) Existing loan payments', value: inr(affordResult.existingEMI), color: 'var(--color-text-muted)' },
                    { label: '(-) Estimated new loan EMI', value: inr(affordResult.requestedEMI, 2), color: 'var(--color-primary)' },
                    { label: '(-) Listed monthly living expenses', value: inr(monthlyExpenses), color: 'var(--color-text-muted)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5625rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{label}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color, fontFamily: 'var(--font-mono)' }}>{value}</span>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0 0.25rem', borderBottom: '1px dashed var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      Total monthly commitments
                    </span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                      {inr(totalMonthlyCommitments, 2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0 0' }}>
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: monthlyBuffer >= 0 ? '#2E7D5B' : '#DC2626' }}>
                        Remaining monthly buffer
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Net uncommitted cash flow
                      </span>
                    </div>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: monthlyBuffer >= 0 ? '#2E7D5B' : '#DC2626', fontFamily: 'var(--font-mono)' }}>
                      {monthlyBuffer >= 0 ? `+${inr(monthlyBuffer, 2)}` : inr(monthlyBuffer, 2)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* 4. Financial Guidance Card (Personalized cash flow layer) */}
              <FinancialGuidanceCard
                monthlyIncome={monthlyIncome}
                existingEMI={existingEMI}
                monthlyExpenses={monthlyExpenses}
                emiResult={emiResult}
                affordResult={affordResult}
                onOptionSelect={handleOptionSelect}
              />

              {/* 5. Stress Test Card (Simulation layer) */}
              <div id="stress-test-section">
                <StressTestCard
                  monthlyIncome={monthlyIncome}
                  existingEMI={existingEMI}
                  monthlyExpenses={monthlyExpenses}
                  emiResult={emiResult}
                  affordResult={affordResult}
                />
              </div>

              {/* 6. Vehicle Cost of Ownership Card (when Vehicle Mode is enabled or toggled) */}
              {isVehicleMode && (
                <VehicleOwnershipCard
                  carPrice={carPrice}
                  downPayment={downPayment}
                  loanAmount={principal}
                  monthlyEMI={emiResult.monthlyEMI}
                  monthlyInsurance={monthlyInsurance}
                  monthlyFuel={monthlyFuel}
                  monthlyMaintenance={monthlyMaintenance}
                  monthlyParkingTolls={monthlyParkingTolls}
                  onUpdateCarPrice={handleCarPriceChange}
                  onUpdateDownPayment={handleDownPaymentChange}
                  onUpdateInsurance={setMonthlyInsurance}
                  onUpdateFuel={setMonthlyFuel}
                  onUpdateMaintenance={setMonthlyMaintenance}
                  onUpdateParkingTolls={setMonthlyParkingTolls}
                />
              )}

              {/* 7. Financial Coach Chat (Interactive Q&A) */}
              <FinancialCoachChat
                monthlyIncome={monthlyIncome}
                existingEMI={existingEMI}
                monthlyExpenses={monthlyExpenses}
                emiResult={emiResult}
                affordResult={affordResult}
                principal={principal}
                rate={rate}
                tenure={tenure}
              />

              {/* 8. Technical Explainability Card (Standard reducing balance formula, DTI, FOIR) */}
              <LendingExplainabilityCard
                monthlyIncome={monthlyIncome}
                existingEMI={existingEMI}
                monthlyExpenses={monthlyExpenses}
                emiResult={emiResult}
                affordResult={affordResult}
              />
            </>
          ) : (
            /* Empty State */
            <Card style={{ padding: '2.5rem 1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.125rem', minHeight: '340px', justifyContent: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '16px', background: 'var(--primary-subtle)', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <TrendingUp size={28} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem', margin: '0 0 0.5rem' }}>
                  Your repayment and guidance will appear here
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.65 }}>
                  Enter your loan, income, and living expenses to generate:
                </p>
                <ul style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textAlign: 'left', display: 'inline-block', marginTop: '0.75rem', lineHeight: 2 }}>
                  <li>Deterministic EMI & Affordability verification</li>
                  <li>Personalized Cash Flow & Net Monthly Cushion</li>
                  <li>Stress Testing against unexpected shocks</li>
                  <li>Prudent Financial Guidance & Next Steps</li>
                </ul>
              </div>
            </Card>
          )}

        </div>
      </div>

      {/* ── TRUST & DISCLAIMER SECTION ── */}
      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '14px', overflow: 'hidden', background: '#FFFFFF', boxShadow: 'var(--shadow-card)' }}>
        <button
          type="button"
          onClick={() => setShowTrust(!showTrust)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={15} color="var(--color-primary)" />
            Why you can trust this calculation & guidance model
          </span>
          {showTrust ? <ChevronUp size={15} color="var(--color-text-muted)" /> : <ChevronDown size={15} color="var(--color-text-muted)" />}
        </button>

        {showTrust && (
          <div style={{ borderTop: '1px solid #F1F5F9' }}>
            <div className="trust-strip" style={{ margin: 0, border: 'none', boxShadow: 'none', borderRadius: 0 }}>
              <div className="trust-item">
                <div className="trust-item-icon"><Calculator size={16} /></div>
                <div className="trust-item-text">
                  <span className="trust-item-title">Standard Reducing Balance EMI</span>
                  <span className="trust-item-desc">Deterministic amortization formula</span>
                </div>
              </div>
              <div className="trust-item">
                <div className="trust-item-icon"><Shield size={16} /></div>
                <div className="trust-item-text">
                  <span className="trust-item-title">50% FOIR Affordability Limit</span>
                  <span className="trust-item-desc">Prudent debt-to-income risk safeguard</span>
                </div>
              </div>
              <div className="trust-item">
                <div className="trust-item-icon"><Eye size={16} /></div>
                <div className="trust-item-text">
                  <span className="trust-item-title">Transparent Grounded Logic</span>
                  <span className="trust-item-desc">Zero simulated or hallucinated numbers</span>
                </div>
              </div>
              <div className="trust-item">
                <div className="trust-item-icon"><Users size={16} /></div>
                <div className="trust-item-text">
                  <span className="trust-item-title">Human Specialist Support</span>
                  <span className="trust-item-desc">Advisory without credit bureau inquiries</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
