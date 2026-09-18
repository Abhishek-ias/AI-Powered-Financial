import React, { useState } from 'react';
import { CreditCard, Search, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { fintechApi } from '../api/fintech';
import { FintechTransaction } from '../types';

export const FintechView: React.FC = () => {
  const [txnId, setTxnId] = useState('TXN-UPI-2024-FAIL-001');
  const [transaction, setTransaction] = useState<FintechTransaction | null>(null);
  const [classification, setClassification] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fintechApi.getTransaction(txnId);
      setTransaction(res.transaction);

      const issueRes = await fintechApi.classifyIssue(res.transaction.status, true, false);
      setClassification(issueRes);
    } catch (err: any) {
      setError(err.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="purple">Fintech Domain</Badge>
          <Badge variant="blue">Automated Dispute Triaging</Badge>
        </div>
        <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>
          Payment Dispute & Transaction Status
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Instant classification of failed-but-debited transactions with automated resolution estimates.
        </p>
      </div>

      <div className="grid-2">
        {/* Lookup Card */}
        <Card>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} color="#8b5cf6" />
            Transaction Lookup
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Enter the synthetic UPI or card transaction reference code to query the backend ledger:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={txnId}
              onChange={e => setTxnId(e.target.value)}
              className="input-text"
              placeholder="e.g. TXN-UPI-2024-FAIL-001"
            />
            <button
              onClick={handleLookup}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Querying...' : 'Query'}
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Quick Demo Records:</span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setTxnId('TXN-UPI-2024-FAIL-001')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                TXN-UPI-2024-FAIL-001 (Failed/Debited)
              </button>
            </div>
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
              {error}
            </p>
          )}
        </Card>

        {/* Transaction Details */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="#38bdf8" />
              Transaction Status
            </h3>

            {transaction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                      ₹{transaction.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <Badge variant="amber">{transaction.status}</Badge>
                </div>

                <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Recipient:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{transaction.recipient}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Method:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{transaction.paymentMethod}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{transaction.date}</strong>
                  </div>
                </div>

                {classification && (
                  <div style={{ background: 'var(--purple-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--purple-border)', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Clock size={16} color="#c4b5fd" />
                      <strong style={{ color: '#c4b5fd', fontSize: '0.875rem' }}>
                        Triage: {classification.classification?.issueType || 'FAILED_BUT_DEBITED'}
                      </strong>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      Estimated auto-reversal time: <strong>{classification.resolution?.estimatedDays || 2} business days</strong> ({classification.resolution?.standardResolution || 'NPCI auto-reversal cycle'}).
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Click "Query" to fetch transaction data from backend.
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Source: GET /api/fintech/transactions/:id
            </span>
            <Badge variant="purple" size="sm">Backend API</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
