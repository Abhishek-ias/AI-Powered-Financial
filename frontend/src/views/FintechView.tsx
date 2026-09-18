import React, { useState } from 'react';
import { CreditCard, Search, ArrowRight, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
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
  const [disputeSubmitted, setDisputeSubmitted] = useState<boolean>(false);

  const handleLookup = async () => {
    setLoading(true);
    setError(null);
    setDisputeSubmitted(false);
    try {
      const res = await fintechApi.getTransaction(txnId);
      setTransaction(res.transaction);

      const issueRes = await fintechApi.classifyIssue(res.transaction.status, true, false);
      setClassification(issueRes);
    } catch (err: any) {
      setError(err.message || 'Transaction lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Payment Dispute Copilot</h1>
          <Badge variant="blue">Automated Triage Engine</Badge>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Instant resolution assistance for failed-but-debited UPI transactions and merchant reconciliation.
        </p>
      </div>

      <div className="grid-2">
        {/* Lookup Card */}
        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} color="var(--primary-light)" />
            <span>Transaction Reference Query</span>
          </h3>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Enter your UPI reference number or card transaction ID:
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              className="input-text"
              placeholder="e.g. TXN-UPI-2024-FAIL-001"
            />
            <button
              onClick={handleLookup}
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: '90px', justifyContent: 'center' }}
            >
              {loading ? '...' : 'Query'}
            </button>
          </div>

          <div style={{ background: 'var(--surface-sunken)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Quick Demo Reference:
            </span>
            <div style={{ marginTop: '0.375rem' }}>
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
            <p style={{ color: 'var(--danger)', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
              {error}
            </p>
          )}
        </Card>

        {/* 29. Transaction Details & Next Action */}
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={16} color="var(--primary-light)" />
              <span>Transaction Status & Evidence</span>
            </h3>

            {transaction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-sunken)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Amount</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      ₹{transaction.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <Badge variant="amber">{transaction.status}</Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 500 }}>
                      Debit detected
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Recipient:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{transaction.recipient}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{transaction.paymentMethod}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Timestamp:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{transaction.date}</strong>
                  </div>
                </div>

                {classification && (
                  <div style={{ background: 'var(--primary-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Clock size={15} color="var(--primary-light)" />
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        What Happened: {classification.classification?.issueType?.replace(/_/g, ' ') || 'FAILED BUT DEBITED'}
                      </strong>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0 0 0.75rem' }}>
                      Auto-reversal cycle: <strong>{classification.resolution?.estimatedDays || 2} business days</strong> via {classification.resolution?.standardResolution || 'NPCI dispute resolution'}.
                    </p>

                    {!disputeSubmitted ? (
                      <button
                        type="button"
                        onClick={() => setDisputeSubmitted(true)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', gap: '0.375rem' }}
                      >
                        <span>Raise Instant Bank Dispute</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--success)', fontSize: '0.8125rem' }}>
                        <CheckCircle2 size={15} />
                        <span>Dispute Ticket #DISP-8921 recorded with banking gateway</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <p>Query a transaction ID above to view automated dispute resolution details.</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Source: GET /api/fintech/transactions
            </span>
            <Badge variant="blue">NPCI Rules</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
