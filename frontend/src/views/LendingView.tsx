import React, { useState } from 'react';
import { DollarSign, Calculator, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { lendingApi } from '../api/lending';
import { LendingEMIResult, LendingAffordabilityResult } from '../types';

export const LendingView: React.FC = () => {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(9.5);
  const [tenure, setTenure] = useState(60);
  const [monthlyIncome, setMonthlyIncome] = useState(70500);
  const [existingEMI, setExistingEMI] = useState(5000);

  const [emiResult, setEmiResult] = useState<LendingEMIResult | null>(null);
  const [affordResult, setAffordResult] = useState<LendingAffordabilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const emi = await lendingApi.calculateEMI(principal, rate, tenure);
      setEmiResult(emi);

      const afford = await lendingApi.checkAffordability(monthlyIncome, existingEMI, emi.monthlyEMI);
      setAffordResult(afford);
    } catch (err: any) {
      setError(err.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Lending Copilot</h1>
          <Badge variant="blue">Deterministic Math Engine</Badge>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Authoritative EMI calculation & debt-to-income affordability checks computed strictly via backend business rules.
        </p>
      </div>

      <div className="grid-2">
        {/* Input Form */}
        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={16} color="var(--primary-light)" />
            <span>Loan & Income Parameters</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>
                Principal Loan Amount (₹)
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="input-text"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>
                  Annual Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="input-text"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>
                  Tenure (Months)
                </label>
                <input
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="input-text"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>
                  Monthly Net Income (₹)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="input-text"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>
                  Existing Monthly EMIs (₹)
                </label>
                <input
                  type="number"
                  value={existingEMI}
                  onChange={(e) => setExistingEMI(Number(e.target.value))}
                  className="input-text"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} />
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <span>Calculate via Backend API</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                Error: {error}
              </p>
            )}
          </div>
        </Card>

        {/* Results Card */}
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={16} color="var(--primary-light)" />
              <span>Calculation Results</span>
            </h3>

            {emiResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--surface-sunken)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Estimated Monthly EMI
                  </span>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                    ₹{emiResult.monthlyEMI.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}> / month</span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.8125rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Total Repayment: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>₹{emiResult.totalRepayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Total Interest: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>₹{emiResult.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                    </div>
                  </div>
                </div>

                {affordResult && (
                  <div
                    style={{
                      background: affordResult.isAffordable ? 'var(--success-bg)' : 'var(--danger-bg)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${affordResult.isAffordable ? 'var(--success-border)' : 'var(--danger-border)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      {affordResult.isAffordable ? (
                        <CheckCircle2 size={16} color="var(--success)" />
                      ) : (
                        <AlertTriangle size={16} color="var(--danger)" />
                      )}
                      {/* Never visually imply: Loan approved */}
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: affordResult.isAffordable ? 'var(--success)' : 'var(--danger)' }}>
                        {affordResult.isAffordable ? 'Affordability Criteria Met' : 'Exceeds Recommended DTI'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Total DTI: <strong>{affordResult.dtiPercent}%</strong> (Recommended threshold: {affordResult.maxDtiPercent}%) • Risk: {affordResult.riskCategory}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <p>Click "Calculate via Backend API" to evaluate real-time repayment estimates.</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Source: POST /api/lending/calculate-emi
            </span>
            <Badge variant="blue">Formula Engine</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
