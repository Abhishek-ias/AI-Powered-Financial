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
      // Direct call to authoritative backend calculations
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="green">Lending Domain</Badge>
          <Badge variant="blue">Authoritative Math Engine</Badge>
        </div>
        <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>
          Loan Calculator & Affordability Copilot
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          All calculations are strictly computed by backend deterministic math rules — never by LLM hallucination.
        </p>
      </div>

      <div className="grid-2">
        {/* Input Form */}
        <Card>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={18} color="#10b981" />
            Loan Parameters
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Principal Amount (₹)
              </label>
              <input
                type="number"
                value={principal}
                onChange={e => setPrincipal(Number(e.target.value))}
                className="input-text"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Annual Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={e => setRate(Number(e.target.value))}
                  className="input-text"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Tenure (Months)
                </label>
                <input
                  type="number"
                  value={tenure}
                  onChange={e => setTenure(Number(e.target.value))}
                  className="input-text"
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Monthly Income (₹)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(Number(e.target.value))}
                  className="input-text"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Existing EMI (₹)
                </label>
                <input
                  type="number"
                  value={existingEMI}
                  onChange={e => setExistingEMI(Number(e.target.value))}
                  className="input-text"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Querying Backend...' : 'Calculate via Backend API'} <ArrowRight size={16} />
            </button>

            {error && (
              <p style={{ color: '#f87171', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                Error: {error}
              </p>
            )}
          </div>
        </Card>

        {/* Results Card */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} color="#38bdf8" />
              Backend Calculation Result
            </h3>

            {emiResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Estimated Monthly EMI</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    ₹{emiResult.monthlyEMI.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-secondary)' }}> / month</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.8125rem' }}>
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
                  <div style={{ background: affordResult.isAffordable ? 'var(--success-bg)' : 'var(--danger-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${affordResult.isAffordable ? 'var(--success-border)' : 'var(--danger-border)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      {affordResult.isAffordable ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <AlertTriangle size={16} color="#ef4444" />
                      )}
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: affordResult.isAffordable ? '#6ee7b7' : '#fca5a5' }}>
                        {affordResult.isAffordable ? 'Affordability Approved' : 'Exceeds Recommended DTI'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Total DTI: <strong>{affordResult.dtiPercent}%</strong> (Threshold: {affordResult.maxDtiPercent}%) • Risk: {affordResult.riskCategory}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <p>Click "Calculate via Backend API" to query the live backend math service.</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Source: POST /api/lending/calculate-emi
            </span>
            <Badge variant="green" size="sm">Deterministic Formula</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
