import React, { useEffect, useState } from 'react';
import { History, Shield, DollarSign, CreditCard, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { journeysApi } from '../api/journeys';
import { Journey } from '../types';

export interface JourneysListViewProps {
  onSelectJourney?: (journey: Journey) => void;
}

export const JourneysListView: React.FC<JourneysListViewProps> = ({ onSelectJourney }) => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJourneys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await journeysApi.listJourneys();
      setJourneys(res.journeys);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch journeys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys();
  }, []);

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'INSURANCE':
        return <Shield size={18} color="#3b82f6" />;
      case 'LENDING':
        return <DollarSign size={18} color="#10b981" />;
      case 'FINTECH':
        return <CreditCard size={18} color="#8b5cf6" />;
      default:
        return <History size={18} color="#94a3b8" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="green">{status}</Badge>;
      case 'NEEDS_ACTION':
      case 'QUERY_RECEIVED':
        return <Badge variant="amber">{status}</Badge>;
      case 'FAILED':
        return <Badge variant="red">{status}</Badge>;
      case 'HUMAN_REVIEW':
        return <Badge variant="purple">{status}</Badge>;
      default:
        return <Badge variant="blue">{status}</Badge>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant="blue">Audit & History</Badge>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>Your Financial Journeys</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            All journeys are persisted in the backend database with cryptographically verifiable audit trails.
          </p>
        </div>
        <button
          onClick={fetchJourneys}
          disabled={loading}
          className="btn btn-secondary"
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {loading ? (
        <Card>
          <LoadingState message="Fetching journeys from backend database..." />
        </Card>
      ) : error ? (
        <ErrorBanner title="Connection Error" message={error} onRetry={fetchJourneys} />
      ) : journeys.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <History size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No journeys recorded yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Start a new journey from the Home screen to see it appear here.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {journeys.map(j => (
            <Card
              key={j.id}
              interactive
              onClick={() => onSelectJourney && onSelectJourney(j)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  {getDomainIcon(j.domain)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {j.domain} — {j.journeyType}
                    </strong>
                    {getStatusBadge(j.status)}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {j.goal || 'General assistance journey'}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {new Date(j.createdAt).toLocaleDateString()} {new Date(j.createdAt).toLocaleTimeString()}
                    </span>
                    <span>ID: {j.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontSize: '0.875rem', fontWeight: 600 }}>
                View Journey <ArrowRight size={14} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
